# Live classes on JaaS (8x8) — moderator tokens

Replaces the free public `meet.jit.si` (which now forces a moderator to log in
before a class can start). With JaaS, **teachers/admins/CEO are moderators
automatically** and students join as guests — no login wall, no "waiting for a
moderator."

```
live-class.html → jaas-token (Edge Function, signs a JWT) → 8x8.vc video room
```

`live-class.html` falls back to `meet.jit.si` automatically until this is set up,
so nothing breaks in the meantime.

## 1. Create a JaaS account & key (free tier available)

1. Go to **https://jaas.8x8.vc** → sign up / log in.
2. You'll get an **AppID** that looks like `vpaas-magic-cookie-xxxxxxxxxxxx`. Copy it.
3. Go to **API Keys** → **Add API Key** → **Generate a key pair**.
   - **Download the Private Key** (a `.pk`/`.pem` file — keep it secret).
   - Note the **Key ID (kid)** shown next to it. The full `kid` value is usually
     `vpaas-magic-cookie-xxxxxxxxxxxx/xxxxxx` (AppID + `/` + the short key id).

## 2. Deploy the Edge Function

**Dashboard:** Supabase → Edge Functions → **Create a function** → name it exactly
`jaas-token` → paste `index.ts` → Deploy → set **Verify JWT = OFF** (guests have no
login; the function decides moderator vs guest itself).

**CLI:**
```bash
supabase functions deploy jaas-token --no-verify-jwt --project-ref dbvlknklrasuztbicahq
```

## 3. Set the secrets

Supabase → Edge Functions → **Secrets**. `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` are injected automatically — you only add these three:

| Secret | Value |
|---|---|
| `JAAS_APP_ID` | your AppID, e.g. `vpaas-magic-cookie-xxxxxxxx` |
| `JAAS_KID` | the API Key id, e.g. `vpaas-magic-cookie-xxxxxxxx/abc123` |
| `JAAS_PRIVATE_KEY` | the **entire** private-key file contents, including the `-----BEGIN PRIVATE KEY-----` / `-----END PRIVATE KEY-----` lines |

> Paste the private key exactly as downloaded (multi-line is fine — the Supabase
> secret value box supports it). It never leaves the server.

## 4. Test

1. Open the Teacher dashboard → **Start Class**. It should go straight into the
   room as moderator — **no "log in to become moderator" screen**.
2. On another device/browser, open the Student dashboard (as a student in that
   class) → **Join Class** → you should land in the same room as a guest.
3. Check the Edge Function **Logs** if a token fails to mint.

## Notes

- Tokens are short-lived (3 h) and signed per join; the private key stays in the
  Edge Function secret only.
- Moderator = role `teacher`, `admin`, or `ceo` in `profiles`. Everyone else
  (incl. not-logged-in) joins as a non-moderator guest.
- Recording/livestreaming/transcription are left off by default; flip them in
  `index.ts` (`features`) if your JaaS plan includes them.
