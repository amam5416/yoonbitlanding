/**
 * /sitemap-0.xml — 빌드 시 생성. lastmod 는 DB 의 실제 날짜만 쓴다.
 * - 사건 상세: keywords.created_at (등록일)
 * - 홈: 가장 최근 사건 등록일 (목록이 바뀐 시점)
 * - 변호사 프로필: 수정 이력이 없으므로 lastmod 생략
 * /sitemap-index.xml 이 이 파일을 가리킨다. 개인정보처리방침·감사·404 는 noindex 라 제외.
 */
import type { APIRoute } from 'astro';
import { SITE } from '@/site.config';
import { cases, caseUrl } from '@/data/cases';
import { attorneys } from '@/data/attorneys';

interface Entry { loc: string; lastmod?: string; priority: number }

export const GET: APIRoute = () => {
  const latest = cases.map((c) => c.date).sort().at(-1);
  const entries: Entry[] = [
    { loc: `${SITE.url}/`, lastmod: latest, priority: 1.0 },
    ...cases.map((c) => ({ loc: caseUrl(c.slug), lastmod: c.date, priority: 0.8 })),
    ...attorneys.map((a) => ({ loc: `${SITE.url}/attr/${a.slug}`, priority: 0.5 })),
  ];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((e) =>
      `  <url><loc>${escapeXml(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}<priority>${e.priority.toFixed(1)}</priority></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
