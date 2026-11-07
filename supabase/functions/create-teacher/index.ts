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

async function findUserByEmail(admin: any, email: string) {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const users = data?.users || [];
    const hit = users.find((u: { email?: string }) => (u.email || "").toLowerCase() === target);
    if (hit) return hit;
    if (users.length < 200) break;
  }
  return null;
}

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

    const caller = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: uErr } = await caller.auth.getUser();
    if (uErr || !user) return json({ error: "Not signed in." }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: me } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (!me || !["admin", "ceo"].includes(me.role)) {
      return json({ error: "Only an admin or CEO can add teachers." }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const className = String(body.class_name || "").trim();
    const code = slug(body.login_code || name);
    let password = String(body.password || "").trim();
    if (!name) return json({ error: "Teacher name is required." }, 400);
    if (!code) return json({ error: "A login code (or name with letters) is required." }, 400);
    if (!password) password = genPassword();
    if (password.length < 6) return json({ error: "Password must be at least 6 characters." }, 400);

    const loginEmail = code.includes("@") ? code : code + "@teachers.alfalah-academy.com";

    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: loginEmail,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (cErr || !created?.user) {
      const already = (cErr?.message || "").toLowerCase().includes("already") ||
                      (cErr?.message || "").toLowerCase().includes("registered");
      if (!already) {
        return json({ error: "Could not create teacher: " + (cErr?.message || "unknown error") }, 400);
      }
      const existing = await findUserByEmail(admin, loginEmail);
      if (!existing) {
        return json({ error: "That login code exists but could not be loaded to update." }, 400);
      }
      await admin.auth.admin.updateUserById(existing.id, { password, user_metadata: { name } });

      const prof: Record<string, unknown> = { id: existing.id, name, role: "teacher" };
      if (className) prof.class_name = className;
      await admin.from("profiles").upsert(prof);
      return json({ ok: true, updated: true, name, login: loginEmail, password, class_name: className });
    }

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
