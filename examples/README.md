# Examples

Each numbered script is a reproducible end-to-end run. I keep them as `.py`
rather than notebooks so they are version-controllable, lintable, and
runnable in CI later.

| # | Script | What it does | Needs network |
| - | ------ | ------------ | ------------- |
| 00 | [`00_hello_protein.py`](00_hello_protein.py) | Fetch 4HHB, plot Cα distance map | first run only |

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
