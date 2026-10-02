/**
 * 빌드 타임 Postgres 접근. DATABASE_URL 이 없으면 hasDatabase = false.
 * 로컬에서 Railway/Neon 등 외부 DB 를 쓸 때는 public URL 을 사용하세요.
 */
import pg from 'pg';

const DATABASE_URL = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;
export const hasDatabase = Boolean(DATABASE_URL);

export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: DATABASE_URL?.includes('localhost') ? undefined : { rejectUnauthorized: false } });
  await client.connect();
  try {
    const r = await client.query(text, params);
    return r.rows as T[];
  } finally {
    await client.end();
  }
}
