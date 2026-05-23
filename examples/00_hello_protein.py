"""00 · Hello protein — read 4HHB, print sequence, plot a Cα distance map.

This is the smallest reproducible thing I can build on the way to anything
real. The goal isn't insight — it's to make sure the pipeline (RCSB →
Biopython → numpy → matplotlib) runs end-to-end on my machine.

Run:

    uv run --project packages/core python examples/00_hello_protein.py

Output:

    examples/figures/00_4hhb_calpha_distance.png
"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

from spatium_bio import (
    compute_ca_distance_matrix,
    extract_chain_ca,
    fetch_pdb,
    parse_structure,
)

PDB_ID = "4HHB"
CHAIN_ID = "A"

# FIELD｜场域 palette — keep figures visually consistent with the website.
PAPER = "#f6f3ee"
INK = "#1f1e1b"
MUTED = "#6b6760"
BRAND = "#c15f3c"


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    figures_dir = repo_root / "examples" / "figures"
    figures_dir.mkdir(parents=True, exist_ok=True)
    cache_dir = repo_root / ".cache" / "pdb"

    print(f"[1/4] fetching {PDB_ID} from RCSB → {cache_dir}")
    pdb_path = fetch_pdb(PDB_ID, cache_dir=cache_dir)

    print(f"[2/4] parsing {pdb_path.name}")
    structure = parse_structure(pdb_path)

    print(f"[3/4] extracting chain {CHAIN_ID} Cα backbone")
    sequence, coords, residues = extract_chain_ca(structure, chain_id=CHAIN_ID)
    n = coords.shape[0]
    print(f"      residues: {n} · first 20 aa: {sequence[:20]}")
    print(f"      first residue: {residues[0]}  last residue: {residues[-1]}")

    print("[4/4] computing Cα–Cα distance matrix and plotting")
    distance_matrix = compute_ca_distance_matrix(coords)

    # Sanity check: closest non-self pair is between sequence neighbours,
    # roughly 3.8 Å for adjacent Cα atoms in a backbone.
    off_diag = distance_matrix + np.eye(n) * 1e9
    closest = float(off_diag.min())
    median_neighbour = float(np.median(np.diag(distance_matrix, k=1)))
    print(f"      closest non-self Cα pair: {closest:.2f} Å")
    print(f"      median adjacent Cα step:  {median_neighbour:.2f} Å")

    fig, ax = plt.subplots(figsize=(6.4, 5.6), facecolor=PAPER)
    ax.set_facecolor(PAPER)
    image = ax.imshow(
        distance_matrix,
        cmap="magma_r",
        vmin=0.0,
        vmax=float(np.percentile(distance_matrix, 98)),
        origin="lower",
        interpolation="nearest",
    )
    ax.set_title(
        f"{PDB_ID} chain {CHAIN_ID} · Cα–Cα distance (Å)",
        fontsize=11,
        color=INK,
        loc="left",
        pad=12,
    )
    ax.set_xlabel("residue index", color=MUTED, fontsize=9)
    ax.set_ylabel("residue index", color=MUTED, fontsize=9)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.6)
    ax.tick_params(colors=MUTED, labelsize=8, length=3, width=0.6)

    cbar = fig.colorbar(image, ax=ax, fraction=0.045, pad=0.025)
    cbar.outline.set_edgecolor(MUTED)
    cbar.outline.set_linewidth(0.6)
    cbar.ax.tick_params(colors=MUTED, labelsize=8, length=3, width=0.6)
    cbar.set_label("Å", color=MUTED, fontsize=9)

    fig.text(
        0.5,
        0.02,
        f"n = {n} residues · source: RCSB · spatium-bio v0.0.1",
        ha="center",
        color=MUTED,
        fontsize=8,
    )
    fig.subplots_adjust(left=0.10, right=0.96, top=0.92, bottom=0.10)

    out_path = figures_dir / "00_4hhb_calpha_distance.png"
    fig.savefig(out_path, dpi=200, facecolor=fig.get_facecolor())
    plt.close(fig)

    # Sentinel for the brick-orange diagonal band: in a folded protein the
    # values closest to the diagonal should be small (≈3.8 Å) and grow
    # with sequence separation.
    assert closest < 5.0, "neighbouring Cα atoms should be ~3.8 Å apart"
    print(f"\nwrote {out_path.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
