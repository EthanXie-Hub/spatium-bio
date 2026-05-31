# `spatium-bio` · core

The Python library for Spatium Bio. Today it does two things:
protein I/O (fetch / parse / Cα extraction) and per-residue embeddings
via ESM-2. Everything else lives in the road map.

## What's here

| Module | Purpose |
| ------ | ------- |
| `spatium_bio.io` | Fetch / parse PDB, extract chain Cα, compute distance matrix |
| `spatium_bio.embed` | Load ESM-2, embed a sequence, mean-pool, cosine similarity |
| `spatium_bio.compare` | Run an embed-and-compare experiment over a targets manifest |
| `spatium_bio.plot` | Render a cosine-similarity matrix figure |
| `spatium_bio.cli` | `spatium-bio` command-line entry point |

## What isn't (and what each gap blocks)

- `manifold.py` — no learned space over embeddings yet, no retrieval / clustering
- `readouts.py` — no function or fold-similarity head
- No fine-tuned or custom-trained encoder; ESM-2 35M is used as-is

## CLI

```bash
spatium-bio --help
spatium-bio embed-compare \
  --targets examples/data/targets_l2prep.json \
  --out result.json \
  --figure result.png
```

A targets manifest is `{"targets": [{"id", "pdb", "chain", "family", "label"}, ...]}`.
Everything else (sequence, residue count, RCSB title) is derived from the
fetched structure, so the only human assertions are `family` and `label`.

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

## Examples

### Protein I/O

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

### ESM-2 embeddings

```python
from spatium_bio import embed_sequence, mean_pool, cosine_similarity

# 35M model, default; downloads ~150MB on first call.
hb_alpha = embed_sequence("VLSPADKTNVKAAW…")   # (L, 480)
hb_beta  = embed_sequence("VHLTPEEKSAVTAL…")   # (L, 480)

similarity = cosine_similarity(mean_pool(hb_alpha), mean_pool(hb_beta))
print(f"{similarity:.4f}")   # ~0.97 — paralogs cluster
```

See `examples/01_embed_and_compare.py` for the three-protein sanity
check (Hb α paralog of Hb β, both far from adenylate kinase).
