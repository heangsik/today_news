import type { NewsArticle, NewsCollector } from './index.ts';
import { preprocessNews } from './preprocess.ts';

export async function collectFromSources(
  collectors: NewsCollector[],
  now: Date,
): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(collectors.map((collector) => collector.collect()));
  const articles = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  const processed = preprocessNews(articles, now);
  if (processed.length === 0) throw new Error('No valid news articles collected');
  return processed;
}
