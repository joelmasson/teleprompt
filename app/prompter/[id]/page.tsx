"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pause, Play, SkipBack, SkipForward, Minus, Plus, MonitorUp, ArrowLeft, Gauge, Settings2 } from "lucide-react";
import { getCurrentUser, getScriptById, persistReadingPosition, saveScript } from "@/lib/storage";
import { clamp, getPixelsPerSecondFromWpm, getWpmFromPixelsPerSecond } from "@/lib/teleprompt";

export default function PrompterPage() {
  const params = useParams();
  const router = useRouter();
  const scriptId = String(params.id);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [script, setScript] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(120);
  const [fontSize, setFontSize] = useState(52);
  const [textWidth, setTextWidth] = useState(72);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [alignment, setAlignment] = useState<"left" | "center">("center");
  const [mirrorMode, setMirrorMode] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
      return;
    }

    const found = getScriptById(scriptId);
    if (!found || found.user_id !== currentUser.id) {
      router.replace("/app");
      return;
    }

    setScript(found);
    setSpeed(found.scroll_speed ?? 120);
    setFontSize(found.font_size ?? 52);
    setTextWidth(found.text_width ?? 72);
    setLineSpacing(found.line_spacing ?? 1.5);
    setAlignment(found.text_alignment ?? "center");
    setMirrorMode(Boolean(found.mirror_mode));
    setTimeout(() => {
      const element = scrollRef.current;
      if (!element) return;
      const offset = found.last_position ? Math.max(0, element.scrollHeight * found.last_position) : 0;
      element.scrollTop = offset;
    }, 100);
  }, [router, scriptId]);

  useEffect(() => {
    if (!script) return;

    const nextScript = {
      ...script,
      scroll_speed: speed,
      font_size: fontSize,
      text_width: textWidth,
      line_spacing: lineSpacing,
      text_alignment: alignment,
      mirror_mode: mirrorMode,
    };

    saveScript(nextScript);
    setScript(nextScript);
  }, [speed, fontSize, textWidth, lineSpacing, alignment, mirrorMode, script?.id]);

  useEffect(() => {
    const handlePointerMove = () => setShowControls(true);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        setIsPlaying((value) => !value);
      }
      if (event.key === "ArrowUp") setSpeed((value) => clamp(value + 10, 40, 260));
      if (event.key === "ArrowDown") setSpeed((value) => clamp(value - 10, 40, 260));
      if (event.key === "+" || event.key === "=") setFontSize((value) => clamp(value + 4, 18, 120));
      if (event.key === "-") setFontSize((value) => clamp(value - 4, 18, 120));
      if (event.key === "Home") {
        const element = scrollRef.current;
        if (element) element.scrollTop = 0;
      }
      if (event.key === "End") {
        const element = scrollRef.current;
        if (element) element.scrollTop = element.scrollHeight;
      }
      if (event.key === "Escape") router.push(`/app/${scriptId}`);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, scriptId]);

  useEffect(() => {
    if (!showControls) return;

    const timer = window.setTimeout(() => setShowControls(false), 2500);
    return () => window.clearTimeout(timer);
  }, [showControls]);

  useEffect(() => {
    if (!script || !isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    let lastTick = performance.now();
    let previousScroll = scrollRef.current?.scrollTop ?? 0;

    const tick = (now: number) => {
      const element = scrollRef.current;
      if (!element) return;

      const delta = now - lastTick;
      const pixelsPerSecond = getPixelsPerSecondFromWpm(speed);
      const distance = (pixelsPerSecond * delta) / 1000;
      element.scrollTop += distance;
      previousScroll = element.scrollTop;
      lastTick = now;

      const position = clamp(element.scrollTop / Math.max(element.scrollHeight - element.clientHeight, 1), 0, 1);
      persistReadingPosition(scriptId, position);
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, scriptId, speed, script]);

  const wpm = useMemo(() => getWpmFromPixelsPerSecond(speed), [speed]);

  const showCountdown = false;

  if (!script) return null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
        ref={scrollRef}
        onClick={() => setIsPlaying((value) => !value)}
        className="h-screen overflow-y-auto overscroll-none bg-black px-6 py-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className="mx-auto whitespace-pre-wrap break-words leading-[1.5] text-white"
          style={{
            maxWidth: `${textWidth}ch`,
            lineHeight: lineSpacing,
            fontSize: `${fontSize}px`,
            textAlign: alignment,
            transform: mirrorMode ? "scaleX(-1)" : "none",
            userSelect: "none",
          }}
        >
          {script.content}
        </div>
      </div>

      {showCountdown ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70 text-9xl font-bold text-white">
          3
        </div>
      ) : null}

      <div className={`absolute inset-x-0 bottom-0 z-10 transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 border-t border-white/10 bg-black/70 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsPlaying((value) => !value)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button type="button" onClick={() => { const element = scrollRef.current; if (element) element.scrollTop = 0; setIsPlaying(false); }} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
              <SkipBack size={18} />
            </button>
            <button type="button" onClick={() => router.push("/app")} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
              <ArrowLeft size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2">
              <Gauge size={16} />
              <input type="range" min="40" max="260" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="w-28 accent-white" />
              <span className="min-w-[52px] text-right text-xs font-medium text-white">{Math.round(wpm)} WPM</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2">
              <Minus size={14} />
              <input type="range" min="20" max="120" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="w-20 accent-white" />
              <Plus size={14} />
            </div>
            <button type="button" onClick={() => setMirrorMode((value) => !value)} className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white">
              Mirror {mirrorMode ? "ON" : "OFF"}
            </button>
            <button type="button" onClick={() => setShowControls((value) => !value)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
              <Settings2 size={18} />
            </button>
            <button type="button" onClick={() => document.documentElement.requestFullscreen?.()} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
              <MonitorUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
