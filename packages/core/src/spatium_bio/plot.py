"""Plotting helpers for comparison results.

Kept separate from compare.py so the analysis path never imports
matplotlib unless a figure is actually requested.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

# FIELD｜场域 palette — keep figures consistent with the website.
PAPER = "#f6f3ee"
INK = "#1f1e1b"
MUTED = "#6b6760"
BRAND = "#c15f3c"


def plot_similarity_matrix(result: dict, out_path: str | Path) -> Path:
    """Render a cosine-similarity matrix PNG from a run_comparison result."""
    import matplotlib.pyplot as plt

    matrix = np.asarray(result["cosine_similarity_matrix"]["values"], dtype=np.float64)
    records = result["targets"]
    labels = [r["label"] for r in records]
    families = [r["family"] for r in records]
    n = len(labels)
    model = result["provenance"]["model"].split("/")[-1]
    version = result["provenance"]["versions"].get("spatium_bio", "")

    # Annotation font shrinks as the matrix grows.
    annot = n <= 14
    fontsize = 9 if n <= 8 else (7 if n <= 12 else 6)

    fig, ax = plt.subplots(figsize=(max(5.2, n * 0.55), max(4.6, n * 0.5)), facecolor=PAPER)
    ax.set_facecolor(PAPER)
    vmin = float(matrix.min())
    im = ax.imshow(matrix, cmap="magma_r", vmin=vmin, vmax=1.0)

    ax.set_xticks(range(n), labels, color=INK, rotation=45, ha="right", fontsize=8)
    ax.set_yticks(range(n), labels, color=INK, fontsize=8)
    ax.set_title(
        f"ESM-2 · mean-pooled cosine similarity ({n} sequences)",
        loc="left",
        fontsize=11,
        color=INK,
        pad=12,
    )
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.6)
    ax.tick_params(colors=MUTED, length=3, width=0.6)

    # Draw thin separators between family blocks (visual grouping only;
    # assumes the manifest is already ordered by family).
    boundaries = [i for i in range(1, n) if families[i] != families[i - 1]]
    for b in boundaries:
        ax.axhline(b - 0.5, color=PAPER, linewidth=1.2)
        ax.axvline(b - 0.5, color=PAPER, linewidth=1.2)

    if annot:
        mid = (vmin + 1.0) / 2
        for i in range(n):
            for j in range(n):
                value = matrix[i, j]
                colour = PAPER if value > mid else INK
                ax.text(
                    j, i, f"{value:.2f}",
                    ha="center", va="center", color=colour, fontsize=fontsize,
                )

    cbar = fig.colorbar(im, ax=ax, fraction=0.045, pad=0.025)
    cbar.outline.set_edgecolor(MUTED)
    cbar.outline.set_linewidth(0.6)
    cbar.ax.tick_params(colors=MUTED, length=3, width=0.6, labelsize=8)

    fig.text(
        0.5, 0.015,
        f"n = {n} sequences · model: {model} · spatium-bio v{version}",
        ha="center", color=MUTED, fontsize=8,
    )
    fig.tight_layout(rect=(0, 0.03, 1, 1))

    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=200, facecolor=fig.get_facecolor())
    plt.close(fig)
    return out
