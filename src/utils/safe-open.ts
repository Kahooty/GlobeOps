/**
 * Safely open a URL in a new tab. Only allows http/https protocols
 * to prevent javascript: or data: URL injection.
 */
export function safeOpenLink(url: string | undefined | null): void {
  if (!url) return;
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } catch {
    // Invalid URL — silently ignore
  }
}
