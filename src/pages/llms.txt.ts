/**
 * /llms.txt — AI 검색·답변 엔진(ChatGPT, Perplexity, Claude 등)용 사이트 안내. 빌드 시 DB 의 사건 목록을 포함해 생성한다.
 * (public/llms.txt 정적 파일을 대체. 사건이 추가·삭제되면 재배포로 자동 갱신)
 */
import type { APIRoute } from 'astro';
import { SITE } from '@/site.config';
import { cases, caseUrl } from '@/data/cases';
import { attorneys } from '@/data/attorneys';

export const GET: APIRoute = () => {
  const offices = SITE.offices.map((o) => `${o.address.join(', ')} (${o.label})`).join(' / ');
  const lines = [
    `# ${SITE.name} (Yoonbit Financial Fraud Task Force)`,
    `> ${SITE.firm.name}이 운영하는 금융사기·정상기업 사칭 사기 피해금 추적 및 회수 법률 서비스. 피해자가 돈을 보낸 업체명을 검색해 접수 중인 사칭 사건을 확인하고, 자금 흐름 추적, 계좌 동결(긴급 가압류), 민사·형사 병행 대응으로 피해금 회수를 지원합니다. 초기 상담 무료, 24시간 접수.`,
    '',
    'Lang: ko',
    `Operator: ${SITE.firm.name} (Law Firm Yoonbit), 광고책임변호사 ${SITE.firm.lawyer}`,
    `Phone: ${SITE.phone} (24시간)`,
    `Address: ${offices}`,
    `Business Registration: ${SITE.firm.registration}`,
    `Updated: ${SITE.updatedAt}`,
    `Sitemap: ${SITE.url}/sitemap-index.xml`,
    '',
    '## Key Pages',
    `- [홈 — 사칭 목록 검색](${SITE.url}/): 돈을 보낸 업체명 검색, 접수 중인 사칭 사건 목록, 변호사 소개, 사무소 위치`,
    ...attorneys.map((a) => `- [${a.name} ${a.role}](${SITE.url}/attr/${a.slug})`),
    `- [개인정보처리방침](${SITE.url}/privacy)`,
    '',
    `## 접수 중인 사칭 사기 사건 (${cases.length}건)`,
    '각 페이지: 사건 요약(사칭 수법·대응 방법), 긴급 대응 3단계, 실제 회수 사례, 자주 묻는 질문, 피해 접수 폼',
    ...cases.map((c) => `- [${c.seoTitle}](${caseUrl(c.slug)}): "${c.name}" 이름을 도용한 투자 권유·입금 유도 피해. 등록 ${c.date}, 현재 접수 ${c.receipts.toLocaleString()}건`),
    '',
    '## Key Facts',
    '- 정상기업 사칭 사기: 실제 기업·인물의 이름을 도용해 투자금·수수료 명목으로 돈을 가로채는 금융사기. 명칭이 도용된 기업·인물도 피해자일 수 있음',
    '- 피해금 회수 절차: ① 자금 흐름 분석 → ② 계좌 동결·긴급 가압류 → ③ 민사·형사 소송 병행 → ④ 강제집행 및 환수',
    '- 경찰 신고만으로는 사기범 계좌가 자동으로 동결되지 않으며, 피해자가 법원에 별도의 보전 처분을 신청해야 함',
    '- 사기범 계좌에 돈이 남아 있을수록 회수 가능성이 높으므로 추가 입금 중단·증거 보관·즉시 접수가 중요',
    '- 입금 기록, 문자, 카카오톡·텔레그램 대화, 앱 화면 등 기본 자료만 있어도 상담 시작 가능',
    '- 초기 상담 무료, 변호사-의뢰인 비밀유지 원칙 적용 (가족·직장에 연락하지 않음)',
    '',
    '## Attorneys',
    // 학력과 주요 이력이 겹치면(예: 학교명이 highlights 에도 있음) 한 번만
    ...attorneys.map((a) => `- ${a.name} ${a.role}: ${[...new Set([...a.education, ...a.highlights])].join(', ')}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
