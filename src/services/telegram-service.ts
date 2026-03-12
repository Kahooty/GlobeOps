/**
 * Telegram OSINT Service — Polls public Telegram channels via RSS bridges.
 *
 * Uses rsshub.app to convert public Telegram channels into RSS feeds,
 * which are then fetched through the existing RSS proxy infrastructure.
 *
 * Channels are curated for OSINT value — conflict monitoring, defense
 * intelligence, geopolitical analysis, and breaking news.
 */

export interface TelegramChannel {
  id: string;
  name: string;
  handle: string;       // e.g. 'ukraine_war_map'
  category: 'conflict' | 'intel' | 'defense' | 'breaking' | 'analysis';
  region?: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Curated Telegram channels for OSINT monitoring.
 * These are public channels with geopolitical/defense intelligence value.
 * RSS bridge URL pattern: https://rsshub.app/telegram/channel/{handle}
 */
export const TELEGRAM_CHANNELS: TelegramChannel[] = [
  // ─── Conflict Monitoring ───
  { id: 'tg-liveuamap', name: 'Liveuamap', handle: 'liveuamap', category: 'conflict', region: 'EUROPE', priority: 'high' },
  { id: 'tg-intelslava', name: 'Intel Slava Z', handle: 'inaborinmzintel', category: 'conflict', region: 'EUROPE', priority: 'high' },
  { id: 'tg-rybar', name: 'Rybar EN', handle: 'ryaborenglish', category: 'conflict', region: 'EUROPE', priority: 'medium' },

  // ─── Defense & Intel ───
  { id: 'tg-osintdefender', name: 'OSINT Defender', handle: 'osaborintdef1', category: 'intel', priority: 'high' },
  { id: 'tg-intelcrab', name: 'Intel Crab', handle: 'intel_crab', category: 'intel', priority: 'medium' },
  { id: 'tg-auroraintel', name: 'Aurora Intel', handle: 'AuroraIntel', category: 'intel', priority: 'high' },

  // ─── Middle East ───
  { id: 'tg-intikilab', name: 'Intel Lab ME', handle: 'inabortikilab', category: 'conflict', region: 'MIDDLE EAST', priority: 'high' },

  // ─── Breaking News ───
  { id: 'tg-breaking-news', name: 'Breaking News', handle: 'breakingnewsglb', category: 'breaking', priority: 'medium' },

  // ─── Analysis ───
  { id: 'tg-warmonitor', name: 'War Monitor', handle: 'warmonitors', category: 'analysis', priority: 'medium' },
  { id: 'tg-middleeastspec', name: 'ME Spectator', handle: 'MiddleEastSpectator', category: 'analysis', region: 'MIDDLE EAST', priority: 'medium' },
];

/**
 * Build RSS feed URL for a Telegram channel via rsshub.app bridge.
 */
export function getTelegramRssUrl(handle: string): string {
  return `https://rsshub.app/telegram/channel/${handle}`;
}

/**
 * Get channels filtered by category.
 */
export function getChannelsByCategory(category: TelegramChannel['category']): TelegramChannel[] {
  return TELEGRAM_CHANNELS.filter((ch) => ch.category === category);
}

/**
 * Get high-priority channels for critical monitoring.
 */
export function getHighPriorityChannels(): TelegramChannel[] {
  return TELEGRAM_CHANNELS.filter((ch) => ch.priority === 'high');
}

/** Category display labels */
export const TELEGRAM_CATEGORY_LABELS: Record<string, string> = {
  conflict: 'CONFLICT',
  intel: 'INTEL',
  defense: 'DEFENSE',
  breaking: 'BREAKING',
  analysis: 'ANALYSIS',
};
