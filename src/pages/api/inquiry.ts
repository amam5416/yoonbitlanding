/**
 * 상담 접수 엔드포인트 — 서버에서 실행. 폼 데이터를 검증해 DAOM 웹훅으로 전달한다.
 *
 * 브라우저 → POST /api/inquiry { name, contact, amount, caseName, source }
 * 서버   → POST WEBHOOK_URL   { name, phone, keyword, amount, platform, partner }
 *   - name     이름 (문자열)
 *   - phone    연락처, 입력 포맷 그대로 "010-1234-5678" (최대 13자)
 *   - keyword  사칭 업체명 (상세 페이지는 자동 입력, 홈은 사용자 입력)
 *   - amount   피해금액, 쉼표 포함 문자열 "50,000,000"
 *   - platform 고정 "윤빛 금융사기전담본부"
 *   - partner  고정 "윤빛"
 *
 * WEBHOOK_URL 환경변수가 없으면 DEFAULT_WEBHOOK 으로 보낸다.
 *
 * 전달 후 텔레그램(TELEGRAM_CHAT_ID, 기본 -5518606313)으로도 접수 내용을 알린다 (src/lib/telegram.ts).
 * 텔레그램 실패는 접수 결과에 영향을 주지 않는다.
 */
import type { APIRoute } from 'astro';
import { SITE } from '@/site.config';
import { notifyInquiry } from '@/lib/telegram';

export const prerender = false;

const DEFAULT_WEBHOOK = 'https://api.daom88.com/api/v1/webhook/landing-page/7b87c9f4-7fb3-4ede-a2c4-8524d0b7aeb2';
const PLATFORM = SITE.name; // 윤빛 금융사기전담본부
const PARTNER = '윤빛';

const digits = (s: unknown) => String(s ?? '').replace(/\D/g, '');
const formatPhone = (d: string) => `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
const formatAmount = (d: string) => Number(d).toLocaleString('ko-KR');

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid json' }, 400); }

  const name = String(body.name ?? '').trim();
  const phoneDigits = digits(body.contact ?? body.phone);
  const amountDigits = digits(body.amount).replace(/^0+(?=\d)/, '');
  const keyword = String(body.caseName ?? body.keyword ?? '').trim();
  if (!name || phoneDigits.length !== 11 || !phoneDigits.startsWith('010') || !amountDigits || Number(amountDigits) <= 0) {
    return json({ ok: false, error: 'missing fields' }, 422);
  }

  const payload = {
    name,
    phone: formatPhone(phoneDigits),      // "010-1234-5678" (13자)
    keyword,
    amount: formatAmount(amountDigits),   // "50,000,000"
    platform: PLATFORM,
    partner: PARTNER,
  };

  const url = import.meta.env.WEBHOOK_URL || process.env.WEBHOOK_URL || DEFAULT_WEBHOOK;
  const source = typeof body.source === 'string' ? body.source : undefined;

  let delivered = false;
  let error = '';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    if (res.ok) delivered = true;
    else {
      const text = await res.text().catch(() => '');
      console.error('[inquiry] webhook failed', res.status, text.slice(0, 300));
      error = `webhook ${res.status}`;
    }
  } catch (e) {
    console.error('[inquiry] webhook unreachable', (e as Error).message);
    error = 'webhook unreachable';
  }

  // 텔레그램 알림 — 웹훅 성공/실패와 무관하게 보낸다 (실패 시 담당자가 수동 확인할 수 있도록)
  const telegram = await notifyInquiry({ ...payload, source, delivered });

  return delivered ? json({ ok: true, delivered, telegram }) : json({ ok: false, error, telegram }, 502);
};

export const GET: APIRoute = () => json({ ok: false, error: 'POST only' }, 405);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
