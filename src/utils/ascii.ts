export const BOX = {
  TL: '\u250C', // ┌
  TR: '\u2510', // ┐
  BL: '\u2514', // └
  BR: '\u2518', // ┘
  H: '\u2500',  // ─
  V: '\u2502',  // │
  CROSS: '\u253C', // ┼
  T_DOWN: '\u252C', // ┬
  T_UP: '\u2534',   // ┴
  T_RIGHT: '\u251C', // ├
  T_LEFT: '\u2524',  // ┤
} as const;

export const BLOCK = {
  FULL: '\u2588',    // █
  DARK: '\u2593',    // ▓
  MEDIUM: '\u2592',  // ▒
  LIGHT: '\u2591',   // ░
  HALF_LEFT: '\u258C', // ▌
  HALF_RIGHT: '\u2590', // ▐
} as const;

// Sparkline characters (bottom to top)
export const SPARK = ['\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'] as const;

export function horizontalLine(width: number): string {
  return BOX.H.repeat(width);
}

export function padRight(text: string, width: number): string {
  const len = text.length;
  return len >= width ? text.slice(0, width) : text + ' '.repeat(width - len);
}

export function padLeft(text: string, width: number): string {
  const len = text.length;
  return len >= width ? text.slice(0, width) : ' '.repeat(width - len) + text;
}

export function padCenter(text: string, width: number): string {
  const len = text.length;
  if (len >= width) return text.slice(0, width);
  const leftPad = Math.floor((width - len) / 2);
  const rightPad = width - len - leftPad;
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

export function sparkline(data: number[]): string {
  if (data.length === 0) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data
    .map((v) => {
      const idx = Math.round(((v - min) / range) * (SPARK.length - 1));
      return SPARK[idx];
    })
    .join('');
}

export function horizontalBar(value: number, max: number, width: number): string {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  return BLOCK.FULL.repeat(filled) + BLOCK.LIGHT.repeat(empty);
}

export function severityIndicator(level: number, max = 3): string {
  const filled = Math.min(level, max);
  return '[' + '!'.repeat(filled) + ' '.repeat(max - filled) + ']';
}
