"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const ProteinScene = dynamic(() => import("@/components/protein-scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 z-0 bg-paper-soft" />,
});

/*
  The three reference structures I want this workspace to handle eventually.
  Nothing in the repo actually processes them yet — they are illustrative.
*/
type Asset = {
  pdb: string;
  name: string;
  uniprot: string;
  organism: string;
  residueRange: string;
  residueCount: number;
  pfam?: string;
  ec?: string;
  fold: string;
  note: string;
};

const ASSETS: Asset[] = [
  {
    pdb: "4HHB",
    name: "Hemoglobin (deoxy)",
    uniprot: "P69905",
    organism: "H. sapiens",
    residueRange: "V1–R141",
    residueCount: 141,
    pfam: "PF00042",
    fold: "Globin · all-α",
    note:
      "Standard reference structure. I want this one to work first because the literature is unambiguous and the fold is small.",
  },
  {
    pdb: "1AKE",
    name: "Adenylate Kinase",
    uniprot: "P69441",
    organism: "E. coli",
    residueRange: "M1–G214",
    residueCount: 214,
    pfam: "PF00406",
    ec: "EC 2.7.4.3",
    fold: "P-loop NTPase · LID + NMP lobes",
    note:
      "I picked this because the open ↔ closed motion between the LID and NMP lobes is the canonical example for testing conformational ensembles.",
  },
  {
    pdb: "1UBQ",
    name: "Ubiquitin",
    uniprot: "P0CG48",
    organism: "H. sapiens",
    residueRange: "M1–G76",
    residueCount: 76,
    fold: "β-grasp",
    note: "76 residues, well-behaved. Useful as a sanity check before scaling up.",
  },
];

const I_HAVE = [
  "A landing page and design system",
  "A static 3D figure (R3F)",
  "A Python core package — PDB I/O + ESM-2 embeddings + cosine similarity, with tests",
  "A reproducible hello-protein script (4HHB → Cα distance map)",
  "A 3-sequence ESM-2 sanity check — Hb α–β closer (0.978) than Hb–AdK (~0.70)",
  "A build log of what I'm learning (docs/notes/)",
  "An open repo, MIT-licensed",
];

const I_DONT_HAVE = [
  "A trained or fine-tuned encoder of my own (using ESM-2 35M as-is)",
  "A manifold or projection over embeddings (UMAP / PCA)",
  "Function or fold-similarity readouts at scale",
  "Generation / sampling",
  "Any benchmark on more than 3 proteins",
  "A public API",
];

const PLAN = [
  {
    label: "Encoder · in",
    body: "ESM-2 35M used as-is (not custom-trained); mean-pooled sequence embeddings; cosine similarity validated on a 3-sequence sanity check. Next: 650M model + a small CLI.",
  },
  {
    label: "Manifold · next",
    body: "Start with off-the-shelf UMAP / PCA over a few hundred ESM-2 embeddings before training anything custom.",
  },
  {
    label: "Operators · later",
    body: "Fold-similarity retrieval and function readouts. Generation last, once the metric is stable.",
  },
];

const GITHUB_URL = "https://github.com/EthanXie-Hub/spatium-bio";

export default function Home() {
  const [activePdb, setActivePdb] = useState<string>(ASSETS[0].pdb);
  const activeAsset = useMemo(
    () => ASSETS.find((asset) => asset.pdb === activePdb) ?? ASSETS[0],
    [activePdb],
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-paper text-ink">
      <TopBar />
      <Hero />
      <Why />
      <Status />
      <Figure activeAsset={activeAsset} onSelect={setActivePdb} />
      <Plan />
      <Repo />
      <Footer />
    </main>
  );
}

