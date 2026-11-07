const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function esc(s: unknown): string {
  return String(s ?? " - ").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
}

function renderEmail(r: Record<string, unknown>): string {
  const rows: [string, unknown][] = [
    ["Student", r.name],
    ["Enrolling for", r.enroll_for],
    ["Age group", r.age],
    ["Gender", r.gender],
    ["Country", r.country],
    ["City", r.city],
    ["Current level", r.level],
    ["Course", r.course],
    ["Language", r.lang],
    ["Teacher preference", r.teacher_pref],
    ["Preferred time", r.pref_time],
    ["Classes per week", r.freq],
    ["WhatsApp", r.phone],
    ["Email", r.email],
    ["Parent / Guardian", r.parent],
    ["Notes", r.notes],
  ];
  const trs = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#55615a;border-bottom:1px solid #eef3ea;white-space:nowrap">${esc(
          k
        )}</td><td style="padding:6px 12px;color:#1a2a22;border-bottom:1px solid #eef3ea;font-weight:600">${esc(
          v
        )}</td></tr>`
    )
    .join("");
  const wa = String(r.phone || "").replace(/\D/g, "");
  return `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:linear-gradient(135deg,#0d2818,#1a6b3a);color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
      <h2 style="margin:0;font-size:18px">📖 New Enrollment - Al-Falah Islamic Academy</h2>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e3ecdf;border-top:none;font-size:14px">${trs}</table>
    <div style="padding:16px 24px;background:#f7f9f4;border:1px solid #e3ecdf;border-top:none;border-radius:0 0 12px 12px">
      ${wa ? `<a href="https://wa.me/${wa}" style="display:inline-block;background:#25d366;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px">💬 WhatsApp the student</a>` : ""}
    </div>
  </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expected = Deno.env.get("WEBHOOK_SECRET");
  if (expected && req.headers.get("x-webhook-secret") !== expected) {
    return json({ error: "Unauthorized" }, 401);
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return json({ error: "RESEND_API_KEY not set" }, 500);
  const to = (Deno.env.get("NOTIFY_TO") || "raees.malik89@gmail.com")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const from = Deno.env.get("NOTIFY_FROM") || "Al-Falah Academy <onboarding@resend.dev>";

  try {

    const body = await req.json().catch(() => ({}));
    const record = (body.record ?? body) as Record<string, unknown>;
    if (!record || typeof record !== "object") return json({ error: "No record in payload" }, 400);

    const subject = `New Enrollment - ${record.name || "Al-Falah"}${record.course ? " · " + record.course : ""}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: record.email ? String(record.email) : undefined,
        subject,
        html: renderEmail(record),
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return json({ error: "Resend failed", status: res.status, detail: txt }, 502);
    }
    return json({ ok: true, sent_to: to });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
