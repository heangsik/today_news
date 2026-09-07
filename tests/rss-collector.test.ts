import { describe, expect, it, vi } from 'vitest';
import { RssCollector } from '../src/news/rss-collector.js';

describe('RssCollector', () => {
  it('collects RSS items into NewsArticle values', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(`
      <rss><channel>
        <item>
          <title>New technology</title>
          <description>Short summary</description>
          <link>https://example.com/article?utm_source=rss&amp;id=7</link>
          <pubDate>Mon, 07 Sep 2026 03:00:00 GMT</pubDate>
        </item>
      </channel></rss>
    `, { status: 200, headers: { 'content-type': 'application/xml' } }));

    const collector = new RssCollector({
      source: 'Example RSS',
      feedUrl: 'https://example.com/feed.xml',
      fetcher,
    });

    await expect(collector.collect()).resolves.toEqual([
      {
        title: 'New technology',
        description: 'Short summary',
        url: 'https://example.com/article?utm_source=rss&id=7',
        source: 'Example RSS',
        publishedAt: 'Mon, 07 Sep 2026 03:00:00 GMT',
      },
    ]);
    expect(fetcher).toHaveBeenCalledWith('https://example.com/feed.xml');
  });

  it('fails when the feed response is not successful', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('Unavailable', { status: 503 }));
    const collector = new RssCollector({ source: 'Example RSS', feedUrl: 'https://example.com/feed.xml', fetcher });

    await expect(collector.collect()).rejects.toThrow('RSS request failed: 503');
  });
});
