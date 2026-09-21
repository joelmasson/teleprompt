export type ScriptSettings = {
  fontSize: number;
  scrollSpeed: number;
  lineSpacing: number;
  textWidth: number;
  textAlignment: "left" | "center";
  mirrorMode: boolean;
  lastPosition: number;
};

export type ScriptRecord = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  word_count: number;
  created_at: string;
  updated_at: string;
  last_position: number;
  font_size: number;
  scroll_speed: number;
  line_spacing: number;
  text_width: number;
  text_alignment: "left" | "center";
  mirror_mode: boolean;
};

export function calculateWordCount(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export function calculateReadingTime(
  words: number,
  wordsPerMinute = 140,
): number {
  if (!words) return 0;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getWpmFromPixelsPerSecond(speed: number): number {
  return Math.round((speed / 0.9) * 10) / 10;
}

export function getPixelsPerSecondFromWpm(wpm: number): number {
  return Math.round(wpm * 0.9 * 10) / 10;
}

export function normalizeReadingPosition(value: number): number {
  return clamp(Number.isFinite(value) ? value : 0, 0, 1);
}

export function getReadingPositionLabel(position: number): string {
  const normalized = normalizeReadingPosition(position);
  return `${Math.round(normalized * 100)}%`;
}
