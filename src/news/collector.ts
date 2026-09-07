import type { NewsArticle } from './types.js';

export interface NewsCollector {
  collect(): Promise<NewsArticle[]>;
}
