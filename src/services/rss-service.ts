import type { FeedItem, FeedCategory } from '@/types';

function parseRssXml(xml: string): Array<{
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  contentSnippet?: string;
}> {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const items: Array<{
    title?: string;
    link?: string;
    guid?: string;
    pubDate?: string;
    contentSnippet?: string;
  }> = [];

  // Handle both RSS <item> and Atom <entry>
  const entries = doc.querySelectorAll('item, entry');

  entries.forEach((entry) => {
    const title = entry.querySelector('title')?.textContent ?? undefined;
    const guid = entry.querySelector('guid')?.textContent ?? undefined;
    const pubDate =
      entry.querySelector('pubDate')?.textContent ??
      entry.querySelector('published')?.textContent ??
      entry.querySelector('updated')?.textContent ??
      undefined;

    // RSS uses <link>, Atom uses <link href="...">
    let link = entry.querySelector('link')?.textContent ?? undefined;
    if (!link) {
      link = entry.querySelector('link')?.getAttribute('href') ?? undefined;
    }

    // Try description / summary / content for snippet
    const rawContent =
      entry.querySelector('description')?.textContent ??
      entry.querySelector('summary')?.textContent ??
      entry.querySelector('content')?.textContent ??
      '';
    // Strip HTML tags for a plain-text snippet (regex-based, no DOM/XSS risk)
    const contentSnippet = rawContent
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);

    items.push({ title, link, guid, pubDate, contentSnippet });
  });

  return items;
}

// Client-side fetch timeout — slightly longer than the proxy timeout (15s)
// so the proxy can return its own timeout error (504) before the client aborts.
const CLIENT_FETCH_TIMEOUT_MS = 20_000;

export async function fetchFeed(
  feedUrl: string,
  sourceId: string,
  sourceName: string,
  category: FeedCategory
): Promise<FeedItem[]> {
  const proxyUrl = `/api/rss?url=${encodeURIComponent(feedUrl)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLIENT_FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(proxyUrl, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Feed fetch failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const feedItems = parseRssXml(xml);

  // Always include index in ID to guarantee uniqueness — some feeds
  // (e.g. Yahoo Finance) emit every item with the same guid.
  return feedItems.map((item, idx) => {
    const rawId = item.guid || item.link || `${Date.now()}`;
    return {
      id: `${sourceId}:${rawId}:${idx}`,
      title: item.title?.trim() || 'Untitled',
      link: item.link || '',
      pubDate: (() => {
        if (!item.pubDate) return new Date();
        const d = new Date(item.pubDate);
        return isNaN(d.getTime()) ? new Date() : d;
      })(),
      source: sourceName,
      sourceId,
      category,
      snippet: item.contentSnippet?.slice(0, 200) || '',
    };
  });
}
