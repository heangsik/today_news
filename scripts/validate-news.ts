import { readFile } from 'node:fs/promises';
import type { NewsArticle } from '../src/news/types.ts';

const path = 'data/processed/today.json';
const articles = JSON.parse(await readFile(path, 'utf8')) as unknown;
if (!Array.isArray(articles) || articles.length === 0) throw new Error('Processed news is empty');

for (const [index, article] of articles.entries()) {
  if (!article || typeof article !== 'object') throw new Error(`Invalid article at index ${index}`);
  const candidate = article as Partial<NewsArticle>;
  if (!candidate.title?.trim() || !candidate.url?.trim() || !candidate.source?.trim() || !candidate.publishedAt?.trim()) {
    throw new Error(`Missing required article field at index ${index}`);
  }
  const parsedUrl = new URL(candidate.url);
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') throw new Error(`Invalid article URL at index ${index}`);
  if (Number.isNaN(Date.parse(candidate.publishedAt))) throw new Error(`Invalid article date at index ${index}`);
}

console.log(`Validated ${articles.length} articles`);
