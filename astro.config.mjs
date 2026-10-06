// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.yoonbit.co.kr',
  output: 'static',
  // 접수 API(/api/inquiry)만 서버에서 실행 (prerender = false). 나머지는 정적
  adapter: vercel(),
  trailingSlash: 'never',
  // 옛 주소 → 새 주소 (정적 빌드에서는 meta refresh 페이지로 생성, Vercel 에서는 vercel.json 이 301 처리)
  redirects: {
    '/attorneys/[slug]': '/attr/[slug]',
    '/recovery/[slug]': '/rcvlist/[slug]',
  },
  // 사이트맵은 src/pages/sitemap-index.xml.ts, sitemap-0.xml.ts 가 DB 등록일(lastmod)로 직접 생성
  integrations: [],
  vite: { plugins: [tailwindcss()] },
  // 4321은 Windows 예약 포트 범위(4262~4361)와 겹쳐 바인딩이 거부됨
  server: { port: 3000, host: '127.0.0.1' },
});
