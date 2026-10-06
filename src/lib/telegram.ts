/**
 * 상담 접수 텔레그램 알림.
 *
 * - TELEGRAM_BOT_TOKEN  봇 토큰 (없으면 알림을 보내지 않고 조용히 건너뜀)
 * - TELEGRAM_CHAT_ID    받을 채팅 (기본값 DEFAULT_CHAT_ID — 윤빛 상담 접수 채팅)
 *
 * 메시지 양식은 buildInquiryMessage 한 곳에서만 만든다. 양식을 바꿀 때는 이 함수만 수정.
 */

export const DEFAULT_CHAT_ID = '-5518606313';

const env = (k: string) => (import.meta.env as Record<string, string | undefined>)[k] || process.env[k] || '';

export interface InquiryNotice {
  name: string;
  phone: string;     // "010-1234-5678"
  keyword: string;   // 사칭 업체명
  amount: string;    // "50,000,000"
  source?: string;   // 접수한 페이지 URL
  delivered: boolean; // DAOM 웹훅 전달 성공 여부
  at?: Date;
}

/** 텔레그램 HTML parse_mode 용 이스케이프 (사용자 입력은 반드시 거친다) */
export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** "2026-10-06 14:32" (KST) */
export const formatKst = (d: Date) => {
  const p = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d).reduce<Record<string, string>>((o, x) => ((o[x.type] = x.value), o), {});
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
};

/** 접수 경로 라벨: 상세 페이지면 "상세 페이지 · <slug>", 홈이면 "홈" */
export const sourceLabel = (source?: string) => {
  if (!source) return '';
  try {
    const u = new URL(source);
    if (u.pathname.startsWith('/rcvlist/')) return `상세 페이지 · ${decodeURIComponent(u.pathname.slice('/rcvlist/'.length))}`;
    if (u.pathname === '/' || u.pathname.startsWith('/page/')) return '홈';
    return u.pathname;
  } catch { return source; }
};

/** 텔레그램 알림 본문 (HTML). ← 양식 변경은 여기 */
export function buildInquiryMessage(n: InquiryNotice): string {
  const e = escapeHtml;
  const lines = [
    '🚨 <b>새 상담 신청</b>',
    '━━━━━━━━━━━━━━',
    `👤 이름: <b>${e(n.name)}</b>`,
    `📞 연락처: <code>${e(n.phone)}</code>`,
    `🏢 사칭 업체: <b>${e(n.keyword)}</b>`,
    `💰 피해 금액: ${e(n.amount)}원`,
    '━━━━━━━━━━━━━━',
  ];
  lines.push(`🕐 ${formatKst(n.at ?? new Date())}`);
  // 정상 전달 시에는 아무 표시 없음. 실패했을 때만 경고 한 줄
  if (!n.delivered) lines.push('⚠️ DAOM 전달 실패 — 수동 확인 필요');
  return lines.join('\n');
}

/**
 * 알림 전송. 실패해도 예외를 던지지 않는다 (접수 자체는 웹훅 결과로 판단).
 * @returns 'sent' | 'skipped' (토큰 없음) | 'failed'
 */
export async function notifyInquiry(n: InquiryNotice): Promise<'sent' | 'skipped' | 'failed'> {
  const token = env('TELEGRAM_BOT_TOKEN').trim();
  if (!token) { console.warn('[telegram] TELEGRAM_BOT_TOKEN 이 없어 알림을 건너뜁니다'); return 'skipped'; }
  const chatId = env('TELEGRAM_CHAT_ID').trim() || DEFAULT_CHAT_ID;
  const base = env('TELEGRAM_API_BASE').trim() || 'https://api.telegram.org';
  try {
    const res = await fetch(`${base}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: buildInquiryMessage(n), parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      let desc = body.slice(0, 200);
      try { desc = JSON.parse(body).description ?? desc; } catch { /* 본문이 JSON 이 아님 */ }
      console.error('[telegram] sendMessage failed', res.status, desc); // 토큰은 로그에 남기지 않음
      return 'failed';
    }
    return 'sent';
  } catch (err) {
    console.error('[telegram] unreachable', (err as Error).message);
    return 'failed';
  }
}
