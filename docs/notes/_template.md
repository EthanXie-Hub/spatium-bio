# L0-NN — <paper title in plain words>

- **Paper**: <authors, year, venue>
- **Read on**: YYYY-MM-DD
- **Time to read**: <how many hours you actually spent>
- **Source**: <URL you used>

---

## 1. One sentence

What this paper does, in a sentence I would say out loud to a friend
who has never heard of it. No biology jargon — if I need a term,
either explain it inline or replace it.

> Example (do not copy): "They trained a really big neural network to
> guess what shape a protein folds into just from its amino-acid
> sequence, and it got close enough to be useful for almost any protein
> that has been studied."

## 2. What I now understand

Three to five short paragraphs, in my own words. Cover:

- What problem the paper solves
- The key idea (the trick that makes it work)
- What "success" looks like in the paper (a number, a figure, a result)

Stop when the paragraphs would start to feel like a summary I copied
from somewhere. The point is the act of writing — if I cannot write
it, I did not understand it.

## 3. Terms I had to look up

A flat list. Term on the left, my one-line working definition on the
right. Honest definitions, not Wikipedia copies.

| Term | My working definition |
| ---- | --------------------- |
| _e.g._ MSA | A table of related protein sequences stacked on top of each other so you can see which letters change and which never do. |
| _e.g._ pLDDT | A confidence score from 0 to 100 the model assigns to each residue, saying how sure it is about its predicted position. |

## 4. What still doesn't make sense

The single most important section of the note. Bullet list. Each item
is something I read but did not internalise. **Vague is fine** — the
purpose is to track honestly, not to look smart.

- _e.g._ "I don't really understand what the Evoformer is doing
  differently from a normal transformer. I get that it has two streams
  but I can't say what each one is for."
- _e.g._ "I have no intuition for why MSA helps so much."

These bullets become my next reading or the question I will ask
someone in the field.

## 5. What this changes for Spatium Bio

Concrete implications for the project. Even half-formed ones. Bullet
list. Examples:

- _e.g._ "If I use ESM-2 embeddings, I cannot also claim 'AlphaFold-
  level accuracy' for any downstream task — they are different things."
- _e.g._ "The benchmark of choice for fold recognition in this paper
  is CASP14, which I should look at when designing my own benchmark."

## 6. Hand-it-to-a-friend test

Write the **one paragraph** I would send to a non-biology friend if
they asked "what did you read?". If I can write this without copying
anything from above, the note is done.

> _Your paragraph here._
