/** 사이트·사무소 공통 설정 */
export const SITE = {
  name: '윤빛 금융사기전담본부',
  tagline: '사기 사건 공동고소 · 형사대응 현황',
  title: '윤빛 금융사기전담본부 | 사기 피해금 추적·계좌 동결·회수 상담',
  description:
    '법무법인 윤빛이 운영하는 사기·사칭 피해금 회수 전담본부. 피해 업체명·플랫폼명을 검색하고 자금 흐름 추적, 계좌 동결, 민사·형사 병행으로 피해금 회수 가능성을 확인하세요. 24시간 무료 상담.',
  url: 'https://www.yoonbit.co.kr',
  /** 콘텐츠 최종 검토일 (빌드 시 갱신) */
  updatedAt: new Date().toISOString().slice(0, 10),
  firm: {
    name: '법무법인 윤빛',
    lawyer: '윤수빈 변호사',
    lawyerSlug: 'yoonsubin',
    registration: '754-87-03255',
    /** 브랜드 엔티티 연결 (GEO) — 실제 채널 URL로 교체. 비어 있으면 출력하지 않음 */
    sameAs: [] as string[],
  },
  phone: '010-2862-5653',
  phoneHref: 'tel:01028625653',
  offices: [
    {
      id: 'gangnam',
      label: '강남 본사무소',
      mapTitle: '강남사무소 위치 지도',
      address: ['서울 강남구 영동대로 621', '621빌딩 11층'],
      mapQuery: '서울 강남구 영동대로 621',
      geo: { lat: 37.5133, lng: 127.0587 },
    },
    {
      id: 'andong',
      label: '안동 분사무소',
      mapTitle: '안동사무소 위치 지도',
      address: ['경북 안동시 강남5길 20-26', '2층 201호'],
      mapQuery: '경북 안동시 강남5길 20-26',
      geo: null,
    },
  ],
  footerAddress: '서울시 강남구 영동대로 621, 621빌딩 11층',
  /** 목록 페이지당 행 수 */
  perPage: 20,
} as const;
