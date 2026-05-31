# Examples

Each numbered script is a reproducible end-to-end run. I keep them as `.py`
rather than notebooks so they are version-controllable, lintable, and
runnable in CI later.

| # | Script | What it does | Needs network |
| - | ------ | ------------ | ------------- |
| 00 | [`00_hello_protein.py`](00_hello_protein.py) | Fetch 4HHB, plot Cα distance map | first run only |
| 01 | [`01_embed_and_compare.py`](01_embed_and_compare.py) | Embed 3 proteins (manifest), cosine matrix, JSON + figure | first run only (~150MB model) |
| 02 | [`02_family_separation.py`](02_family_separation.py) | Embed a 12-sequence multi-family set, within- vs across-family summary | first run only |

Targets manifests live in [`data/`](data/); result JSON artifacts are
written to [`results/`](results/) and figures to [`figures/`](figures/).

You can also run the pipeline without a script via the CLI:

```bash
uv run --project packages/core spatium-bio embed-compare \
  --targets examples/data/targets_l2prep.json \
  --out examples/results/02_family_separation.json \
  --figure examples/figures/02_family_separation.png
```

## Run

```bash
# Once, from the repo root:
uv sync --all-groups --project packages/core

# Then any example:
uv run --project packages/core python examples/00_hello_protein.py
```

Figures land in `examples/figures/`.

## Conventions

- One self-contained `main()` per script.
- Deterministic. If randomness shows up, set a seed at the top and print it.
- No silent failures — every script asserts at least one sanity check.
- Figures use the FIELD｜场域 palette (`paper #f6f3ee`, `ink #1f1e1b`,
  `brand #c15f3c`) so they read consistently next to the website.
