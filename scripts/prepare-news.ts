import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getSeoulDate } from '../src/news/date.ts';
import { preprocessNews } from '../src/news/preprocess.ts';
import type { NewsArticle } from '../src/news/types.ts';

const date = getSeoulDate();
const rawPath = join('data', 'raw', `${date}.json`);
const raw = JSON.parse(await readFile(rawPath, 'utf8')) as NewsArticle[];
const processed = preprocessNews(raw, new Date());
await mkdir(join('data', 'processed'), { recursive: true });
await writeFile(join('data', 'processed', 'today.json'), `${JSON.stringify(processed, null, 2)}\n`, 'utf8');
console.log(`Prepared ${processed.length} articles`);
