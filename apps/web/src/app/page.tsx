export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Grid Background */}
<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />

{/* Aurora Glow */}
<div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-3xl" />

<div className="absolute left-[30%] top-[35%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl" />

<div className="absolute right-[25%] bottom-[20%] h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6">

        {/* Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />

        {/* Small Label */}
        <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/60 backdrop-blur">
          AI-native Computational Biology Workspace
        </div>

        {/* Main Title */}
        <h1 className="max-w-6xl text-center text-7xl font-semibold leading-[0.92] tracking-[-0.06em] md:text-[9rem]">
          Biological
          <br />
          Computation,
          <br />
          Reimagined.
        </h1>

        {/* Subtitle */}
        <p className="mt-10 max-w-2xl text-center text-lg leading-8 text-white/40">
          Spatium Bio is an AI-native workspace for protein understanding,
          molecular analysis, and biological reasoning.
        </p>

        {/* Buttons */}
        <div className="mt-14 flex gap-4">
          <button className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90">
            Launch Workspace
          </button>

          <button className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10">
            GitHub
          </button>
        </div>
      </div>
    </main>
  );
}