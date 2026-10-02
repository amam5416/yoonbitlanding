/**
 * DATABASE_URL 이 없을 때 쓰는 샘플 데이터 (DB 의 keywords 테이블과 같은 모양).
 * 운영 빌드에서는 DB 가 우선이며, 이 파일은 로컬 미리보기용입니다.
 */
export interface KeywordRow {
  id: number;
  name: string;
  receipt_count: number;
  created_at: string; // ISO
}

const names = [
  '(주)한미컴퍼니', 'HgTH', 'IG트레이딩 거래소', '프랭클린템플턴 임채영매니저', 'Nexuqone', 'Mysticsitar', 'Izack', 'Nudstudio',
  '코인플레이스', '아이카 머니라운지', '제이원', '글로벌이다단계', '리버스 증권', '골드 하이 프로젝트',
  '솔루 리치 프로젝트 SVIP', '포스트 자산운용주식회사 클럽', '브릿지파트너스', '크립토클럽 코인채널 매니저',
  'Reverie', 'OURBIT', 'WTSTrading', '블루오션 투자클럽', '메타웰스 리딩방', '한국투자 사칭 김민수 팀장',
  'NH선물 사칭 거래소', '키움 VIP 리딩방', '비트엑스체인지', '앤트파이낸셜 코리아', '유안타 사칭 투자방',
  '삼성자산운용 사칭', '미래에셋 사칭 박지훈', '글로벌FX마켓', '코스닥 상한가 클럽', '더블업 투자자문',
  '스마트머니 리딩방', '제네시스 캐피탈', '한화투자 사칭 리딩', '프라임 에셋', 'ACE트레이딩', 'TOP마진거래소',
  '월가의 전설 리딩방',
];

const seed = (s: string) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return 12 + (h % 188); };
const base = new Date('2026-10-01T00:00:00Z');

export const STATIC_ROWS: KeywordRow[] = names.map((name, i) => {
  const d = new Date(base); d.setUTCDate(d.getUTCDate() - Math.floor(i / 8));
  return { id: 27229 - i, name, receipt_count: seed(name), created_at: d.toISOString() };
});
