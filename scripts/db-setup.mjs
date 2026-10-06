/**
 * keywords 테이블·컬럼 생성 (데이터는 관리 도구 yoonbitadmin 에서 입력).
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
  -- 차단 (관리 도구 yoonbitadmin 이 설정). 차단된 행은 빌드에서 제외
  ALTER TABLE keywords ADD COLUMN IF NOT EXISTS is_blocked   BOOLEAN     NOT NULL DEFAULT false;
  ALTER TABLE keywords ADD COLUMN IF NOT EXISTS blocked_at   TIMESTAMPTZ;
  ALTER TABLE keywords ADD COLUMN IF NOT EXISTS block_reason TEXT;
`);
console.log('keywords 테이블 준비 완료');

const { rows: [{ n }] } = await client.query('SELECT COUNT(*)::int AS n FROM keywords');
console.log(`현재 ${n}건. 키워드 입력·차단은 관리 도구(yoonbitadmin)에서 합니다.`);

const { rows } = await client.query('SELECT id, name, receipt_count, created_at FROM keywords ORDER BY created_at DESC LIMIT 5');
console.table(rows);
await client.end();
console.log('완료. DATABASE_URL 을 설정하고 npm run build 로 정적 페이지를 생성하세요.');
