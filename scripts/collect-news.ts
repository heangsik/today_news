import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RssCollector, collectFromSources } from '../src/news/index.ts';
import { getSeoulDate } from '../src/news/date.ts';

const feeds = [
  { source: 'Google News Korea', feedUrl: 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko' },
  { source: '연합뉴스', feedUrl: 'https://www.yna.co.kr/rss/news.xml' },
];

const now = new Date();
const date = getSeoulDate(now);
const articles = await collectFromSources(feeds.map((feed) => new RssCollector(feed)), now);
const outputPath = join('data', 'raw', `${date}.json`);
await mkdir(join('data', 'raw'), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(articles, null, 2)}\n`, 'utf8');
console.log(`Collected ${articles.length} articles to ${outputPath}`);
