# Spatium Bio

A workspace for computational biology. I'm building it while learning the
field, in public, under MIT.

→ [https://github.com/EthanXie-Hub/spatium-bio](https://github.com/EthanXie-Hub/spatium-bio)

## What this is

I'm a designer learning computational biology. Spatium Bio is the workspace
I want to use as I learn — eventually, a single coordinate system where
structure retrieval, function readouts, and generative sampling share one
manifold.

Today it is a Next.js landing page and a decorative 3D figure. None of the
science is wired up yet. I'm shipping it early because building in public
is more honest than building in secret.

## What works · what doesn't

**Works**

- Landing page (this repo's public face)
- Static 3D figure in React Three Fiber
- Design system aligned with FIELD｜场域 (warm cream, near-black, brick orange)
- Python core package `spatium-bio` — PDB fetch / parse / Cα extraction,
  with offline + network tests (`packages/core/`)
- Reproducible hello-protein script — 4HHB → Cα distance map
  (`examples/00_hello_protein.py`)
- Repo + MIT license

**Doesn't (yet)**

- Encoder — not started
- Embeddings — not started
- Manifold projection — not started
- Function / fold-similarity readouts — not started
- Generation — not started
- Benchmarks — not started
- Public API — not started

See [docs/reading-list.md](docs/reading-list.md) for what I'm reading
on the way there. I'll update both lists as things move.

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
uv run --project packages/core python examples/00_hello_protein.py
# → examples/figures/00_4hhb_calpha_distance.png
```

Python 3.11+. Tests live under `packages/core/tests/`; run with
`uv run --project packages/core pytest -m "not network"` for the
offline suite.

## Contact

I'd genuinely like to hear from people in the field, especially if any of
the framing above sounds wrong.

- Email · `nyssa520ethan@gmail.com`
- Issues · [github.com/EthanXie-Hub/spatium-bio/issues](https://github.com/EthanXie-Hub/spatium-bio/issues)

## License

MIT. See [LICENSE](LICENSE).
