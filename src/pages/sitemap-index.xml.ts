/** /sitemap-index.xml — robots.txt 와 검색엔진에 제출하는 주소. 실제 URL 목록은 /sitemap-0.xml */
import type { APIRoute } from 'astro';
import { SITE } from '@/site.config';
import { cases } from '@/data/cases';

export const GET: APIRoute = () => {
  const latest = cases.map((c) => c.date).sort().at(-1);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <sitemap><loc>${SITE.url}/sitemap-0.xml</loc>${latest ? `<lastmod>${latest}</lastmod>` : ''}</sitemap>`,
    '</sitemapindex>',
    '',
  ].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
