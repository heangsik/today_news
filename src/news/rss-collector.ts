import { XMLParser } from 'fast-xml-parser';
import type { NewsCollector } from './collector.ts';
import type { NewsArticle } from './types.ts';

interface RssCollectorOptions {
  source: string;
  feedUrl: string;
  fetcher?: typeof fetch;
}

interface RssItem {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
}

interface ParsedRss {
  rss?: { channel?: { item?: RssItem | RssItem[] } };
}

function cleanDescription(description: string): string {
  const firstListItem = /<li[^>]*>([\s\S]*?)<\/li>/i.exec(description)?.[1] ?? description;
  return firstListItem.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export class RssCollector implements NewsCollector {
  private readonly source: string;
  private readonly feedUrl: string;
  private readonly fetcher: typeof fetch;
  private readonly parser = new XMLParser({
    ignoreAttributes: true,
    trimValues: true,
  });

  constructor(options: RssCollectorOptions) {
    this.source = options.source;
    this.feedUrl = options.feedUrl;
    this.fetcher = options.fetcher ?? fetch;
  }

  async collect(): Promise<NewsArticle[]> {
    const response = await this.fetcher(this.feedUrl);
    if (!response.ok) throw new Error(`RSS request failed: ${response.status}`);

    const parsed = this.parser.parse(await response.text()) as ParsedRss;
    const rawItems = parsed.rss?.channel?.item;
    const items = rawItems ? (Array.isArray(rawItems) ? rawItems : [rawItems]) : [];

    return items.flatMap((item) => {
      if (!item.title || !item.link || !item.pubDate) return [];
      const article: NewsArticle = {
        title: item.title,
        url: item.link,
        source: this.source,
        publishedAt: item.pubDate,
      };
      if (item.description) article.description = cleanDescription(item.description);
      return [article];
    });
  }
}
