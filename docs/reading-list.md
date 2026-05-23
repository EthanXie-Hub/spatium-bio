# Reading list — L0

Five papers I plan to read before writing any embedding code. The point of
this list isn't completeness; it's to have read enough that I know what
the rest of the field has *already* answered before I propose anything
of my own.

I will check each off after I've read it and written one paragraph on
"what I now understand" in `docs/notes/`.

## Order

### 1. AlphaFold 2 — the field's baseline

> Jumper et al. **Highly accurate protein structure prediction with AlphaFold.**
> *Nature*, 2021. DOI: [10.1038/s41586-021-03819-2](https://doi.org/10.1038/s41586-021-03819-2).
>
> Read on Nature (open access):
> <https://www.nature.com/articles/s41586-021-03819-2>
>
> Supplementary methods (the real meat — Evoformer, structure module,
> training): linked from the Nature page under "Supplementary
> information".

The paper that reset everything. Even if I never use AF2 directly, I need
to understand what counts as "solved" in structure prediction and why
that changed in 2021.

### 2. ESM-2 / ESMFold — the workhorse encoder

> Lin et al. **Evolutionary-scale prediction of atomic-level protein
> structure with a language model.** *Science*, 2023.
> DOI: [10.1126/science.ade2574](https://doi.org/10.1126/science.ade2574).
>
> Free bioRxiv preprint (same content, no paywall):
> <https://www.biorxiv.org/content/10.1101/2022.07.20.500902v3>
>
> Code + pretrained weights (use this when reading the paper, not
> after): <https://github.com/facebookresearch/esm>

The protein language model I will most likely use to produce per-residue
embeddings (1,280-d for the 650M variant). Understanding the training
objective and the embedding geometry is non-negotiable before L1.

### 3. SCOPe / CATH — how the field organises fold space

> Fox, Brenner, Chandonia. **SCOPe: Structural Classification of
> Proteins—extended, integrating SCOP and ASTRAL data and
> classification of new structures.** *Nucleic Acids Research*, 2014.
> DOI: [10.1093/nar/gkt1240](https://doi.org/10.1093/nar/gkt1240).
>
> Open access on NAR:
> <https://academic.oup.com/nar/article/42/D1/D304/1051073>
>
> Database itself (browse the actual fold hierarchy):
> <https://scop.berkeley.edu>

Optionally pair with the CATH database paper (Sillitoe et al., *NAR*,
2021 — DOI [10.1093/nar/gkaa1100](https://doi.org/10.1093/nar/gkaa1100)).
I need to know how "fold class" is defined before I claim a metric is
recovering it.

### 4. TM-score — the universal structure-similarity metric

> Zhang & Skolnick. **Scoring function for automated assessment of
> protein structure template quality.** *Proteins: Structure, Function,
> and Bioinformatics*, 2004.
> DOI: [10.1002/prot.20264](https://doi.org/10.1002/prot.20264).
>
> Free copy hosted by the Zhang group:
> <https://zhanggroup.org/TM-score/>
>
> (Same page links to the C/Fortran source. If the Wiley DOI link is
> paywalled for you, the Zhang group PDF is the canonical free copy.)

Whatever I do at L2, I will compare embedding-cosine similarity to
TM-score on a small set of structures. I need to understand both why
TM-score normalises by length and what its known failure modes are.

### 5. Bepler & Berger — what protein embeddings reveal

> Bepler & Berger. **Learning the protein language: evolution,
> structure, and function.** *Cell Systems*, 2021.
> DOI: [10.1016/j.cels.2021.05.017](https://doi.org/10.1016/j.cels.2021.05.017).
>
> If the DOI link is paywalled, search Google Scholar by the exact
> title — there is usually a free author copy:
> <https://scholar.google.com/scholar?q=Learning+the+protein+language+Bepler+Berger>

A clean treatment of what protein language model embeddings *contain*
structurally and functionally. Use this to set expectations for
L2 / L3 readouts.

## After the list

Once these five are read I will:

1. Write a `docs/notes/L0-summary.md` (one page, my own words).
2. Pick the specific encoder + benchmark combination for L1 in the open.
3. Update `apps/web` page's "What I don't have" list as items move.

If you have suggestions, please open an issue or email — I would
rather adjust this list now than after reading five wrong papers.
