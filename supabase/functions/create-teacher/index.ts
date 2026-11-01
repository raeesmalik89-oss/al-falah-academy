// Al-Falah Academy — Edge Function: create a teacher login.
//
// Called from the Admin/CEO dashboard "➕ Add Teacher" button. Teachers do NOT
// need a real email inbox — the admin gives each teacher a short login CODE
// (turned into a login id like "ahmad@teachers.alfalah-academy.com") and a
// password. Every teacher is a separate account, so attendance and activity can
// be monitored per teacher.
//
// Runs server-side with the service role key (auto-injected by Supabase), so the
// admin's own login session is never disturbed, and accounts are pre-confirmed
// (no email verification step).
//
// Security: the caller must be a signed-in admin or ceo; verified from their JWT.
// Deploy:  Supabase Dashboard → Edge Functions → create "create-teacher"
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

function genPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint32Array(8);
  crypto.getRandomValues(arr);
  let p = "";
  for (const n of arr) p += chars[n % chars.length];
  return "Alf-" + p;
}

// Turn "Ahmad Sahib" or "ahmad" into a clean login slug "ahmad-sahib".
function slug(s: string): string {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";

    // 1) Identify the caller.
    const caller = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: uErr } = await caller.auth.getUser();
    if (uErr || !user) return json({ error: "Not signed in." }, 401);

    // 2) Service-role client (full access, server-side only).
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 3) Only admins/CEOs may create teachers.
    const { data: me } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (!me || !["admin", "ceo"].includes(me.role)) {
      return json({ error: "Only an admin or CEO can add teachers." }, 403);
    }

    // 4) Read the request.
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const className = String(body.class_name || "").trim();
    const code = slug(body.login_code || name);          // the teacher's login "code"
    let password = String(body.password || "").trim();
    if (!name) return json({ error: "Teacher name is required." }, 400);
    if (!code) return json({ error: "A login code (or name with letters) is required." }, 400);
    if (!password) password = genPassword();
    if (password.length < 6) return json({ error: "Password must be at least 6 characters." }, 400);

    // Login id — looks like an email but no inbox is needed.
    const loginEmail = code.includes("@") ? code : code + "@teachers.alfalah-academy.com";

    // 5) Create the pre-confirmed auth user.
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: loginEmail,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (cErr || !created?.user) {
      const msg = (cErr?.message || "").toLowerCase().includes("already")
        ? "That login code is already taken — pick a different one."
        : (cErr?.message || "unknown error");
      return json({ error: "Could not create teacher: " + msg }, 400);
    }

    // 6) Create the teacher profile (class optional — admin can set/change later).
    await admin.from("profiles").insert({
      id: created.user.id,
      name,
      role: "teacher",
      class_name: className || null,
    });

    return json({ ok: true, name, login: loginEmail, password, class_name: className });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
