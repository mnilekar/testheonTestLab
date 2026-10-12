import { describe, expect, it } from 'vitest';

function luminance(hex: string): number {
  const matches = hex.replace('#', '').match(/.{2}/g);
  if (!matches || matches.length !== 3)
    throw new Error(`Invalid color: ${hex}`);
  const channels = matches
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return (
    0.2126 * (channels[0] ?? 0) +
    0.7152 * (channels[1] ?? 0) +
    0.0722 * (channels[2] ?? 0)
  );
}

function contrast(foreground: string, background: string): number {
  const high = Math.max(luminance(foreground), luminance(background));
  const low = Math.min(luminance(foreground), luminance(background));
  return (high + 0.05) / (low + 0.05);
}

describe('accessible color contracts', () => {
  it.each([
    ['brand action', '#6528f7', '#ffffff'],
    ['focus ring', '#0b63ce', '#ffffff'],
    ['status badge', '#596273', '#eef0f4'],
    ['beginner badge', '#0d5f3c', '#e6f7ee'],
    ['intermediate badge', '#0b4a8b', '#e7f1ff'],
    ['advanced badge', '#7a4200', '#fff3d6'],
    ['expert badge', '#8a174d', '#fde8f1'],
  ])('%s meets WCAG AA for normal text', (_name, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
