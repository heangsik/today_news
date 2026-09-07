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

function importanceComment(article: NewsArticle, category: 'major' | 'it' | 'economy'): string {
  const text = `${article.title} ${article.description ?? ''}`;
  const topic = article.title.replace(/\s+-\s+[^-]+$/, '').replace(/\s+/g, ' ').trim().slice(0, 32);
  if (category === 'it' || /AI|LLM|반도체|클라우드|소프트웨어|보안|개발/i.test(text)) {
    return `‘${topic}’은 기술 생태계와 관련 산업의 변화를 보여주는 사례로, 실제 적용 범위와 파급 효과를 살펴볼 필요가 있습니다.`;
  }
  if (category === 'economy' || /금리|환율|증시|물가|고용|기업|산업|경제|정책/i.test(text)) {
    return `‘${topic}’은 시장과 기업 활동에 연결된 경제 이슈로, 정책 세부 내용과 후속 지표를 함께 확인할 가치가 있습니다.`;
  }
  if (/정부|국회|대통령|선거|수사|법원|정책/i.test(text)) {
    return `‘${topic}’은 공공 정책과 사회적 의사결정에 연결된 이슈라 후속 절차와 공식 발표가 중요합니다.`;
  }
  return category === 'major'
    ? `‘${topic}’은 국내 주요 매체가 비중 있게 다룬 당일 이슈로, 향후 사회적 영향과 추가 보도를 지켜볼 필요가 있습니다.`
    : `‘${topic}’은 당일 새롭게 보도된 이슈로, 관련 당사자의 후속 발표와 실제 영향 범위를 확인할 가치가 있습니다.`;
}

function developerImpactComment(article: NewsArticle): string {
  const text = `${article.title} ${article.description ?? ''}`;
  const topic = article.title.replace(/\s+-\s+[^-]+$/, '').replace(/\s+/g, ' ').trim().slice(0, 36);
  if (/AI|LLM|생성형|모델/i.test(text)) return `‘${topic}’ 관련 변화는 모델 활용 방식과 개발 도구 선택에 영향을 줄 수 있어 API·비용·성능 변화를 점검해야 합니다.`;
  if (/반도체|칩|GPU|메모리/i.test(text)) return `‘${topic}’은 하드웨어 공급과 컴퓨팅 비용에 연결될 수 있어 인프라 구성과 성능 계획을 다시 살펴볼 필요가 있습니다.`;
  if (/보안|해킹|취약점|개인정보/i.test(text)) return `‘${topic}’은 서비스 보안과 직접 연결되므로 의존성 패치, 접근 제어, 로그 점검 항목을 확인해야 합니다.`;
  if (/클라우드|서버|네트워크|데이터베이스/i.test(text)) return `‘${topic}’은 운영 환경과 시스템 구조에 영향을 줄 수 있어 배포 방식과 장애 대응 계획을 검토할 필요가 있습니다.`;
  return `‘${topic}’이 사용하는 기술과 공개된 변경 사항을 확인하고, 현재 개발 도구와 서비스에 적용할 필요가 있는지 판단해야 합니다.`;
}

const render = (article: NewsArticle, category: 'major' | 'it' | 'economy', includeDeveloperImpact = false) => [
  `### ${article.title}`,
  '',
  article.description ? `- 핵심 내용: ${article.description}` : '- 핵심 내용: 원문을 확인하세요.',
  `- 왜 중요한가: ${importanceComment(article, category)}`,
  ...(includeDeveloperImpact ? [`- 개발자에게 미치는 영향: ${developerImpactComment(article)}`] : []),
  `- 출처: [원문 보기](${article.url})`,
  '',
].join('\n');

const markdown = [
  '---', `title: "${date} 아침 뉴스"`, `date: ${date}`, 'description: "오늘의 주요 뉴스, IT 뉴스, 경제 뉴스"',
  'topNews:', ...top.slice(0, 5).map((article) => `  - "${article.title.replaceAll('"', '\\"')}"`), '---', '',
  '# 오늘 반드시 알아야 할 5가지', '', ...top.slice(0, 5).map((article, index) => `${index + 1}. [${article.title}](${article.url})`), '',
  '# 주요 뉴스 TOP 10', '', ...top.map((article) => render(article, 'major')),
  '# IT 뉴스 TOP 10', '', ...it.map((article) => render(article, 'it', true)),
  '# 세계 뉴스 TOP 10', '', ...world.map((article) => render(article, 'major')),
  '# 경제 뉴스 TOP 10', '', ...economy.map((article) => render(article, 'economy')),
].join('\n');

const outputPath = join('src', 'content', 'news', year, month, `${day}.md`);
await mkdir(join('src', 'content', 'news', year, month), { recursive: true });
await writeFile(outputPath, markdown, 'utf8');
console.log(`Generated ${outputPath}`);
