"""02 · Does ESM-2 cosine separate protein families on a small sample?

L2-prep. Steps up from the 3-sequence sanity check to a curated ~12-
sequence set spanning a few textbook-clean families (see
examples/data/targets_l2prep.json):

  globin          — Hb α, Hb β, myoglobin
  ubiquitin_like  — ubiquitin (two crystal forms)
  lysozyme_c      — hen egg-white lysozyme (three entries)
  other           — adenylate kinase, RNase A, crambin, cytochrome c

The question: is the mean within-family cosine higher than the mean
across-family cosine? This is descriptive only — the sample is far too
small for any statistical claim, and there is no baseline yet. The point
at this stage is to prove the *pipeline* (manifest → fetch → embed →
matrix → JSON artifact) is stable and reproducible before scaling the
sample or the model.

Each target's family label is cross-checked against the structure's
RCSB title in the JSON output, so a mislabelled family is visible.

Run:

    uv run --project packages/core python examples/02_family_separation.py
"""

from __future__ import annotations

from pathlib import Path

from spatium_bio.compare import load_targets, run_comparison, save_result
from spatium_bio.plot import plot_similarity_matrix

REPO_ROOT = Path(__file__).resolve().parents[1]
MANIFEST = REPO_ROOT / "examples" / "data" / "targets_l2prep.json"
RESULT_JSON = REPO_ROOT / "examples" / "results" / "02_family_separation.json"
FIGURE = REPO_ROOT / "examples" / "figures" / "02_family_separation.png"


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

    summary = result["family_summary"]
    within = summary["within_family"]
    across = summary["across_family"]

    print()
    print("family separation (descriptive, tiny n — not a statistic):")
    print(f"  within-family  mean {within['mean']:.4f}  (n={within['n']} pairs)")
    print(f"  across-family  mean {across['mean']:.4f}  (n={across['n']} pairs)")
    print(f"  separation          {summary['separation']:+.4f}")
    print()
    print("  per-family within-family mean:")
    for fam, st in summary["per_family_within"].items():
        if st["mean"] is not None:
            print(f"    {fam:<16} {st['mean']:.4f}  (n={st['n']})")
        else:
            print(f"    {fam:<16} —  (single member)")

    # Cross-check: print each target's curator family next to its RCSB title.
    print()
    print("  curator label vs RCSB title (eyeball for mislabels):")
    for rec in result["targets"]:
        print(f"    {rec['family']:<16} {rec['pdb']} {rec['chain']}  ·  {rec['rcsb_title']}")

    # A soft assertion: on this hand-picked set we expect within > across.
    # If this ever fails it's a finding worth investigating, not a crash —
    # but for the sanity pipeline we keep it as a guard.
    assert summary["separation"] is not None and summary["separation"] > 0, (
        "expected within-family mean to exceed across-family mean on this "
        f"curated set (separation={summary['separation']})"
    )

    print()
    print(f"wrote {RESULT_JSON.relative_to(REPO_ROOT)}")
    print(f"wrote {FIGURE.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
