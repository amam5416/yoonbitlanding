/** 홈/목록 페이지 JSON-LD */
import { SITE } from '@/site.config';
import { casesForPage, caseUrl, pageHref } from '@/data/cases';
import { attorneys } from '@/data/attorneys';

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
        dateModified: SITE.updatedAt,
        reviewedBy: { '@id': `${SITE.url}/attr/${SITE.firm.lawyerSlug}#person` },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#cases`,
        name: `사칭 목록 ${page}페이지`,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: rows.length,
        itemListElement: rows.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.title, url: caseUrl(c.slug) })),
      },
      ...(page === 1
        ? attorneys.map((a) => ({
            '@type': 'Person',
            '@id': `${SITE.url}/attr/${a.slug}#person`,
            name: a.name,
            jobTitle: a.role,
            image: `${SITE.url}${a.img}`,
            url: `${SITE.url}/attr/${a.slug}`,
            worksFor: { '@id': `${SITE.url}/#legalservice` },
            alumniOf: a.education,
            hasCredential: a.credentials.map((c) => ({ '@type': 'EducationalOccupationalCredential', name: c })),
          }))
        : []),
    ],
  };
}
