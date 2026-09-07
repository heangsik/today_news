import type { NewsArticle } from './types.js';

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const TRACKING_PARAMETERS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
]);

function cleanUrl(rawUrl: string): string | undefined {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;

    for (const parameter of [...parsed.searchParams.keys()]) {
      if (TRACKING_PARAMETERS.has(parameter.toLowerCase())) parsed.searchParams.delete(parameter);
    }

    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function preprocessNews(articles: NewsArticle[], now: Date): NewsArticle[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const cutoff = now.getTime() - MAX_AGE_MS;

  return articles.flatMap((article) => {
    const title = article.title.trim();
    const url = cleanUrl(article.url);
    const publishedAt = Date.parse(article.publishedAt);
    if (!title || !url || Number.isNaN(publishedAt) || publishedAt < cutoff) return [];

    const titleKey = title.toLocaleLowerCase();
    if (seenUrls.has(url) || seenTitles.has(titleKey)) return [];

    seenUrls.add(url);
    seenTitles.add(titleKey);
    return [{ ...article, title, url }];
  });
}
