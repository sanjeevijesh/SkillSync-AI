export default function Watermark() {
  return (
    <>
      {/* Corner Badge — compact on mobile, full on desktop */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 pointer-events-none select-none">
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-tr from-blue-500/15 via-purple-500/15 to-pink-500/15 blur-xl opacity-60" />
          <div className="relative backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-5 sm:py-3 shadow-xl">
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-white/90 text-[10px] sm:text-sm font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                  SanjeeVijesh
                </span>
              </div>
              <span className="text-white/40 text-[8px] sm:text-[10px] tracking-wider uppercase">
                Developer &amp; Designer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom left — Secure badge */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 pointer-events-none select-none">
        <div className="backdrop-blur-md bg-slate-900/40 border border-white/10 rounded-full px-3 py-1.5 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-wider">Secure</span>
            </div>
            <div className="w-px h-2.5 bg-white/10" />
            <span className="text-white/30 text-[9px] sm:text-[10px] tracking-wider">
              {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}