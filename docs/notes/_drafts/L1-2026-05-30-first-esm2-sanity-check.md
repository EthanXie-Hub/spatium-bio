# L1-2026-05-30 — First ESM-2 sanity check

- **What I was trying to do**: turn three protein sequences into vectors
  and see whether two paralogs come out closer than an unrelated enzyme.
- **Time on this**: about an afternoon, including dead ends.

---

## What happened

I wired ESM-2 35M (`facebook/esm2_t12_35M_UR50D`) via HuggingFace
transformers — no training, no fine-tuning, just the pretrained
weights. Embedded three sequences end-to-end, mean-pooled the per-
residue hidden states, and computed pairwise cosine similarity:

```
          Hb α     Hb β      AdK
  Hb α   1.0000   0.9781   0.6926
  Hb β   0.9781   1.0000   0.7078
  AdK    0.6926   0.7078   1.0000
```

The two hemoglobin chains came out at 0.978. Either of them against
adenylate kinase came out around 0.70. The ordering I expected held.

## Where I got stuck

- I didn't know ESM-2 ships in six sizes (8M / 35M / 150M / 650M / 3B / 15B).
  Picked 35M because it's the smallest and would actually fit on a laptop
  CPU. Want to retry on 650M (1,280-d hidden size) later but not before
  there's something to compare it against.
- My self-similarity assertion `cosine_similarity(v, v) == 1.0` failed
  on the first run because of float64 rounding (the printed value was
  `1.0000` but underneath it was `0.99999...`). Changed it to
  `abs(sim - 1.0) < 1e-6`.
- The first model load printed a long table of `lm_head.* UNEXPECTED`
  and `pooler.* MISSING` warnings. Both are harmless: `lm_head` is the
  pretraining objective we don't need for embeddings, and we compute
  our own mean-pool so the HF pooler is irrelevant. I left the warnings
  alone — silencing them would hide something useful from future me.

## What this does not prove

This is a 3-sequence sanity check, not a benchmark. Specifically:

- It does not show that ESM-2 has captured fold space. n = 3 is too
  small to claim anything about clustering, manifold structure, or
  fold recognition.
- It does not establish a baseline. There's no comparison to random
  vectors, k-mer counts, BLOSUM, or any structural metric like TM-score.
- The cosine numbers are in a narrow band (~0.7–1.0). That's a known
  feature of ESM-2 mean-pooled embeddings, not a meaningful probability.
- Mean-pooling collapses position. Anything that needs per-residue
  structure (contact prediction, active sites) is invisible at this
  resolution.

## Takeaway

Off-the-shelf ESM-2 35M mean-pooled cosine puts two human paralogs
closer to each other than to an unrelated bacterial enzyme. That's the
weakest possible "the encoder works at all" signal — useful as a
nothing-broken check before L2, useless as evidence of anything else.

## Next

- Read papers 1–2 on the reading list (AlphaFold 2, ESM-2) with this
  result in hand. The reading will mean more now than it would have
  before I had a tensor on disk.
- L2 design: pick a small SCOPe fold-class subset (~100–300 sequences,
  multiple folds, balanced) and check whether intra-fold cosine
  consistently beats inter-fold cosine. Compare against random
  baselines. Decide on a TM-score reference set as the second metric.
