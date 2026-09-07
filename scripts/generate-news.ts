import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getDateParts, getSeoulDate } from '../src/news/date.ts';
import type { NewsArticle } from '../src/news/types.ts';

const articles = JSON.parse(await readFile('data/processed/today.json', 'utf8')) as NewsArticle[];
const score = (article: NewsArticle) => (article.title + ' ' + (article.description ?? '')).length;
const ranked = [...articles].sort((a, b) => score(b) - score(a));
const top = ranked.slice(0, 10);
const it = ranked.filter((article) => /AI|LLM|반도체|클라우드|소프트웨어|보안|개발/i.test(`${article.title} ${article.description ?? ''}`)).slice(0, 10);
const world = ranked.filter((article) => article.source === '세계 뉴스').slice(0, 10);
const economy = ranked.filter((article) => /경제|금리|환율|증시|물가|고용|기업|산업|정책|market|economy|rate/i.test(`${article.title} ${article.description ?? ''}`)).slice(0, 10);
const date = getSeoulDate();
const { year, month, day } = getDateParts(date);
const updatedAt = new Date().toISOString();

const render = (article: NewsArticle) => [
  `### ${article.title}`,
  '',
  article.description ? `- 핵심 내용: ${article.description}` : '- 핵심 내용: 원문을 확인하세요.',
  `- 출처: [원문 보기](${article.url})`,
  '',
].join('\n');

const markdown = [
  '---', `title: "${date} 아침 뉴스"`, `date: ${date}`, `updatedAt: "${updatedAt}"`, 'description: "오늘의 주요 뉴스, IT 뉴스, 경제 뉴스"',
  'topNews:', ...top.slice(0, 5).map((article) => `  - "${article.title.replaceAll('"', '\\"')}"`), '---', '',
  `_업데이트: ${updatedAt}_`, '',
  '# 오늘 반드시 알아야 할 5가지', '', ...top.slice(0, 5).map((article, index) => `${index + 1}. [${article.title}](${article.url})`), '',
  '# 주요 뉴스 TOP 10', '', ...top.map((article) => render(article)),
  '# IT 뉴스 TOP 10', '', ...it.map((article) => render(article)),
  '# 세계 뉴스 TOP 10', '', ...world.map((article) => render(article)),
  '# 경제 뉴스 TOP 10', '', ...economy.map((article) => render(article)),
].join('\n');

const outputPath = join('src', 'content', 'news', year, month, `${day}.md`);
await mkdir(join('src', 'content', 'news', year, month), { recursive: true });
await writeFile(outputPath, markdown, 'utf8');
console.log(`Generated ${outputPath}`);
