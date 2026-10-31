"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { cn } from "@/lib/utils";
import { email, phone } from "./content";

export type DemoTrack = { title: string; src: string };

type Decoded = { peaks: number[]; duration: number };

const BARS = 64;

// Arc geometry in px. Rows sit on a ring concentric with the disc; the active row is at the apex.
const GEOMETRY = {
  wide: { width: 560, height: 400, disc: 190, cx: 0, ring: 240, activeHalf: 58, gap: 66 },
  compact: { width: 300, height: 300, disc: 110, cx: -30, ring: 140, activeHalf: 44, gap: 50 },
};
const OPACITY = [1, 0.55, 0.22];

const COMPACT_QUERY = "(max-width: 768px)";
const subscribeCompact = (cb: () => void) => {
  const mq = window.matchMedia(COMPACT_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (s: number) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

async function decode(src: string): Promise<Decoded> {
  const data = await (await fetch(src)).arrayBuffer();
  const audio = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(data);
  const ch = audio.getChannelData(0);
  const size = Math.floor(ch.length / BARS);
  const raw = Array.from({ length: BARS }, (_, b) => {
    let sum = 0;
    for (let i = b * size; i < (b + 1) * size; i++) sum += ch[i] * ch[i];
    return Math.sqrt(sum / size);
  });
  const max = Math.max(...raw) || 1;
  return { peaks: raw.map((v) => 0.12 + 0.88 * (v / max)), duration: audio.duration };
}

export function VinylPlayer({ tracks }: { tracks: DemoTrack[] }) {
  const n = tracks.length;
  const maxDepth = Math.floor(n / 2);

  const compact = useSyncExternalStore(
    subscribeCompact,
    () => window.matchMedia(COMPACT_QUERY).matches,
    () => false,
  );
  const g = compact ? GEOMETRY.compact : GEOMETRY.wide;

  const [sel, setSel] = useState({ active: 0, prev: 0 });
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [decoded, setDecoded] = useState<Record<number, Decoded>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastWheel = useRef(0);

  const { active } = sel;

  // cyclic signed distance, so the list wraps like a wheel
  const wrapDelta = (d: number) => {
    let v = (((d % n) + n) % n);
    if (v > maxDepth) v -= n;
    return v;
  };

  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    audioRef.current = a;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setTime(0);
    };
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.pause();
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      a.removeAttribute("src");
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    tracks.forEach((t, i) => {
      decode(t.src)
        .then((d) => {
          if (!cancelled) setDecoded((prev) => ({ ...prev, [i]: d }));
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [tracks]);

  // progress while playing, quantised to 0.1s so React re-renders ~10x/s rather than
  // every frame (120x/s on ProMotion), which starved scrolling of main-thread time
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      if (audioRef.current) setTime(Math.round(audioRef.current.currentTime * 10) / 10);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const playTrack = (i: number, at?: number) => {
    const a = audioRef.current;
    if (!a) return;
    if (loadedRef.current !== i) {
      a.src = tracks[i].src;
      loadedRef.current = i;
      setTime(0);
    }
    if (at !== undefined) {
      a.currentTime = at;
      setTime(at);
    }
    setPlayingIndex(i);
    a.play().catch(() => setPlaying(false));
  };

  const toggle = () => {
    if (playing && playingIndex === active) audioRef.current?.pause();
    else playTrack(active);
  };

  const select = (i: number) => {
    const next = ((i % n) + n) % n;
    setSel((s) => ({ active: next, prev: s.active }));
    if (!(playing && playingIndex === next)) playTrack(next);
  };

  const seekBy = (sec: number) => {
    const a = audioRef.current;
    if (!a || playingIndex !== active) return;
    const dur = decoded[active]?.duration ?? a.duration;
    a.currentTime = Math.max(0, Math.min(dur, a.currentTime + sec));
    setTime(a.currentTime);
  };

  const onWheel = useEffectEvent((e: WheelEvent) => {
    e.preventDefault();
    if (e.timeStamp - lastWheel.current < 180) return;
    lastWheel.current = e.timeStamp;
    select(active + (e.deltaY > 0 ? 1 : -1));
  });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => onWheel(e);
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // pause once the player is mostly scrolled off the top of the viewport
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.5 && entry.boundingClientRect.top < 0) audioRef.current?.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const actions: Record<string, () => void> = {
      ArrowUp: () => select(active - 1),
      ArrowDown: () => select(active + 1),
      ArrowLeft: () => seekBy(-5),
      ArrowRight: () => seekBy(5),
      Enter: toggle,
      " ": toggle,
    };
    const run = actions[e.key];
    if (run && e.target === e.currentTarget) {
      e.preventDefault();
      run();
    }
  };

  const onSeek = (e: PointerEvent<HTMLDivElement>) => {
    const dur = decoded[active]?.duration;
    if (!dur) return;
    const r = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    if (playingIndex === active && audioRef.current) {
      audioRef.current.currentTime = frac * dur;
      setTime(frac * dur);
      if (!playing) audioRef.current.play().catch(() => {});
    } else {
      playTrack(active, frac * dur);
    }
  };

  const place = (delta: number) => {
    const d = Math.abs(delta);
    const y = d === 0 ? 0 : Math.sign(delta) * (g.activeHalf + (d - 0.5) * g.gap);
    const x = g.cx + Math.sqrt(Math.max(0, g.ring * g.ring - y * y));
    return { x, y, opacity: OPACITY[d] ?? 0 };
  };

  const isSpinning = playing && playingIndex !== null;

  return (
    <div
      ref={rootRef}
      className="vp"
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="group"
      aria-label="Demo player. Up and down arrows change track, Enter plays or pauses, left and right arrows seek."
    >
      <p className="vp-meta">
        <a href={`tel:${phone.tel}`} className="vp-meta-label">
          {phone.label}
        </a>
        <a href={`mailto:${email}`} className="vp-meta-link">
          {email}
        </a>
      </p>
      <div
        ref={stageRef}
        className="vp-stage"
        style={
          {
            "--vp-w": `${g.width}px`,
            "--vp-h": `${g.height}px`,
            "--vp-disc": `${g.disc}px`,
            "--vp-cx": `${g.cx}px`,
          } as CSSProperties
        }
      >
        <div className={cn("vp-disc", isSpinning && "is-spinning")} aria-hidden="true">
          <div className="vp-label">
            <span>SIDE A</span>
          </div>
        </div>
        <div className="vp-sheen" aria-hidden="true" />

        {tracks.map((t, i) => {
          const delta = wrapDelta(i - active);
          const prevDelta = wrapDelta(i - sel.prev);
          const isActive = delta === 0;
          const isPlaying = playing && playingIndex === i;
          const { x, y, opacity } = place(delta);
          const d = decoded[i];
          const dur = d?.duration ?? 0;
          const cur = playingIndex === i ? time : 0;
          const progress = isActive && dur ? cur / dur : 0;
          return (
            <div
              key={t.src}
              className={cn(
                "vp-row",
                isActive && "is-active",
                isPlaying && "is-playing",
                Math.abs(delta - prevDelta) > 1 && "no-anim",
              )}
              style={{ "--x": `${x}px`, "--y": `${y}px`, "--o": opacity } as CSSProperties}
              aria-hidden={opacity === 0}
            >
              <button
                type="button"
                className="vp-num"
                tabIndex={-1}
                onClick={() => (isActive ? toggle() : select(i))}
                aria-label={isActive ? (isPlaying ? `Pause ${t.title}` : `Play ${t.title}`) : `Select ${t.title}`}
              >
                {isActive && <span className="vp-state" aria-hidden="true">{isPlaying ? "❚❚" : "▶"}</span>}
                {pad(i + 1)}
              </button>
              <div className="vp-body">
                <div className="vp-head">
                  <button type="button" className="vp-title" tabIndex={-1} onClick={() => (isActive ? toggle() : select(i))}>
                    {t.title}
                  </button>
                  <span className="vp-time">
                    {fmt(cur)} / {fmt(dur)}
                  </span>
                </div>
                {isActive && (
                  <div className="vp-wave" onPointerDown={onSeek} aria-hidden="true">
                    {(d?.peaks ?? Array.from({ length: BARS }, () => 0.12)).map((h, b) => (
                      <span
                        key={b}
                        className={cn("vp-bar", b / BARS < progress && "is-played")}
                        style={{ "--h": h } as CSSProperties}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
