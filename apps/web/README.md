# `apps/web`

The Next.js landing page for Spatium Bio. This sub-package is the UI,
not yet a full science stack — the root repo already ships a minimal
Python core (`packages/core`, see [root README](../../README.md)), but
none of it is wired into this web app yet.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm run lint
```

Node 20+ recommended.

## Layout

```
src/
├── app/
│   ├── layout.tsx           Metadata, fonts, OG plumbing
│   ├── page.tsx             Single-page workspace
│   ├── opengraph-image.tsx  Generated 1200×630 OG card
│   ├── icon.tsx             Favicon glyph
│   └── globals.css          Paper-grade design tokens
└── components/
    └── protein-scene.tsx    Decorative R3F figure
```

## Design tokens

Inherited from FIELD｜场域:

| Token        | Value     | Use                              |
| ------------ | --------- | -------------------------------- |
| `paper`      | `#F6F3EE` | Background                       |
| `ink`        | `#1F1E1B` | Primary text                     |
| `muted`      | `#6B6760` | Secondary text                   |
| `line`       | `#E9E2D2` | Hairline borders                 |
| `brand`      | `#C15F3C` | The single accent                |
| `brand.ink`  | `#8A3F23` | Brand text on warm backgrounds   |
| `brand.soft` | `#F2E5DC` | Selection, active surfaces       |

Source Serif 4 for display, Inter for UI, Geist Mono for identifiers.

## License

[MIT](../../LICENSE).
