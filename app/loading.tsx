export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-20 w-20" aria-hidden="true">
          <div
            className="absolute inset-0 rounded-full border border-cyan/15"
            style={{ borderTopColor: '#00f0ff', filter: 'drop-shadow(0 0 6px #00f0ff)', animation: 'jarvis-spin 1.1s linear infinite' }}
          />
          <div
            className="absolute inset-2 rounded-full border border-cyan/10"
            style={{ borderBottomColor: 'rgb(0 240 255 / 0.7)', animation: 'jarvis-spin-rev 1.6s linear infinite' }}
          />
        </div>
        <div
          role="status"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60"
        >
          ▸ LOADING // STAND BY
        </div>
      </div>
    </main>
  )
}
