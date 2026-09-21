import { describe, expect, it } from "vitest";
import {
  calculateReadingTime,
  calculateWordCount,
  getPixelsPerSecondFromWpm,
  getReadingPositionLabel,
  getWpmFromPixelsPerSecond,
  normalizeReadingPosition,
} from "./teleprompt";

describe("teleprompt utilities", () => {
  it("calculates word count", () => {
    expect(calculateWordCount("alpha beta gamma")).toBe(3);
    expect(calculateWordCount("  hello   world  ")).toBe(2);
    expect(calculateWordCount("")).toBe(0);
  });

  it("calculates reading time", () => {
    expect(calculateReadingTime(140)).toBe(1);
    expect(calculateReadingTime(280)).toBe(2);
    expect(calculateReadingTime(0)).toBe(0);
  });

  it("converts speed values", () => {
    expect(getWpmFromPixelsPerSecond(108)).toBeCloseTo(120, 1);
    expect(getPixelsPerSecondFromWpm(120)).toBeCloseTo(108, 1);
  });

  it("normalizes reading positions", () => {
    expect(normalizeReadingPosition(-1)).toBe(0);
    expect(normalizeReadingPosition(1.5)).toBe(1);
    expect(normalizeReadingPosition(0.42)).toBe(0.42);
  });

  it("formats reading position labels", () => {
    expect(getReadingPositionLabel(0.5)).toBe("50%");
    expect(getReadingPositionLabel(1)).toBe("100%");
  });
});
