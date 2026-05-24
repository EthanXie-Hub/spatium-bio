# L<N>-YYYY-MM-DD — <one-line title>

- **What I was trying to do**: one sentence.
- **Time on this**: roughly how long, including dead ends.

---

## What happened

A few paragraphs in plain language. Skip whatever is obvious — focus
on the moments where reality differed from expectation. If everything
went smoothly, the entry can be a few lines; the point of the log is
not effort, it's surprises.

## Where I got stuck

Bullet list. Each item: what confused me + what I had to look up or
ask. Vague is fine. Examples:

- _e.g._ "I didn't realise ESM-2 has six different sizes. Picked 35M
  because it's the smallest and fastest. Will probably move to 650M
  later. Followed the HF model card to figure out which ID maps to
  which size."
- _e.g._ "Hit a float-precision bug: `cosine_similarity(v, v) == 1.0`
  was sometimes False. Switched the assertion to `abs(x - 1.0) < 1e-6`."

## Takeaway

One sentence. What is the version of me one month from now going to
want to remember about today?

## Optional · what this changes for the next entry

If the work raised a new question or unlocked a next step, log it
here so the next session has a starting point.
