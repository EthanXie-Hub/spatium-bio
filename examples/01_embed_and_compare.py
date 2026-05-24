"""01 · Embed three proteins and compare their cosine similarity.

The point of this script is the smallest possible end-to-end:

  PDB ID  →  sequence  →  ESM-2 embedding  →  cosine similarity

Three structures, chosen so the similarities have a predictable
biological ordering:

  - 4HHB chain A  : human hemoglobin α (141 aa)
  - 4HHB chain B  : human hemoglobin β (146 aa) — paralog of α
  - 1AKE chain A  : E. coli adenylate kinase (214 aa) — unrelated fold

Expected ordering of mean-pooled cosine similarity:

  α vs α  =  1.000               (self-similarity)
  α vs β  >  α vs adenylate kinase
  β vs β  =  1.000
  (the two paralogs should be more similar to each other than either
   is to the unrelated enzyme)

I do not hard-code the actual numbers — they are whatever the 35M
model returns. The script prints them and asserts only the ordering.

Run:

    uv run --project packages/core python examples/01_embed_and_compare.py

First run downloads the model (~150MB) and takes ~30 sec; subsequent
runs are cached.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

from spatium_bio import (
    DEFAULT_MODEL,
    cosine_similarity,
    embed_sequence,
    extract_chain_ca,
    fetch_pdb,
    load_encoder,
    mean_pool,
    parse_structure,
)

# Same palette as the website / 00_hello_protein.py.
PAPER = "#f6f3ee"
INK = "#1f1e1b"
MUTED = "#6b6760"
BRAND = "#c15f3c"

TARGETS = [
    ("4HHB", "A", "Hb α"),
    ("4HHB", "B", "Hb β"),
    ("1AKE", "A", "AdK"),
]


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    cache_dir = repo_root / ".cache" / "pdb"
    figures_dir = repo_root / "examples" / "figures"
    figures_dir.mkdir(parents=True, exist_ok=True)

    print(f"[1/4] loading encoder · {DEFAULT_MODEL}")
    handle = load_encoder(device="cpu")
    print(f"      {handle}")

    print("[2/4] fetching + extracting sequences")
    sequences: dict[str, str] = {}
    for pdb_id, chain_id, label in TARGETS:
        path = fetch_pdb(pdb_id, cache_dir=cache_dir)
        structure = parse_structure(path)
        sequence, _, _ = extract_chain_ca(structure, chain_id=chain_id)
        sequences[label] = sequence
        print(f"      {label:5}  {pdb_id} chain {chain_id}  · n = {len(sequence):3} aa")

    print("[3/4] computing per-residue embeddings + mean-pooling")
    pooled: dict[str, np.ndarray] = {}
    for label, sequence in sequences.items():
        emb = embed_sequence(sequence)
        pooled[label] = mean_pool(emb)
        print(f"      {label:5}  shape={emb.shape}  pooled={pooled[label].shape}")

    print("[4/4] cosine similarity matrix")
    labels = list(pooled.keys())
    n = len(labels)
    sim = np.zeros((n, n), dtype=np.float64)
    for i, a in enumerate(labels):
        for j, b in enumerate(labels):
            sim[i, j] = cosine_similarity(pooled[a], pooled[b])

    print()
    header = "       " + "  ".join(f"{label:>7}" for label in labels)
    print(header)
    for i, label in enumerate(labels):
        row = "  ".join(f"{sim[i, j]:7.4f}" for j in range(n))
        print(f"  {label:5} {row}")
    print()

    # Sanity checks — ordering only, no hard-coded magnitudes.
    sim_self_a = sim[0, 0]
    sim_self_b = sim[1, 1]
    sim_alpha_beta = sim[0, 1]
    sim_alpha_adk = sim[0, 2]
    sim_beta_adk = sim[1, 2]

    # Self-similarity should be 1 up to float64 rounding noise.
    assert abs(sim_self_a - 1.0) < 1e-6 and abs(sim_self_b - 1.0) < 1e-6, (
        "self-similarity should be ~1"
    )
    assert sim_alpha_beta > sim_alpha_adk, (
        f"expected Hb α–β paralog similarity ({sim_alpha_beta:.4f}) "
        f"to exceed Hb α–AdK unrelated similarity ({sim_alpha_adk:.4f})"
    )
    assert sim_alpha_beta > sim_beta_adk, (
        f"expected Hb α–β paralog similarity ({sim_alpha_beta:.4f}) "
        f"to exceed Hb β–AdK unrelated similarity ({sim_beta_adk:.4f})"
    )
    print("ordering check passed:")
    print(f"  Hb α–β paralog ({sim_alpha_beta:.4f})")
    print(f"  > Hb α–AdK    ({sim_alpha_adk:.4f})")
    print(f"  > Hb β–AdK    ({sim_beta_adk:.4f})")

    # Plot the matrix.
    fig, ax = plt.subplots(figsize=(5.2, 4.6), facecolor=PAPER)
    ax.set_facecolor(PAPER)
    im = ax.imshow(sim, cmap="magma_r", vmin=sim.min(), vmax=1.0)
    ax.set_xticks(range(n), labels, color=INK)
    ax.set_yticks(range(n), labels, color=INK)
    ax.set_title(
        "ESM-2 35M · mean-pooled cosine similarity",
        loc="left",
        fontsize=11,
        color=INK,
        pad=12,
    )
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.6)
    ax.tick_params(colors=MUTED, length=3, width=0.6)

    # Annotate each cell.
    for i in range(n):
        for j in range(n):
            value = sim[i, j]
            colour = PAPER if value > (sim.min() + 1.0) / 2 else INK
            ax.text(
                j, i, f"{value:.3f}",
                ha="center", va="center", color=colour, fontsize=9,
            )

    cbar = fig.colorbar(im, ax=ax, fraction=0.045, pad=0.025)
    cbar.outline.set_edgecolor(MUTED)
    cbar.outline.set_linewidth(0.6)
    cbar.ax.tick_params(colors=MUTED, length=3, width=0.6, labelsize=8)

    fig.text(
        0.5, 0.02,
        f"n = 3 sequences · model: {DEFAULT_MODEL.split('/')[-1]} · spatium-bio v0.1.0",
        ha="center", color=MUTED, fontsize=8,
    )
    fig.subplots_adjust(left=0.16, right=0.96, top=0.90, bottom=0.14)

    out_path = figures_dir / "01_esm2_cosine_similarity.png"
    fig.savefig(out_path, dpi=200, facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"\nwrote {out_path.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
