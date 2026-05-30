# Roadmap

Tracked at coarse "levels" rather than fixed dates. The website's
`Plan` section and `README.md`'s "What works · what doesn't" lists
are the source of truth for what is currently shipped.

| Level | Theme | Status |
| ----- | ----- | ------ |
| L0 | Toolchain + PDB I/O — read a PDB file end-to-end | done |
| L1 | ESM-2 embeddings — sequence → vector, 3-sequence sanity check | done |
| L2 | First real benchmark — SCOPe fold subset, intra- vs inter-fold cosine, baselines | next |
| L3 | Installable Python package + CLI + docs | later |
| L4 | One original small experiment + write-up | later |
| L5 | Real research direction or collaboration | open |

## Discipline

Each level only counts as **done** when:

- The code is reproducible end-to-end on a clean clone.
- Any number quoted on the website or README has a backing artifact
  in `examples/results/`.
- README's "Works" list moves before "Doesn't" list loses an item —
  not the other way around.

## Tracking

- Per-level work lives in dated entries under `docs/notes/`.
- Open questions for the next level get filed as GitHub issues, not
  TODO comments in code.
