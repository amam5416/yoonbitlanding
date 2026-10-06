// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
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
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/privacy') && !page.includes('/404') && !page.includes('/thanks'),
      serialize(item) {
        // lastmod 는 넣지 않는다: 실제 수정일을 알 수 없는데 빌드일을 넣으면 모든 URL 이 매번 '변경됨'으로 보여 신뢰를 잃는다
        if (item.url.endsWith('.com/') || item.url.endsWith('.com')) item.priority = 1.0;
        else if (item.url.includes('/rcvlist/')) item.priority = 0.8;
        else item.priority = 0.5;
        return item;
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  // 4321은 Windows 예약 포트 범위(4262~4361)와 겹쳐 바인딩이 거부됨
  server: { port: 3000, host: '127.0.0.1' },
});
