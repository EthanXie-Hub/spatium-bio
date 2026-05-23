# `spatium-bio` · core

The Python library for Spatium Bio. Today this is **only** protein I/O —
fetching a PDB file from RCSB, parsing it with Biopython, and extracting
Cα coordinates. Everything else lives in the road map.

## What's here

| Module | Purpose |
| ------ | ------- |
| `spatium_bio.io` | Fetch / parse PDB, extract chain Cα, compute distance matrix |

## What isn't (and what each gap blocks)

- `embed.py` — no encoder yet, no embedding API
- `manifold.py` — no learned space yet, no retrieval / clustering
- `readouts.py` — no function or fold-similarity head
- `cli.py` — no entry point yet; importable Python only

## Develop

[`uv`](https://docs.astral.sh/uv/) is the project manager.

```bash
cd packages/core
uv sync --all-groups        # install runtime + dev deps
uv run pytest -m "not network"   # offline tests
uv run pytest -m network    # online test, hits RCSB once
uv run ruff check src tests
```

Python 3.11+. The package is `import spatium_bio`.

## Example

```python
from spatium_bio import (
    fetch_pdb, parse_structure, extract_chain_ca, compute_ca_distance_matrix,
)

path = fetch_pdb("4HHB")
structure = parse_structure(path)
sequence, coords, residues = extract_chain_ca(structure, chain_id="A")
distance_matrix = compute_ca_distance_matrix(coords)
print(sequence[:20], distance_matrix.shape)
# VLSPADKTNVKAAWGKVGAH (141, 141)
```

See `examples/00_hello_protein.py` for the full hello-protein walk.
