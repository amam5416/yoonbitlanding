/**
 * 상담 접수 엔드포인트 — 서버에서 실행. 폼 데이터를 검증하고 WEBHOOK_URL 로 전달한다.
 * - WEBHOOK_URL 미설정: 개발 환경에서는 로그만 남기고 성공 응답, 운영 환경에서는 500.
 */
import type { APIRoute } from 'astro';

export const prerender = false;

const digits = (s: unknown) => String(s ?? '').replace(/\D/g, '');

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid json' }, 400); }

  const name = String(body.name ?? '').trim();
  const contact = digits(body.contact);
  const amount = digits(body.amount);
  const caseName = String(body.caseName ?? '').trim();
  if (!name || contact.length !== 11 || !contact.startsWith('010') || !amount) {
    return json({ ok: false, error: 'missing fields' }, 422);
  }

  const payload = {
    caseName, name, contact, amount: Number(amount),
    source: String(body.source ?? ''),
    userAgent: request.headers.get('user-agent') ?? '',
    receivedAt: new Date().toISOString(),
  };

  const url = import.meta.env.WEBHOOK_URL || process.env.WEBHOOK_URL;
  if (!url) {
    if (import.meta.env.PROD) return json({ ok: false, error: 'WEBHOOK_URL not configured' }, 500);
    console.log('[inquiry:dev] WEBHOOK_URL 미설정 — 전달하지 않고 성공 처리', payload);
    return json({ ok: true, delivered: false });
  }
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(payload) });
    if (!res.ok) return json({ ok: false, error: `webhook ${res.status}` }, 502);
    return json({ ok: true, delivered: true });
  } catch {
    return json({ ok: false, error: 'webhook unreachable' }, 502);
  }
};

export const GET: APIRoute = () => json({ ok: false, error: 'POST only' }, 405);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
