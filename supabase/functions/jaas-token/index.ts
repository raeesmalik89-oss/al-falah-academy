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

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function strB64url(s: string): string {
  return b64url(new TextEncoder().encode(s));
}
function pemToPkcs8(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/g, "")
    .replace(/-----END [A-Z ]+-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function signRS256(header: object, payload: object, pem: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signingInput = strB64url(JSON.stringify(header)) + "." + strB64url(JSON.stringify(payload));
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );
  return signingInput + "." + b64url(new Uint8Array(sig));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const APP_ID = Deno.env.get("JAAS_APP_ID");
  const KID = Deno.env.get("JAAS_KID");
  const PRIVATE_KEY = Deno.env.get("JAAS_PRIVATE_KEY");
  if (!APP_ID || !KID || !PRIVATE_KEY) {

    return json({ error: "JaaS not configured" }, 501);
  }

  try {
    const { room, name } = await req.json().catch(() => ({}));

    let isModerator = false;
    let displayName = (name && String(name)) || "Guest";
    let email = "";
    let userId = "guest-" + Math.random().toString(36).slice(2, 10);

    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const caller = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await caller.auth.getUser();
      if (user) {
        userId = user.id;
        email = user.email || "";
        const admin = createClient(SUPABASE_URL, SERVICE_KEY);
        const { data: me } = await admin.from("profiles").select("name, role").eq("id", user.id).single();
        if (me) {
          if (me.name) displayName = me.name;
          isModerator = ["teacher", "admin", "ceo"].includes(String(me.role));
        }
      }
    }

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", kid: KID, typ: "JWT" };
    const payload = {
      aud: "jitsi",
      iss: "chat",
      sub: APP_ID,
      room: "*",
      exp: now + 3 * 3600,
      nbf: now - 10,
      context: {
        user: {
          id: userId,
          name: displayName,
          email,
          moderator: isModerator ? "true" : "false",
        },
        features: {
          recording: isModerator ? "true" : "false",
          livestreaming: "false",
          transcription: "false",
          "outbound-call": "false",
        },
      },
    };

    const jwt = await signRS256(header, payload, PRIVATE_KEY);
    return json({ jwt, appId: APP_ID, room: String(room || "alfalah-class"), moderator: isModerator });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
