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

    const caller = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: uErr } = await caller.auth.getUser();
    if (uErr || !user) return json({ error: "Not signed in." }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: me } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (!me || !["admin", "ceo"].includes(me.role)) {
      return json({ error: "Only an admin or CEO can do this." }, 403);
    }

    const { enrollment_id } = await req.json().catch(() => ({}));
    if (!enrollment_id) return json({ error: "enrollment_id is required." }, 400);
    const { data: enr, error: eErr } = await admin
      .from("enrollments").select("*").eq("id", enrollment_id).single();
    if (eErr || !enr) return json({ error: "Enrollment not found." }, 404);

    const digits = String(enr.phone || "").replace(/\D/g, "");
    const loginEmail = enr.email || (digits ? digits + "@students.alfalah-academy.com" : "");
    if (!loginEmail) {
      return json({ error: "This enrollment has neither an email nor a phone, so a login can't be created." }, 400);
    }

    const tempPassword = genPassword();
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: loginEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name: enr.name },
    });
    if (cErr || !created?.user) {
      return json({ error: "Could not create account: " + (cErr?.message || "unknown error") }, 400);
    }
    const uid = created.user.id;

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

    await admin.from("enrollments").update({ status: "enrolled" }).eq("id", enrollment_id);

    return json({ ok: true, name: enr.name, email: loginEmail, synthesized: !enr.email, temp_password: tempPassword });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
