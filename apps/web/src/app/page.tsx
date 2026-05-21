"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [activeAsset, setActiveAsset] = useState("protein.pdb");

  const analysisMap = {
    "protein.pdb": {
      title: "Protein Family",
      value: "Kinase-like structure",
      scoreLabel: "Similarity Score",
      score: "98.2%",
      space: "Structure topology loaded",
    },
    "embeddings.vec": {
      title: "Embedding Vector",
      value: "ESM-style latent representation",
      scoreLabel: "Vector Dimension",
      score: "4096",
      space: "Latent space projection ready",
    },
    "structure.json": {
      title: "Structure Metadata",
      value: "Parsed residue topology",
      scoreLabel: "Chains Detected",
      score: "3",
      space: "Spatial graph reconstructed",
    },
  };

  const activeAnalysis = analysisMap[activeAsset as keyof typeof analysisMap];

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-3xl" />
      <div className="absolute left-[30%] top-[35%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl" />
      <div className="absolute right-[25%] bottom-[20%] h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />

      <header className="absolute top-0 z-50 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="text-sm font-medium tracking-[0.2em] text-white/80">
            SPATIUM BIO
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/50 md:flex">
            <a href="#" className="transition hover:text-white">Workspace</a>
            <a href="#" className="transition hover:text-white">Research</a>
            <a href="#" className="transition hover:text-white">Docs</a>
            <a href="#" className="transition hover:text-white">GitHub</a>
          </nav>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6"
      >
        <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/60 backdrop-blur">
          AI-native Computational Biology Workspace
        </div>

        <h1 className="max-w-6xl text-center text-7xl font-semibold leading-[0.92] tracking-[-0.06em] md:text-[9rem]">
          Biological
          <br />
          Computation,
          <br />
          Reimagined.
        </h1>

        <p className="mt-10 max-w-2xl text-center text-lg leading-8 text-white/40">
          Spatium Bio is an AI-native workspace for protein understanding,
          molecular analysis, and biological reasoning.
        </p>

        <div className="mt-14 flex gap-4">
          <button className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90">
            Launch Workspace
          </button>

          <button className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10">
            GitHub
          </button>
        </div>
      </motion.div>

      <section className="relative z-10 mx-auto mt-32 max-w-7xl px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-400/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
              <div className="h-3 w-3 rounded-full bg-green-400/70" />
            </div>

            <div className="text-xs tracking-[0.08em] text-white/70">
  Protein Workspace
</div>
            <div />
          </div>

          <div className="grid grid-cols-12">
            <div className="col-span-2 border-r border-white/10 p-4">
              <div className="mb-6 text-xs uppercase tracking-[0.2em] text-white/30">
                Assets
              </div>

              <div className="space-y-3 text-sm text-white/50">
                {["protein.pdb", "embeddings.vec", "structure.json"].map((asset) => (
                  <button
                    key={asset}
                    onClick={() => setActiveAsset(asset)}
                    className={`w-full rounded-xl px-3 py-2 text-left transition ${
                      activeAsset === asset
                        ? "bg-white/10 text-white"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-7 flex min-h-[500px] items-center justify-center border-r border-white/10">
  <div className="relative flex h-[280px] w-[280px] items-center justify-center">
  <motion.div
  animate={{
    rotate: 360,
    y: [0, -6, 0],
    opacity: [0.65, 1, 0.65],
    boxShadow: [
      "0 0 24px rgba(34,211,238,0.08)",
      "0 0 72px rgba(34,211,238,0.18)",
      "0 0 24px rgba(34,211,238,0.08)",
    ],
  }}
  transition={{
    rotate: { duration: 24, repeat: Infinity, ease: "linear" },
    y: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
    opacity: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
    boxShadow: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
  }}
  className="absolute inset-0 rounded-full border border-cyan-300/40 border-t-cyan-200/40 border-r-cyan-400/20 border-b-cyan-300/10"
/>

<motion.div
  animate={{
    rotate: -360,
    opacity: [0.55, 0.95, 0.55],
    boxShadow: [
      "0 0 18px rgba(168,85,247,0.06)",
      "0 0 54px rgba(168,85,247,0.16)",
      "0 0 18px rgba(168,85,247,0.06)",
    ],
  }}
  transition={{
    rotate: { duration: 36, repeat: Infinity, ease: "linear" },
    opacity: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
    boxShadow: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
  }}
  className="absolute h-[220px] w-[220px] rounded-full border border-purple-400/20 border-r-purple-200/40"
/>

<motion.div
  animate={{
    rotate: 360,
    opacity: [0.6, 1, 0.6],
    boxShadow: [
      "0 0 12px rgba(96,165,250,0.05)",
      "0 0 38px rgba(96,165,250,0.14)",
      "0 0 12px rgba(96,165,250,0.05)",
    ],
  }}
  transition={{
    rotate: { duration: 48, repeat: Infinity, ease: "linear" },
    opacity: { duration: 3.8, repeat: Infinity, ease: "easeInOut" },
    boxShadow: { duration: 3.8, repeat: Infinity, ease: "easeInOut" },
  }}
  className="
absolute
h-[140px]
w-[140px]
rounded-full
border
border-blue-200/20
bg-gradient-to-br
from-white/[0.03]
to-white/[0.01]
backdrop-blur-xl
"
/>

    <motion.div
      key={activeAsset}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 text-sm text-white/40"
    >
      {activeAsset === "protein.pdb" && "Protein Structure"}
      {activeAsset === "embeddings.vec" && "Latent Embedding Space"}
      {activeAsset === "structure.json" && "Spatial Graph"}
    </motion.div>
  </div>
</div>

            <div className="col-span-3 p-6">
              <div className="mb-6 text-xs uppercase tracking-[0.2em] text-white/30">
                Analysis
              </div>

              <div className="space-y-6">
                <div>
                  <div className="mb-2 text-sm text-white/40">
                    {activeAnalysis.title}
                  </div>
                  <div className="text-sm text-white">
                    {activeAnalysis.value}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm text-white/40">
                    {activeAnalysis.scoreLabel}
                  </div>
                  <div className="text-sm text-white">
                    {activeAnalysis.score}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm text-white/40">
                    Embedding Space
                  </div>

                  <motion.div
                    key={activeAsset}
                    initial={{
                      opacity: 0,
                      scale: 0.96,
                      filter: "blur(12px)"
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      filter: "blur(0px)"
                    }}
                    transition={{
                      duration: 1.2,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="flex h-24 items-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 px-4 text-xs text-white/40"
                  >
                    {activeAnalysis.space}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}