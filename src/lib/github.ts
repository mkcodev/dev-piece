// Star count fetched once per build (memoised across all pages). The site stays
// 100% static: no request ever leaves the visitor's browser for this.
export const REPO_URL = 'https://github.com/mkcodev/dev-piece';
const API_URL = 'https://api.github.com/repos/mkcodev/dev-piece';

let starsPromise: Promise<number | null> | null = null;

async function fetchStars(): Promise<number | null> {
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(API_URL, { headers, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

/** Stars at build time, or null when the API is unreachable/rate-limited. */
export function getStars(): Promise<number | null> {
  starsPromise ??= fetchStars();
  return starsPromise;
}

export function formatStars(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, '')}k`;
}
