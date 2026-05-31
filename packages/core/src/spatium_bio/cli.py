"""Command-line interface for spatium-bio.

Minimal on purpose — argparse from the standard library, no extra deps.

    spatium-bio embed-compare --targets targets.json --out results.json
    spatium-bio embed-compare --targets targets.json --out results.json \
        --model facebook/esm2_t12_35M_UR50D --device cpu --figure fig.png
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from spatium_bio import __version__
from spatium_bio.embed import DEFAULT_MODEL


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="spatium-bio",
        description="A small toolkit for embedding and comparing proteins.",
    )
    parser.add_argument("--version", action="version", version=f"spatium-bio {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)

    ec = sub.add_parser(
        "embed-compare",
        help="Embed a manifest of proteins and write a cosine-similarity result.",
    )
    ec.add_argument(
        "--targets",
        required=True,
        type=Path,
        help="Path to a targets manifest JSON ({'targets': [...]}).",
    )
    ec.add_argument(
        "--out",
        required=True,
        type=Path,
        help="Path to write the result JSON.",
    )
    ec.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"HuggingFace model id (default: {DEFAULT_MODEL}).",
    )
    ec.add_argument(
        "--device",
        default=None,
        help="Force a device (cpu / cuda / mps). Default: auto-detect.",
    )
    ec.add_argument(
        "--cache-dir",
        default=".cache/pdb",
        type=Path,
        help="Where to cache downloaded PDB files (default: .cache/pdb).",
    )
    ec.add_argument(
        "--figure",
        default=None,
        type=Path,
        help="Optional path to also write a similarity-matrix PNG.",
    )
    ec.set_defaults(func=_cmd_embed_compare)
    return parser


def _cmd_embed_compare(args: argparse.Namespace) -> int:
    # Imported lazily so `spatium-bio --help` doesn't pull in torch.
    from spatium_bio.compare import load_targets, run_comparison, save_result

    targets = load_targets(args.targets)
    print(
        f"embed-compare · {len(targets)} targets · model {args.model}",
        file=sys.stderr,
    )
    result = run_comparison(
        targets,
        model_name=args.model,
        device=args.device,
        cache_dir=args.cache_dir,
        verbose=True,
    )
    out = save_result(result, args.out)
    print(f"wrote {out}", file=sys.stderr)

    summary = result["family_summary"]
    within = summary["within_family"]
    across = summary["across_family"]
    if within["mean"] is not None and across["mean"] is not None:
        print(
            f"within-family mean {within['mean']:.4f} "
            f"(n={within['n']})  vs  "
            f"across-family mean {across['mean']:.4f} "
            f"(n={across['n']})  ·  separation {summary['separation']:+.4f}",
            file=sys.stderr,
        )

    if args.figure is not None:
        from spatium_bio.plot import plot_similarity_matrix

        fig_path = plot_similarity_matrix(result, args.figure)
        print(f"wrote {fig_path}", file=sys.stderr)

    return 0


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
