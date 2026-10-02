/**
 * 사건 데이터 로더 — 빌드 타임에 한 번 실행.
 * - DATABASE_URL 이 있으면 Postgres `keywords(id, name, receipt_count, created_at)` 에서 읽음
 * - 없거나 실패하면 src/data/cases.static.ts 샘플로 폴백
 * 한 행(name) = 사건 하나 = /rcvlist/<slug> 정적 페이지 하나 (템플릿: src/components/CaseDetail.astro)
 */
import { SITE } from '@/site.config';
import { hasDatabase, query } from './db';
import { STATIC_ROWS, type KeywordRow } from './cases.static';

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
  status: '사건진행중';
  /** YYYY-MM-DD */
  date: string;
  /** 현재 사건 접수 건수 */
  receipts: number;
}

/** "(주)한미컴퍼니" → "주-한미컴퍼니", "IG트레이딩 거래소" → "ig트레이딩-거래소" */
export const toSlug = (n: string) =>
  n.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');

function toCase(row: KeywordRow): FraudCase {
  const name = String(row.name).trim();
  return {
    no: Number(row.id),
    slug: toSlug(name),
    name,
    title: `${name} 사칭 사기`,
    detailTitle: `${name} 관련 사칭 사기`,
    status: '사건진행중',
    date: new Date(row.created_at).toISOString().slice(0, 10),
    receipts: Number(row.receipt_count ?? 0),
  };
}

async function loadRows(): Promise<{ rows: KeywordRow[]; source: 'db' | 'static' }> {
  if (hasDatabase) {
    try {
      const rows = await query<KeywordRow>(
        'SELECT id, name, receipt_count, created_at FROM keywords WHERE COALESCE(is_active, true) ORDER BY created_at DESC, id DESC',
      );
      if (rows.length) return { rows, source: 'db' };
      console.warn('[cases] DB 에 행이 없어 샘플 데이터를 사용합니다.');
    } catch (e) {
      console.error('[cases] DB 조회 실패, 샘플 데이터 사용:', (e as Error).message);
    }
  }
  return { rows: STATIC_ROWS, source: 'static' };
}

const loaded = await loadRows();
export const DATA_SOURCE = loaded.source;

/** 슬러그 중복 제거 (같은 이름이 두 번 등록된 경우 최신 행만) */
const seen = new Set<string>();
export const cases: FraudCase[] = loaded.rows.map(toCase).filter((c) => c.slug && !seen.has(c.slug) && seen.add(c.slug));

console.log(`[cases] ${cases.length}건 로드 (source: ${DATA_SOURCE})`);

/** 히어로의 "현재 N건" 표시용 총 건수 */
export const TOTAL_CASES = cases.length ? Math.max(cases.length, cases[0].no) : 0;

export const caseHref = (slug: string) => `/rcvlist/${encodeURIComponent(slug)}`;
export const caseUrl = (slug: string) => `${SITE.url}${caseHref(slug)}`;

export const PER_PAGE = SITE.perPage;
export const totalPages = Math.max(1, Math.ceil(cases.length / PER_PAGE));
export const casesForPage = (page: number) => cases.slice((page - 1) * PER_PAGE, page * PER_PAGE);
export const pageHref = (page: number) => (page <= 1 ? '/' : `/page/${page}`);
