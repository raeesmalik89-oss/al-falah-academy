// Al-Falah Academy — Edge Function: convert an enrollment lead into a student login.
//
// Called from the Admin/CEO dashboard "➕ Student" button. Runs server-side with the
// service role key (auto-injected by Supabase — never exposed to the browser).
//
// Security: the caller must be a signed-in admin or ceo; verified from their JWT.
// Deploy:  see docs — Supabase Dashboard → Edge Functions → create "convert-enrollment"
//          → paste this file → Deploy. No secrets to set (Supabase injects them).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Readable temporary password, e.g. "Alf-7Kp9m2Qx".
function genPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint32Array(9);
  crypto.getRandomValues(arr);
  let p = "";
  for (const n of arr) p += chars[n % chars.length];
  return "Alf-" + p;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";

    // 1) Identify the caller from their JWT.
    const caller = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: uErr } = await caller.auth.getUser();
    if (uErr || !user) return json({ error: "Not signed in." }, 401);

    // 2) Service-role client (full access, server-side only).
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 3) Only admins/CEOs may convert enrollments.
    const { data: me } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (!me || !["admin", "ceo"].includes(me.role)) {
      return json({ error: "Only an admin or CEO can do this." }, 403);
    }

    // 4) Load the enrollment.
    const { enrollment_id } = await req.json().catch(() => ({}));
    if (!enrollment_id) return json({ error: "enrollment_id is required." }, 400);
    const { data: enr, error: eErr } = await admin
      .from("enrollments").select("*").eq("id", enrollment_id).single();
    if (eErr || !enr) return json({ error: "Enrollment not found." }, 404);
    if (!enr.email) {
      return json({ error: "This enrollment has no email, so a login account can't be created. Add an email first." }, 400);
    }

    // 5) Create the auth user (email pre-confirmed) with a temporary password.
    const tempPassword = genPassword();
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: enr.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name: enr.name },
    });
    if (cErr || !created?.user) {
      return json({ error: "Could not create account: " + (cErr?.message || "unknown error") }, 400);
    }
    const uid = created.user.id;

    // 6) Create the student profile + an empty progress row.
    await admin.from("profiles").insert({
      id: uid,
      name: enr.name,
      role: "student",
      phone: enr.phone,
      course: enr.course || "Quran Hifz",
      monthly_fee: 2000,
      payment_status: "pending",
    });
    await admin.from("progress").insert({ id: uid, surahs: [], notes: "" });

    // 7) Mark the enrollment as enrolled.
    await admin.from("enrollments").update({ status: "enrolled" }).eq("id", enrollment_id);

    return json({ ok: true, name: enr.name, email: enr.email, temp_password: tempPassword });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
