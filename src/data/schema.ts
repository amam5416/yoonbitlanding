/** 홈/목록 페이지 JSON-LD */
import { SITE } from '@/site.config';
import { casesForPage, caseUrl, pageHref } from '@/data/cases';
import type { Attorney } from '@/data/attorneys';
import { HOME_FAQ } from '@/data/homeGuide';

/**
 * 변호사 Person 노드 — 사이트 공통(BaseLayout)에서 모든 페이지에 한 번씩 넣는다.
 * 페이지마다 따로 정의하지 않아야 @id 가 어디서나 해소되고 속성이 일관된다.
 */
export function personSchema(a: Attorney) {
  const url = `${SITE.url}/attr/${a.slug}`;
  return {
    '@type': 'Person',
    '@id': `${url}#person`,
    name: a.name,
    jobTitle: a.role,
    image: `${SITE.url}${a.img}`,
    url,
    worksFor: { '@id': `${SITE.url}/#legalservice` },
    alumniOf: a.education,
    knowsAbout: a.areas,
    hasCredential: a.credentials.map((c) => ({ '@type': 'EducationalOccupationalCredential', name: c })),
    ...(a.quote ? { description: a.quote } : {}),
  };
}

export function homeSchema(page: number) {
  const pageUrl = `${SITE.url}${pageHref(page)}`;
  const rows = casesForPage(page);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': page === 1 ? 'WebPage' : 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: SITE.title,
        description: SITE.description,
        inLanguage: 'ko-KR',
        isPartOf: { '@id': `${SITE.url}/#website` },
        about: { '@id': `${SITE.url}/#legalservice` },
        reviewedBy: { '@id': `${SITE.url}/attr/${SITE.firm.lawyerSlug}#person` },
        ...(page === 1 ? { speakable: { '@type': 'SpeakableSpecification', cssSelector: ['#home-summary'] } } : {}),
      },
      // 홈 FAQ (HomeGuide.astro 에 보이는 질문과 동일)
      ...(page === 1
        ? [{
            '@type': 'FAQPage',
            '@id': `${pageUrl}#faq`,
            inLanguage: 'ko-KR',
            isPartOf: { '@id': `${pageUrl}#webpage` },
            mainEntity: HOME_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }]
        : []),
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#cases`,
        name: `사칭 목록 ${page}페이지`,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: rows.length,
        itemListElement: rows.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.title, url: caseUrl(c.slug) })),
      },
      // 변호사 Person 노드는 BaseLayout 사이트 공통 스키마에 있음
    ],
  };
}
