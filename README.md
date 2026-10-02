# yoonbitlanding

윤빛 금융사기전담본부 사이트 (https://www.yoonbit.co.kr) — Astro 7 + Tailwind 4 정적 사이트.

```sh
npm install
npm run dev      # http://127.0.0.1:3000
npm run build    # dist/
```

## 구현된 페이지

| 경로 | 파일 | 비고 |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | 홈. 컴팩트 히어로(검색) → 사칭 목록(20건/페이지) → 변호사 카드 3인 → 사무소 위치 2곳 |
| `/page/N` | `src/pages/page/[page].astro` | 사칭 목록 정적 페이지네이션 (rel prev/next) |
| `/rcvlist/<slug>` | `src/pages/rcvlist/[slug].astro` → `src/components/CaseDetail.astro` | 사건 상세. 라우트는 사건마다 공용 템플릿을 호출해 정적 생성 |
| `/attr/<slug>` | `src/pages/attr/[slug].astro` | 변호사 상세. `src/data/attorneys.ts` 기준 3명 |
| `/privacy` | `src/pages/privacy.astro` | 개인정보처리방침 |
| `/thanks` | `src/pages/thanks.astro` | 상담 신청 완료 페이지 (noindex). `?case=` 로 사건명 표시 |
| `/api/inquiry` | `src/pages/api/inquiry.ts` | 접수 API (서버 실행, POST). 검증 후 `WEBHOOK_URL` 로 전달 |

## SEO 설정 (비가시 요소만 유지)

- JSON-LD: LegalService/LocalBusiness, WebSite+SearchAction, WebPage, ItemList, Person — `src/data/schema.ts`, `src/layouts/BaseLayout.astro`
- `public/robots.txt`(AI 크롤러 허용), `public/llms.txt`, `sitemap-index.xml`(빌드 시 생성, privacy 제외)
- 사칭 목록은 서버 렌더 + 정적 페이지네이션(`/page/N`, rel prev/next). 검색은 히어로의 인라인 인덱스로 클라이언트 처리
- `site.config.ts` `firm.sameAs` 에 외부 채널 URL을 넣으면 스키마에 자동 반영

## 데이터 (DB → 정적 생성)

- `src/data/cases.ts` — 빌드 시 한 번 실행되는 로더. `DATABASE_URL` 이 있으면 Postgres `keywords` 테이블을 읽고, 없거나 실패하면 `src/data/cases.static.ts` 샘플로 폴백.
- 테이블: `keywords(id, name, receipt_count, is_active, created_at)`. `name` 한 행 = 목록 한 줄 + `/rcvlist/<slug>` 상세 페이지 하나.
  슬러그 규칙: `(주)한미컴퍼니` → `주-한미컴퍼니`, `IG트레이딩 거래소` → `ig트레이딩-거래소` (같은 이름 중복은 최신 행만)
- 테이블 생성·샘플 입력: `DATABASE_URL=... npm run db:setup`
- 새 사건이 DB 에 추가되면 다시 빌드/배포해야 페이지가 생깁니다 (Vercel Deploy Hook 을 DB 입력 후 호출하면 자동화 가능).
- 상세 페이지 공용 템플릿: `src/components/CaseDetail.astro` — `FraudCase` 한 건을 props 로 받아 전체 화면을 렌더링. 문구·섹션 수정은 이 파일에서.
- `src/data/attorneys.ts` — 변호사 프로필. `highlights` 가 홈 카드에, 학력·경력·자격이 상세 페이지에 표시
- `src/site.config.ts` — 사이트명, 전화, 사무소 주소, 페이지당 행 수

## 배포 전 설정

- Vercel 환경변수 `WEBHOOK_URL`: 접수 데이터를 받을 주소. 미설정 시 운영에서는 접수가 실패 처리되고, 로컬 dev 에서는 로그만 남기고 성공 처리됨
- 접수 성공 → 전체 화면 잠금(inert) → `/thanks` 로 이동. 실패 → 팝업 안내 후 잠금 해제

