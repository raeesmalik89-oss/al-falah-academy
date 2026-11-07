# Enrollment email notifications (Supabase webhook)

Emails you whenever a new row is inserted into `enrollments` - reliable and independent
of the old client-side FormSubmit call. Flow:

```
enroll.html → INSERT into enrollments → Database Webhook → notify-enrollment (Edge Function) → Resend → your inbox
```

## 1. Get a Resend API key (free)

1. Sign up at https://resend.com with **raees.malik89@gmail.com** (use the same address you
   want notifications sent to - then the test sender works with no domain setup).
2. **API Keys → Create API Key** → copy it (starts with `re_...`).

> Using the default sender `onboarding@resend.dev`, Resend will only deliver to the email of
> the Resend account owner. That's fine here. To send from `info@alfalah-academy.com` or to
> other recipients, verify the domain in Resend (**Domains → Add**) and set `NOTIFY_FROM`.

## 2. Deploy the Edge Function

**Option A - Dashboard (no CLI):** Supabase → **Edge Functions → Create a function** →
name it exactly `notify-enrollment` → paste `index.ts` → **Deploy**. Then disable the JWT
check: open the function → **Details/Settings → Verify JWT = OFF** (the webhook is not a
logged-in user; the shared secret below protects it instead).

**Option B - CLI:**
```bash
supabase functions deploy notify-enrollment --no-verify-jwt --project-ref dbvlknklrasuztbicahq
```

## 3. Set the function secrets

Supabase → Edge Functions → `notify-enrollment` → **Secrets** (or via CLI):

| Secret | Value |
|---|---|
| `RESEND_API_KEY` | your `re_...` key (required) |
| `NOTIFY_TO` | `raees.malik89@gmail.com` (comma-separate for more) |
| `NOTIFY_FROM` | `Al-Falah Academy <onboarding@resend.dev>` (or a verified-domain address) |
| `WEBHOOK_SECRET` | any long random string - must match the webhook header in step 4 |

```bash
supabase secrets set RESEND_API_KEY=re_xxx NOTIFY_TO=raees.malik89@gmail.com \
  "NOTIFY_FROM=Al-Falah Academy <onboarding@resend.dev>" WEBHOOK_SECRET=some-long-random-string \
  --project-ref dbvlknklrasuztbicahq
```

## 4. Create the Database Webhook

Supabase → **Database → Webhooks → Create a new hook**:

- **Table:** `enrollments` · **Events:** `INSERT`
- **Type:** Supabase Edge Function → select `notify-enrollment`
- **HTTP Headers:** add `x-webhook-secret` = the same value you used for `WEBHOOK_SECRET`
- Save.

## 5. Test

Submit the form at https://alfalah-academy.com/enroll (or insert a test row), then check
your inbox. To see delivery logs: Edge Functions → `notify-enrollment` → **Logs**, and the
Resend dashboard → **Emails**.

---

Once this is confirmed working you can remove the FormSubmit call from `enroll.html`
(the `fetch('https://formsubmit.co/...')` block in `submitForm()`), since the webhook now
handles notifications. Leave it until you've seen a webhook email arrive.
