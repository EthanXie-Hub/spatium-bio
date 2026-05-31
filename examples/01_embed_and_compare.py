"""01 · Embed three proteins and compare their cosine similarity.

The smallest possible end-to-end:

  PDB ID  →  sequence  →  ESM-2 embedding  →  cosine similarity

Three structures (see examples/data/targets_sanity3.json), chosen so the
similarities have a predictable biological ordering:

  - 4HHB chain A : human hemoglobin α  (globin)
  - 4HHB chain B : human hemoglobin β  (globin, paralog of α)
  - 1AKE chain A : E. coli adenylate kinase (unrelated fold)

The two globins should be more similar to each other than either is to
the unrelated enzyme. The script asserts only that ordering; the actual
numbers are whatever the 35M model returns, and they are written —
together with full provenance — to a JSON artifact (no hand-filling).

Run:

    uv run --project packages/core python examples/01_embed_and_compare.py

First run downloads the model (~150MB); subsequent runs are cached.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

from spatium_bio.compare import load_targets, run_comparison, save_result
from spatium_bio.plot import plot_similarity_matrix

REPO_ROOT = Path(__file__).resolve().parents[1]
MANIFEST = REPO_ROOT / "examples" / "data" / "targets_sanity3.json"
RESULT_JSON = REPO_ROOT / "examples" / "results" / "01_esm2_cosine_similarity.json"
FIGURE = REPO_ROOT / "examples" / "figures" / "01_esm2_cosine_similarity.png"


def main() -> None:
    targets = load_targets(MANIFEST)
    print(f"loaded {len(targets)} targets from {MANIFEST.name}")

    result = run_comparison(
        targets,
        device="cpu",
        cache_dir=REPO_ROOT / ".cache" / "pdb",
        repo_hint=REPO_ROOT,
        verbose=True,
    )

    save_result(result, RESULT_JSON)
    plot_similarity_matrix(result, FIGURE)

    # Print the matrix.
    labels = result["cosine_similarity_matrix"]["order"]
    matrix = np.asarray(result["cosine_similarity_matrix"]["values"])
    index = {label: i for i, label in enumerate(labels)}
    print()
    print("       " + "  ".join(f"{lab:>9}" for lab in labels))
    for i, lab in enumerate(labels):
        row = "  ".join(f"{matrix[i, j]:9.4f}" for j in range(len(labels)))
        print(f"  {lab:<6} {row}")
    print()

    # Ordering assertions — paralogs above unrelated.
    ab = matrix[index["Hb_alpha"], index["Hb_beta"]]
    a_adk = matrix[index["Hb_alpha"], index["AdK"]]
    b_adk = matrix[index["Hb_beta"], index["AdK"]]
    assert ab > a_adk, f"expected Hb α–β ({ab:.4f}) > Hb α–AdK ({a_adk:.4f})"
    assert ab > b_adk, f"expected Hb α–β ({ab:.4f}) > Hb β–AdK ({b_adk:.4f})"

    print("ordering check passed:")
    print(f"  Hb α–β globin pair ({ab:.4f})")
    print(f"  > Hb α–AdK         ({a_adk:.4f})")
    print(f"  > Hb β–AdK         ({b_adk:.4f})")
    print()
    print(f"wrote {RESULT_JSON.relative_to(REPO_ROOT)}")
    print(f"wrote {FIGURE.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
