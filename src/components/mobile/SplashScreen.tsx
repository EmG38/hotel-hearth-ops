import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import emblem from "@/assets/marsa-dhahab-emblem.png.asset.json";

/** Wave strip drawn twice side-by-side so translating -50% loops seamlessly. */
function Waves({ className, fill }: { className?: string; fill: string }) {
  const d = "M0 30 Q 50 0 100 30 T 200 30 T 300 30 T 400 30 V60 H0Z";
  return (
    <div className={cn("pointer-events-none absolute inset-x-0 overflow-hidden", className)}>
      <svg viewBox="0 0 800 60" preserveAspectRatio="none" className="h-full w-[200%]">
        <path d={d} fill={fill} />
        <path d={d} fill={fill} transform="translate(400 0)" />
      </svg>
    </div>
  );
}

/**
 * Brand splash shown before the sign-in roster: a sun rising over the Gulf,
 * the dhow logo sailing in on animated waves above a sand dune. Tap to skip.
 */
export function SplashScreen({ onDone, duration = 3200 }: { onDone: () => void; duration?: number }) {
  const [leaving, setLeaving] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), duration);
    const t2 = setTimeout(() => done.current(), duration + 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duration]);

  return (
    <button
      type="button"
      aria-label="Skip intro"
      onClick={onDone}
      className={cn(
        "relative flex flex-1 flex-col items-center overflow-hidden bg-gradient-to-b from-tertiary-container via-surface to-sand text-left",
        leaving && "animate-md-out",
      )}
    >
      {/* sun */}
      <div className="animate-md-sun absolute top-[18%] size-56 rounded-full bg-gradient-to-b from-primary/40 to-primary/0 blur-2xl" />

      <div className="relative z-10 mt-[30%] flex flex-col items-center">
        <div className="animate-md-rise">
          <img src={emblem.url} alt="" className="animate-md-bob w-48 drop-shadow-xl" />
        </div>
        <p className="animate-md-fade-up mt-5 font-[Noto_Naskh_Arabic,serif] text-headline font-bold text-secondary [animation-delay:.6s]" dir="rtl">
          مرسى ذهب
        </p>
        <p className="text-md-shimmer animate-md-fade-up mt-1 text-title font-semibold tracking-[0.35em] [animation-delay:.9s]">
          MARSA DHAHAB
        </p>
        <div className="animate-md-fade-up mt-2 flex items-center gap-2 [animation-delay:1.2s]">
          <span className="h-px w-10 bg-primary" />
          <span className="text-label-sm font-semibold tracking-[0.4em] text-primary">HOTEL</span>
          <span className="h-px w-10 bg-primary" />
        </div>
      </div>

      {/* Gulf water */}
      <Waves className="bottom-[19%] h-16 opacity-50 [&>svg]:animate-md-wave-slow" fill="var(--color-tertiary)" />
      <Waves className="bottom-[16%] h-14 [&>svg]:animate-md-wave" fill="var(--color-secondary)" />
      {/* sand dune */}
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[19%] w-full">
        <path d="M0 40 C 90 0 170 60 260 25 S 380 20 400 35 V120 H0Z" fill="var(--color-sand-deep)" />
        <path d="M0 70 C 120 30 220 90 400 55 V120 H0Z" fill="var(--color-sand)" />
      </svg>
      <span className="animate-md-grain absolute bottom-6 z-10 text-label-sm text-secondary/70">Tap to continue</span>
    </button>
  );
}
