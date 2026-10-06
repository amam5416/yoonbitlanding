/**
 * 사건 데이터 로더 — 빌드 타임에 한 번 실행. 데이터 출처는 Postgres `keywords` 테이블뿐이다.
 * - DATABASE_URL 이 없거나 조회에 실패하면 빌드를 중단한다 (가짜 데이터로 배포되는 일이 없도록)
 * - is_active=false, is_blocked=true 행은 제외 → 상세 페이지가 생성되지 않아 URL 직접 접근 시 404
 * - 행이 0건이면 빈 목록으로 빌드된다 (관리 도구 yoonbitadmin 에서 키워드를 넣고 재배포)
 * 한 행(name) = 사건 하나 = /rcvlist/<slug> 정적 페이지 하나 (템플릿: src/components/CaseDetail.astro)
 */
import { SITE } from '@/site.config';
import { hasDatabase, query } from './db';

/** keywords 테이블 행 (관리 도구 yoonbitadmin 이 관리) */
export interface KeywordRow {
  id: number;
  name: string;
  receipt_count: number;
  created_at: string; // ISO
}

export interface FraudCase {
  /** 목록 번호 (DB id) */
  no: number;
  /** URL 세그먼트 (한글 유지, 공백·기호는 '-') */
  slug: string;
  /** 사칭 대상 명칭 (예: (주)한미컴퍼니) */
  name: string;
  /** 목록 제목: "<name> 사칭 사기" */
  title: string;
  /** 상세 제목: "<name> 관련 사칭 사기" */
  detailTitle: string;
  /** 검색엔진 노출 제목(<title>·og:title): "<name> 사기 사칭 | <SEO_TITLE_TAILS 중 하나>" */
  seoTitle: string;
  status: '사건진행중';
  /** YYYY-MM-DD */
  date: string;
  /** 현재 사건 접수 건수 */
  receipts: number;
}

/** "(주)한미컴퍼니" → "주-한미컴퍼니", "IG트레이딩 거래소" → "ig트레이딩-거래소" */
export const toSlug = (n: string) =>
  n.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');

/**
 * 네이버·구글에 노출되는 상세 페이지 제목 꼬리. 키워드마다 하나가 선택된다.
 * 선택은 키워드 이름의 해시로 결정해서, 빌드를 다시 해도 같은 키워드는 항상 같은 제목을 유지한다
 * (빌드마다 제목이 바뀌면 검색엔진이 매번 재평가해 순위에 불리).
 */
export const SEO_TITLE_TAILS = [
  '피해자라면 반드시 확인하세요',
  '피해 발생시 대응 방법',
  '내 피해금 회수 가능성 확인',
  '피해자라면 지금 확인해야 할 사항',
  '피해 사례 및 대응 절차 안내',
  '피해자 상담, 대응 접수',
  '금융사기 피해 공동대응',
  '피해자 공동대응센터',
  '금융사기 피해자 공동대응',
  '함께 대응하는 방법',
] as const;

/** 문자열 → 0 이상 정수 (FNV-1a). 키워드별로 고정된 "랜덤" 선택에 사용 */
const hash = (s: string) => {
  let h = 0x811c9dc5;
  for (const ch of s) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
};

export const seoTitleFor = (name: string) => `${name} 사기 사칭 | ${SEO_TITLE_TAILS[hash(name) % SEO_TITLE_TAILS.length]}`;

function toCase(row: KeywordRow): FraudCase {
  const name = String(row.name).trim();
  return {
    no: Number(row.id),
    slug: toSlug(name),
    name,
    title: `${name} 사칭 사기`,
    detailTitle: `${name} 관련 사칭 사기`,
    seoTitle: seoTitleFor(name),
    status: '사건진행중',
    date: new Date(row.created_at).toISOString().slice(0, 10),
    receipts: Number(row.receipt_count ?? 0),
  };
}

async function loadRows(): Promise<KeywordRow[]> {
  if (!hasDatabase) {
    throw new Error('[cases] DATABASE_URL 이 없습니다. 사건 목록은 Postgres keywords 테이블에서만 읽습니다 (.env 또는 Vercel 환경변수에 설정).');
  }
  const rows = await query<KeywordRow>(
    'SELECT id, name, receipt_count, created_at FROM keywords      WHERE COALESCE(is_active, true) AND NOT COALESCE(is_blocked, false)      ORDER BY created_at DESC, id DESC',
  );
  if (!rows.length) console.warn('[cases] keywords 테이블에 노출할 행이 없습니다. 빈 목록으로 빌드합니다.');
  return rows;
}

const rows = await loadRows();

/** 슬러그 중복 제거 (같은 이름이 두 번 등록된 경우 최신 행만) */
const seen = new Set<string>();
export const cases: FraudCase[] = rows.map(toCase).filter((c) => c.slug && !seen.has(c.slug) && seen.add(c.slug));

console.log(`[cases] ${cases.length}건 로드 (source: db)`);

/** 히어로·목록의 "현재 N건" — 실제 노출 건수 */
export const TOTAL_CASES = cases.length;

export const caseHref = (slug: string) => `/rcvlist/${encodeURIComponent(slug)}`;
export const caseUrl = (slug: string) => `${SITE.url}${caseHref(slug)}`;

export const PER_PAGE = SITE.perPage;
export const totalPages = Math.max(1, Math.ceil(cases.length / PER_PAGE));
export const casesForPage = (page: number) => cases.slice((page - 1) * PER_PAGE, page * PER_PAGE);
export const pageHref = (page: number) => (page <= 1 ? '/' : `/page/${page}`);
