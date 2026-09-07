import { describe, expect, it } from 'vitest';
import { preprocessNews } from '../src/news/preprocess.js';

describe('preprocessNews', () => {
  it('removes tracking parameters and duplicate URLs while preserving article URLs', () => {
    const result = preprocessNews([
      {
        title: 'First article',
        url: 'https://example.com/story?utm_source=newsletter&id=42',
        source: 'Example',
        publishedAt: '2026-09-07T01:00:00.000Z',
      },
      {
        title: 'Same URL, newer copy',
        url: 'https://example.com/story?id=42&utm_medium=email',
        source: 'Example',
        publishedAt: '2026-09-07T02:00:00.000Z',
      },
      {
        title: 'Second article',
        url: 'https://example.com/other?ref=home',
        source: 'Example',
        publishedAt: '2026-09-07T03:00:00.000Z',
      },
    ], new Date('2026-09-07T04:00:00.000Z'));

    expect(result).toHaveLength(2);
    expect(result[0]?.url).toBe('https://example.com/story?id=42');
    expect(result[1]?.url).toBe('https://example.com/other?ref=home');
  });

  it('removes empty, invalid, and stale articles', () => {
    const result = preprocessNews([
      {
        title: '',
        url: 'https://example.com/empty',
        source: 'Example',
        publishedAt: '2026-09-07T03:00:00.000Z',
      },
      {
        title: 'Invalid URL',
        url: 'javascript:alert(1)',
        source: 'Example',
        publishedAt: '2026-09-07T03:00:00.000Z',
      },
      {
        title: 'Old article',
        url: 'https://example.com/old',
        source: 'Example',
        publishedAt: '2026-09-05T03:00:00.000Z',
      },
    ], new Date('2026-09-07T04:00:00.000Z'));

    expect(result).toEqual([]);
  });
});
