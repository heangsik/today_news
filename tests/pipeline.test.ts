import { describe, expect, it } from 'vitest';
import { collectFromSources } from '../src/news/pipeline.js';
import type { NewsCollector } from '../src/news/collector.js';

const article = {
  title: 'Valid article',
  url: 'https://example.com/article',
  source: 'Example',
  publishedAt: '2026-09-07T03:00:00.000Z',
};

describe('collectFromSources', () => {
  it('keeps valid results when one collector fails', async () => {
    const collectors: NewsCollector[] = [
      { collect: async () => { throw new Error('offline'); } },
      { collect: async () => [article] },
    ];

    await expect(collectFromSources(collectors, new Date('2026-09-07T04:00:00.000Z')))
      .resolves.toEqual([article]);
  });

  it('fails when every source produces no valid article', async () => {
    await expect(collectFromSources([{ collect: async () => [] }], new Date()))
      .rejects.toThrow('No valid news articles collected');
  });
});
