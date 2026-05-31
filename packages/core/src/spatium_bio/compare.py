"""Run an embed-and-compare experiment over a manifest of protein targets.

This is the pipeline the CLI and the example scripts share. It:

1. loads a targets manifest (JSON)
2. fetches each structure from RCSB and extracts the chain sequence
3. embeds each sequence with ESM-2 and mean-pools
4. builds the full cosine-similarity matrix
5. summarises within-family vs across-family similarity
6. records enough provenance to reproduce the run exactly

The pure, side-effect-free pieces (cosine_matrix, summarise_families) are
separated out so they can be unit-tested without a model or a network.
"""

from __future__ import annotations

import json
import platform
import subprocess
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from itertools import combinations
from pathlib import Path

import numpy as np

from spatium_bio import __version__
from spatium_bio.embed import (
    DEFAULT_MODEL,
    _resolve_device,
    embed_sequence,
    mean_pool,
)
from spatium_bio.io import extract_chain_ca, fetch_pdb, parse_structure


@dataclass(frozen=True)
class Target:
    """One row of the manifest. The only assertions a human makes are
    ``family`` and ``label`` — everything else is derived from the actual
    structure at run time and cross-checked against the RCSB title."""

    id: str
    pdb: str
    chain: str
    family: str
    label: str


def load_targets(path: str | Path) -> list[Target]:
    """Parse a targets manifest. Expects ``{"targets": [ {...}, ... ]}``."""
    data = json.loads(Path(path).read_text())
    raw = data["targets"] if isinstance(data, dict) else data
    targets: list[Target] = []
    seen_ids: set[str] = set()
    for entry in raw:
        target = Target(
            id=str(entry["id"]),
            pdb=str(entry["pdb"]).upper(),
            chain=str(entry["chain"]),
            family=str(entry["family"]),
            label=str(entry["label"]),
        )
        if target.id in seen_ids:
            raise ValueError(f"duplicate target id {target.id!r} in manifest")
        seen_ids.add(target.id)
        targets.append(target)
    if len(targets) < 2:
        raise ValueError("manifest needs at least 2 targets to compare")
    return targets


# --- pure helpers (no model, no network) -----------------------------


def cosine_matrix(vectors: list[np.ndarray]) -> np.ndarray:
    """Full pairwise cosine-similarity matrix for a list of 1-D vectors.

    Returns an ``(N, N)`` float64 array; symmetric, diagonal ~1.0.
    """
    if len(vectors) < 2:
        raise ValueError("need at least 2 vectors")
    mat = np.stack([np.asarray(v, dtype=np.float64).ravel() for v in vectors])
    norms = np.linalg.norm(mat, axis=1, keepdims=True)
    if np.any(norms == 0):
        raise ValueError("cannot compute cosine similarity for a zero vector")
    unit = mat / norms
    return unit @ unit.T


def summarise_families(
    families: list[str],
    matrix: np.ndarray,
) -> dict:
    """Descriptive within-family vs across-family summary.

    Looks at every unordered off-diagonal pair, splits them into
    same-family vs different-family, and reports mean/min/max/n for each
    group plus per-family intra means. No statistics beyond description —
    n is far too small for inference and we do not pretend otherwise.
    """
    n = len(families)
    if matrix.shape != (n, n):
        raise ValueError(f"matrix shape {matrix.shape} does not match {n} families")

    intra: list[float] = []
    inter: list[float] = []
    per_family: dict[str, list[float]] = {}

    for i, j in combinations(range(n), 2):
        value = float(matrix[i, j])
        if families[i] == families[j]:
            intra.append(value)
            per_family.setdefault(families[i], []).append(value)
        else:
            inter.append(value)

    def stats(values: list[float]) -> dict:
        if not values:
            return {"n": 0, "mean": None, "min": None, "max": None}
        arr = np.asarray(values, dtype=np.float64)
        return {
            "n": len(values),
            "mean": float(arr.mean()),
            "min": float(arr.min()),
            "max": float(arr.max()),
        }

    return {
        "within_family": stats(intra),
        "across_family": stats(inter),
        "per_family_within": {
            fam: stats(vals) for fam, vals in sorted(per_family.items())
        },
        "separation": (
            float(np.mean(intra) - np.mean(inter))
            if intra and inter
            else None
        ),
    }


