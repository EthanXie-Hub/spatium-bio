# Security

This is a learning project, not a production system. There are no
secrets in the repo, no authentication, no user data, no clinical
intent.

## Reporting

If you find a vulnerability — most likely in a dependency or in the
example scripts' handling of network input — please:

- For non-sensitive issues: open a GitHub issue describing the
  problem and how to reproduce it.
- For anything you would prefer not to publish: email
  `nyssa520ethan@gmail.com` and I will respond within a few days.

## Scope

Things considered in scope:

- `packages/core` Python library (PDB fetcher, embedding wrapper).
- `apps/web` Next.js landing page and its dependencies.
- Example scripts under `examples/`.

Things explicitly out of scope:

- Any claim about biological correctness — that belongs in an issue,
  not a CVE.
- Performance characteristics of upstream models (ESM-2, AlphaFold,
  etc.).

## Status of results

Everything produced by scripts in this repo is exploratory. Numbers
and figures should be treated as build artifacts, not as findings.

This is a research/learning prototype and is not intended for clinical,
diagnostic, or therapeutic decision-making.