/* ------------------------------------------------------------------ */
function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-3" id="top">
          <span className="font-serif text-[19px] leading-none tracking-[-0.018em] text-ink">
            Spatium Bio
          </span>
          <span className="chip-id">
            <span className="chip-dot" />
            v0.1.0
          </span>
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="text-[13.5px] text-muted-strong transition-colors hover:text-ink"
        >
          GitHub ↗
        </a>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-24 md:pt-32">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl"
      >
        <div className="eyebrow">
          a workspace for computational biology · in progress
        </div>

        <h1 className="font-serif mt-6 text-5xl leading-[1.04] tracking-[-0.022em] text-ink md:text-[84px]">
          Biology,
          <br />
          rendered as space.
        </h1>

        <p className="mt-8 max-w-xl text-[17px] leading-[1.65] text-muted-strong">
          I&apos;m building a workspace where proteins live as points in a
          shared space — eventually with retrieval, function, and generation
          on a single manifold. Today the pipeline reaches sequence
          embeddings and stops. The UI is what I&apos;m sure about. The
          science is what I&apos;m learning.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-ink">
            <GitHubMark /> View on GitHub
          </a>
          <span className="ml-1 font-mono text-[11.5px] uppercase tracking-[0.16em] text-muted">
            MIT · solo project
          </span>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function Why() {
  return (
    <section id="why" className="border-t border-line py-20">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-[160px_1fr]">
        <div className="eyebrow pt-2">Why</div>
        <div className="max-w-2xl space-y-5 text-[15.5px] leading-[1.75] text-ink-soft">
          <p>
            I&apos;m a designer learning computational biology. Spatium Bio is
            the workspace I want to use while I learn it.
          </p>
          <p>
            The thing I keep noticing in the field is that structure
            prediction, function annotation, and generative sampling are
            usually three separate stacks with three separate representations.
            I want to see what happens if they share one — even a small,
            honest one.
          </p>
          <p>
            Right now the pipeline reaches sequence embeddings via ESM-2
            (used as-is, not custom-trained). The manifold isn&apos;t built.
            The readouts don&apos;t exist. I&apos;m shipping it early because
            watching the gap close in public is more honest than waiting
            until it&apos;s &ldquo;done.&rdquo;
          </p>
          <p className="text-muted-strong">
            If you&apos;re in the field and any of this sounds wrong, please
            tell me —{" "}
            <a
              href="mailto:nyssa520ethan@gmail.com"
              className="text-brand-ink underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
            >
              email
            </a>{" "}
            or open an issue.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function Status() {
  return (
    <section id="status" className="border-t border-line bg-paper-soft/50 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-[160px_1fr]">
        <div className="eyebrow pt-2">Where it is</div>
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          <div>
            <div className="font-serif text-[22px] leading-snug tracking-[-0.015em] text-ink">
              What I have
            </div>
            <ul className="mt-4 space-y-2.5">
              {I_HAVE.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[14.5px] leading-[1.55] text-ink-soft"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-serif text-[22px] leading-snug tracking-[-0.015em] text-ink">
              What I don&apos;t
            </div>
            <ul className="mt-4 space-y-2.5">
              {I_DONT_HAVE.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[14.5px] leading-[1.55] text-muted-strong"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full border border-muted/60"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function Figure({
  activeAsset,
  onSelect,
}: {
  activeAsset: Asset;
  onSelect: (pdb: string) => void;
}) {
  return (
    <section id="figure" className="border-t border-line py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-8 grid gap-3 md:grid-cols-[160px_1fr]">
          <div className="eyebrow pt-1">The workspace</div>
          <p className="max-w-2xl text-[14.5px] leading-[1.65] text-muted-strong">
            This is the shape of the workspace I&apos;m building toward. The
            assets are real PDB structures I want to support; the 3D figure is
            a decorative placeholder until embeddings or manifold data drive
            it.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="card overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-line bg-paper/70 px-5 py-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              spatium-bio · figure
            </span>
            <div className="hidden items-center gap-2 md:flex">
              <span className="chip-id">{activeAsset.pdb}</span>
              <span className="chip-id">UniProt {activeAsset.uniprot}</span>
              {activeAsset.ec ? (
                <span className="chip-id">{activeAsset.ec}</span>
              ) : null}
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              mock
            </span>
          </div>

          <div className="grid grid-cols-12">
            {/* asset list */}
            <div className="col-span-12 border-b border-line p-5 md:col-span-3 md:border-b-0 md:border-r">
              <div className="eyebrow mb-4">Three structures</div>
              <div className="space-y-2">
                {ASSETS.map((asset) => {
                  const isActive = asset.pdb === activeAsset.pdb;
                  return (
                    <button
                      key={asset.pdb}
                      type="button"
                      onClick={() => onSelect(asset.pdb)}
                      className={`group block w-full rounded-[10px] border px-3 py-3 text-left transition-colors ${
                        isActive
                          ? "border-brand/35 bg-brand-soft/70"
                          : "border-line bg-paper hover:bg-paper-soft"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-[12px] tracking-[0.02em] ${
                            isActive ? "text-brand-ink" : "text-ink-soft"
                          }`}
                        >
                          {asset.pdb}
                        </span>
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive ? "bg-brand" : "bg-muted/40"
                          }`}
                        />
                      </div>
                      <div className="mt-1 text-[12.5px] text-muted-strong">
                        {asset.name}
                      </div>
                      <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
                        {asset.residueCount} aa · {asset.organism}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* scene */}
            <div className="relative col-span-12 min-h-[420px] overflow-hidden border-b border-line md:col-span-6 md:border-b-0 md:border-r md:min-h-[500px]">
              <ProteinScene />

              <div className="pointer-events-none absolute left-5 top-5 z-20 max-w-[280px]">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
                  decorative figure
                </div>
                <div className="mt-1 text-[13.5px] leading-snug text-ink">
                  Same scene for every asset.
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-5 left-5 right-5 z-20 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
                pointer perturbs the cloud
              </div>
            </div>

            {/* analysis */}
            <div className="col-span-12 p-6 md:col-span-3 md:px-7">
              <div className="eyebrow mb-4">About this structure</div>

              <motion.div
                key={activeAsset.pdb}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="space-y-5"
              >
                <Row label="Name">
                  <span className="text-[14px] text-ink">{activeAsset.name}</span>
                </Row>

                <Row label="Fold">
                  <span className="text-[13.5px] text-ink-soft">
                    {activeAsset.fold}
                  </span>
                </Row>

                <Row label="Residues">
                  <span className="font-mono text-[12.5px] text-ink-soft tnum">
                    {activeAsset.residueRange}
                  </span>
                  <span className="ml-2 font-mono text-[11px] text-muted tnum">
                    n = {activeAsset.residueCount}
                  </span>
                </Row>

                <Row label="Identifiers">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip-id">PDB {activeAsset.pdb}</span>
                    <span className="chip-id">UP {activeAsset.uniprot}</span>
                    {activeAsset.pfam ? (
                      <span className="chip-id">{activeAsset.pfam}</span>
                    ) : null}
                    {activeAsset.ec ? (
                      <span className="chip-id">{activeAsset.ec}</span>
                    ) : null}
                  </div>
                </Row>

                <Row label="Why this one">
                  <span className="text-[13px] leading-[1.6] text-muted-strong">
                    {activeAsset.note}
                  </span>
                </Row>
              </motion.div>
            </div>
          </div>

          <div className="border-t border-line bg-paper-soft/60 px-5 py-3 text-[12.5px] leading-[1.55] text-muted-strong">
            The 3D scene is decorative. It does not change with the selected
            structure and does not reflect any real embedding. I&apos;ll wire it
            to actual data when the data path is wired into the UI.
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
        {label}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function Plan() {
  return (
    <section id="plan" className="border-t border-line bg-paper-soft/40 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-[160px_1fr]">
        <div className="eyebrow pt-2">The plan</div>
        <div className="max-w-2xl space-y-7">
          <p className="text-[15.5px] leading-[1.75] text-ink-soft">
            Roughly in order. I&apos;ll keep this section honest about
            what&apos;s actually started vs. just intended.
          </p>
          <ol className="space-y-6">
            {PLAN.map((step, index) => (
              <li
                key={step.label}
                className="grid grid-cols-[44px_1fr] items-baseline gap-4"
              >
                <span className="font-mono text-[12px] tracking-[0.02em] text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="font-serif text-[19px] leading-snug tracking-[-0.015em] text-ink">
                    {step.label}
                  </div>
                  <p className="mt-1 text-[14px] leading-[1.65] text-muted-strong">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function Repo() {
  return (
    <section id="repo" className="border-t border-line py-20">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-[160px_1fr]">
        <div className="eyebrow pt-2">Open source</div>
        <div className="max-w-2xl space-y-6">
          <p className="text-[15.5px] leading-[1.75] text-ink-soft">
            The repo is on GitHub under MIT. Star it if you want to follow
            along — I&apos;m more likely to keep going if there are people
            watching. If you spot something off, open an issue.
          </p>
          <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-2">
              <GitHubMark />
              <span className="font-mono text-[12.5px] tracking-[0.01em] text-ink">
                EthanXie-Hub / spatium-bio
              </span>
              <span className="chip-id">main</span>
              <span className="chip-id">MIT</span>
            </div>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-ink"
            >
              <GitHubMark /> Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-line py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-serif text-[19px] tracking-[-0.018em] text-ink">
            Spatium Bio
          </div>
          <div className="mt-1 text-[13px] text-muted-strong">
            Built by Ethan Xie. Solo, in public.
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted-strong">
          <a
            href="mailto:nyssa520ethan@gmail.com"
            className="hover:text-ink"
          >
            nyssa520ethan@gmail.com
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            github
          </a>
          <a
            href={`${GITHUB_URL}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            MIT
          </a>
        </div>
      </div>
    </footer>
  );
}

function GitHubMark() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.55v-1.9c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.04.78 2.11v3.13c0 .3.21.66.8.55A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
