/**
 * keywords 테이블 생성 + (비어 있으면) 샘플 사건 입력.
 * 사용법: node scripts/db-setup.mjs            (DATABASE_URL 환경변수 사용)
 *        node scripts/db-setup.mjs <DATABASE_URL>
 * 로컬에서 Railway/Neon 등 외부 DB 는 public URL 을 쓰세요.
 */
import pg from 'pg';

const url = process.argv[2] || process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL 이 필요합니다.'); process.exit(1); }

const client = new pg.Client({ connectionString: url, ssl: url.includes('localhost') ? undefined : { rejectUnauthorized: false } });
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS keywords (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,          -- 사칭 대상 명칭 (목록·상세·URL 의 기준)
    receipt_count INTEGER      NOT NULL DEFAULT 0, -- 현재 사건 접수 건수
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  );
  CREATE UNIQUE INDEX IF NOT EXISTS keywords_name_key ON keywords (lower(name));
  CREATE INDEX IF NOT EXISTS keywords_created_idx ON keywords (created_at DESC);
`);
console.log('keywords 테이블 준비 완료');

const { rows: [{ n }] } = await client.query('SELECT COUNT(*)::int AS n FROM keywords');
if (n === 0) {
  const { STATIC_ROWS } = await import('../src/data/cases.static.ts').catch(() => ({ STATIC_ROWS: [] }));
  if (!STATIC_ROWS.length) {
    console.log('샘플 데이터를 불러오지 못해 입력을 건너뜁니다. (node --experimental-strip-types 로 실행하거나 직접 INSERT 하세요)');
  } else {
    for (const r of STATIC_ROWS) {
      await client.query('INSERT INTO keywords (name, receipt_count, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [r.name, r.receipt_count, r.created_at]);
    }
    console.log(`샘플 ${STATIC_ROWS.length}건 입력`);
  }
} else {
  console.log(`기존 데이터 ${n}건 유지`);
}

const { rows } = await client.query('SELECT id, name, receipt_count, created_at FROM keywords ORDER BY created_at DESC LIMIT 5');
console.table(rows);
await client.end();
console.log('완료. npm run build 로 정적 페이지를 생성하세요.');
