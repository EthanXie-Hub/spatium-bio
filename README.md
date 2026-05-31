# Spatium Bio

A workspace for computational biology. I'm building it while learning the
field, in public, under MIT.

→ [https://github.com/EthanXie-Hub/spatium-bio](https://github.com/EthanXie-Hub/spatium-bio)

## What this is

I'm a designer learning computational biology. Spatium Bio is the workspace
I want to use as I learn — eventually, a single coordinate system where
structure retrieval, function readouts, and generative sampling share one
manifold.

Today there is a minimal Python core (PDB I/O, ESM-2 35M sequence
embeddings, mean-pooled cosine similarity sanity check) and a Next.js
landing page with a decorative 3D figure. There is no manifold yet, no
scale benchmark, no function/fold readouts, and no generation. I'm
shipping it early because building in public is more honest than building
in secret.

## What works · what doesn't

**Works**

- Landing page (this repo's public face)
- Static 3D figure in React Three Fiber
- Design system aligned with FIELD｜场域 (warm cream, near-black, brick orange)
- Python core package `spatium-bio`:
  - PDB I/O — fetch / parse / Cα extraction (`spatium_bio.io`)
  - ESM-2 embeddings — per-residue, mean-pool, cosine similarity (`spatium_bio.embed`)
  - embed-and-compare pipeline over a targets manifest, emitting a JSON
    artifact with full provenance (`spatium_bio.compare`)
  - a `spatium-bio embed-compare` CLI
  - 27 tests passing (24 offline + 3 network)
- Reproducible hello-protein script — 4HHB → Cα distance map
  (`examples/00_hello_protein.py`)
- Reproducible embed-and-compare script — Hb α–β cosine (0.978) is
  higher than Hb–AdK cosine (≈ 0.70) in a 3-sequence sanity check
  (`examples/01_embed_and_compare.py`)
- A 12-sequence family-separation run as L2 prep — within-family cosine
  (globin 0.976) sits above the across-family mean (≈ 0.73); see the
  honest caveats in `examples/data/targets_l2prep.json`
  (`examples/02_family_separation.py`)
- Result artifacts auto-written under `examples/results/`
- Build log of what I'm learning (`docs/notes/`)
- Repo + MIT license

**Doesn't (yet)**

- A trained or fine-tuned encoder of my own (using ESM-2 35M as-is)
- A manifold or projection over embeddings (UMAP / PCA)
- Function or fold-similarity readouts at scale
- Generation / sampling
- A real benchmark — the 12-sequence run has redundant members and no
  baseline; it proves the pipeline, not the science
- A public API

I'll update both lists as things move.

## Run it

The web workspace:

```bash
git clone https://github.com/EthanXie-Hub/spatium-bio.git
cd spatium-bio/apps/web
npm install
npm run dev          # http://localhost:3000
```

Node 20+. No keys needed.

The Python core (`spatium-bio`) — needs [`uv`](https://docs.astral.sh/uv/):

```bash
cd spatium-bio
uv sync --all-groups --project packages/core

# 1. PDB I/O — fetch 4HHB, plot Cα distance map
uv run --project packages/core python examples/00_hello_protein.py
# → examples/figures/00_4hhb_calpha_distance.png

# 2. ESM-2 embeddings — three proteins, cosine similarity matrix
#    first run downloads facebook/esm2_t12_35M_UR50D (~150MB)
uv run --project packages/core python examples/01_embed_and_compare.py
# → examples/figures/01_esm2_cosine_similarity.png
```

Python 3.11+. Tests live under `packages/core/tests/`; run with
`uv run --project packages/core pytest -m "not network"` for the
offline suite (skips the model download).

## Contact

I'd genuinely like to hear from people in the field, especially if any of
the framing above sounds wrong.

- Email · `nyssa520ethan@gmail.com`
- Issues · [github.com/EthanXie-Hub/spatium-bio/issues](https://github.com/EthanXie-Hub/spatium-bio/issues)

## License

MIT. See [LICENSE](LICENSE).