def _git_commit(repo_hint: Path) -> str | None:
    try:
        out = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=repo_hint,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
        return out.stdout.strip() or None
    except Exception:
        return None


def _provenance(model_name: str, device: str, repo_hint: Path) -> dict:
    versions: dict[str, str | None] = {
        "python": platform.python_version(),
        "spatium_bio": __version__,
    }
    for mod in ("numpy", "torch", "transformers"):
        try:
            versions[mod] = __import__(mod).__version__
        except Exception:
            versions[mod] = None
    return {
        "timestamp_utc": datetime.now(UTC).isoformat(timespec="seconds"),
        "git_commit": _git_commit(repo_hint),
        "platform": platform.platform(),
        "device": device,
        "model": model_name,
        "versions": versions,
    }


# --- orchestration (model + network) ---------------------------------


def run_comparison(
    targets: list[Target],
    model_name: str = DEFAULT_MODEL,
    device: str | None = None,
    cache_dir: str | Path = ".cache/pdb",
    repo_hint: str | Path | None = None,
    verbose: bool = False,
) -> dict:
    """Fetch, embed, compare. Returns a fully serialisable result dict."""
    resolved = _resolve_device(device)
    repo = Path(repo_hint) if repo_hint else Path.cwd()

    records: list[dict] = []
    pooled: list[np.ndarray] = []

    for idx, t in enumerate(targets, start=1):
        path = fetch_pdb(t.pdb, cache_dir=cache_dir)
        structure = parse_structure(path)
        sequence, _, _ = extract_chain_ca(structure, chain_id=t.chain)
        embedding = embed_sequence(sequence, model_name=model_name, device=resolved)
        pooled.append(mean_pool(embedding))

        title = structure.header.get("name") or None
        records.append(
            {
                "id": t.id,
                "label": t.label,
                "family": t.family,
                "pdb": t.pdb,
                "chain": t.chain,
                "n_residues": len(sequence),
                "embedding_dim": int(embedding.shape[1]),
                "rcsb_title": title.strip() if isinstance(title, str) else title,
            }
        )
        if verbose:
            print(
                f"  [{idx}/{len(targets)}] {t.label:<10} {t.pdb} {t.chain} "
                f"· {len(sequence):>3} aa · {title}"
            )

    matrix = cosine_matrix(pooled)
    families = [t.family for t in targets]
    labels = [t.id for t in targets]

    return {
        "experiment": "embed_compare",
        "provenance": _provenance(model_name, resolved, repo),
        "embedding": {
            "method": "ESM-2 per-residue final hidden states, mean-pooled",
            "metric": "cosine_similarity",
        },
        "targets": records,
        "cosine_similarity_matrix": {
            "order": labels,
            "values": matrix.tolist(),
        },
        "family_summary": summarise_families(families, matrix),
        "caveats": [
            "Family labels are curator assertions; cross-check against each "
            "target's rcsb_title.",
            "Sample size is tiny — within/across separation is descriptive, "
            "not a statistical claim.",
            "Mean-pooling discards positional structure.",
            "Cosine similarity in ESM-2 space sits in a narrow band; it is "
            "not a probability.",
            "No baseline (random vectors, k-mer, BLOSUM) and no structural "
            "metric (TM-score) compared here.",
        ],
    }


def save_result(result: dict, path: str | Path) -> Path:
    """Write the result dict to JSON. Returns the path."""
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2) + "\n")
    return out


# convenience for callers that have asdict-able targets
def targets_to_manifest(targets: list[Target]) -> dict:
    return {"targets": [asdict(t) for t in targets]}
