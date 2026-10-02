/** 변호사 프로필 — 홈 섹션과 /attr/<slug> 상세에서 공용 */
export interface Attorney {
  slug: string;
  name: string;
  role: '대표변호사' | '변호사';
  img: string;
  /** 상세 페이지 meta description */
  description: string;
  /** 인용문 (대표변호사만) */
  quote?: string;
  /** 홈 카드에 노출할 핵심 이력 (2~3줄) */
  highlights: string[];
  /** 담당 분야 태그 (상세 페이지) */
  areas: string[];
  education: string[];
  career?: string[];
  credentials: string[];
}

export const attorneys: Attorney[] = [
  {
    slug: 'yoonsubin',
    name: '윤수빈',
    role: '대표변호사',
    img: '/lawyers/yoonsubin.png',
    description: '당신의 상황을 내 일처럼, 변호사가 처음부터 끝까지 함께합니다.',
    quote: '당신의 상황을 내 일처럼, 변호사가 처음부터 끝까지 함께합니다.',
    highlights: ['국토부 전세사기 피해지원팀 소속', '대법원 국선변호인', '경상북도의회 · 안동시 자문 변호사'],
    areas: ['리딩방 · 코인 사기', '피해금 추적 · 계좌 동결', '형사고소 · 민사소송', '전세사기'],
    education: ['성균관대학교 경영학과', '중앙대학교 법학전문대학원'],
    career: [
      '법무법인 클라스 변호사',
      '안동교육청 학교폭력 전담 변호사',
      '변호사 윤수빈 법률사무소 운영',
      '국토부 전세사기 피해지원팀 소속',
      '경상북도의회 자문 변호사',
      '(현)안동시 · (전)청송군 자문 변호사',
      '6개 시·군 학교폭력심의위원회 위원',
      '중앙행정심판위원회 국선대리인',
      '대법원 국선변호인',
    ],
    credentials: ['변호사'],
  },
  {
    slug: 'leehwayoung',
    name: '이화영',
    role: '변호사',
    img: '/lawyers/leehwayoung.png',
    description: '법무법인 윤빛 이화영 변호사의 학력·경력·자격 소개입니다. 사기 피해 사건을 직접 검토하고 대응합니다.',
    highlights: ['충남대학교 법학전문대학원', '대한법률구조공단 실무수습', '법무법인 선운 · 시냇가에심은나무'],
    areas: ['리딩방 · 코인 사기', '피해금 추적 · 계좌 동결', '형사고소 · 민사소송'],
    education: ['충남대학교 경영학과', '충남대학교 법학전문대학원'],
    career: ['대한법률구조공단 실무수습', '법무법인 시냇가에심은나무', '법무법인 선운', '법무법인 윤빛'],
    credentials: ['변호사'],
  },
  {
    slug: 'munjina',
    name: '문지나',
    role: '변호사',
    img: '/lawyers/munjina.png',
    description: '법무법인 윤빛 문지나 변호사의 학력·경력·자격 소개입니다. 사기 피해 사건을 직접 검토하고 대응합니다.',
    highlights: ['성균관대학교 졸업', '전북대학교 법학전문대학원 졸업'],
    areas: ['리딩방 · 코인 사기', '피해금 추적 · 계좌 동결', '형사고소 · 민사소송'],
    education: ['성균관대학교 졸업', '전북대학교 법학전문대학원 졸업'],
    credentials: ['변호사'],
  },
];
