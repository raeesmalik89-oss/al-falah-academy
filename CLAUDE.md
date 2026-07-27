# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Al-Falah Islamic Academy — a static marketing site (`index.html`) plus a Supabase-backed
student/teacher portal, for an online Quran/Hadith teaching business. There is no build step,
no bundler, no package.json — every page is a single self-contained HTML file with inline
`<style>`/`<script>`, and `style.css` is shared only by the marketing pages.

## Commands

There is no build/lint/test tooling in this repo. To work on it locally, just serve the static
files, e.g. `python -m http.server` or open the HTML files directly in a browser. Deployment is
automatic on push to `main` via two independent, unrelated pipelines:
- `vercel.json` — Vercel deploys the whole repo as static output (`outputDirectory: "."`, no
  build command).
- `.github/workflows/static.yml` — GitHub Actions also deploys the whole repo to GitHub Pages.

Regenerating the free-books catalog: `pip install requests beautifulsoup4 lxml --break-system-packages`
then `python books_scraper.py`, which overwrites `books.json` (loaded client-side by the site).

## Architecture

**Two unrelated backends are present — only one is live.** `supabase-config.js` (real project,
`profiles`/`progress`/`attendance`/`announcements` tables) is what `login.html`,
`student-dashboard.html`, and `teacher-dashboard.html` actually use. `firebase-config.js` is not
imported by any page — treat it as leftover/unused, not as a second active backend, unless you
find a page that references it.

**Auth & role model (Supabase):** `login.html` signs up/in via `_sb.auth`, then routes based on
`profiles.role` (`student` or `teacher`) fetched by user id. Teacher signup is gated by a
hardcoded access code checked client-side in `login.html` (`const TC = 'ALFALAH-TEACHER-2024'`)
— this is a known, deliberate low-security convenience gate for this small project, not a bug to
silently "fix" by moving it server-side unless asked.

**Data model (Supabase tables, inferred from `student-dashboard.html` / `teacher-dashboard.html`
queries — there is no schema file in-repo):**
- `profiles` — `id` (auth uid), `name`, `role`, `course`, `monthly_fee`, `payment_status`,
  `created_at`.
- `progress` — keyed by `id` (student uid): `surahs` (array of memorized surah numbers, 1–114),
  `notes` (teacher's notes), `last_updated`.
- `attendance` — `student_id`, `date`, `lesson`, `present`.
- `announcements` — `title`, `body`, `teacher_name`, `created_at` (global, not per-student).

The teacher dashboard is the read/write side for all four tables (marks attendance, edits fee
status, writes progress notes, posts announcements); the student dashboard is read-only except
for its own `progress` upsert path used elsewhere. When changing a column name or table shape,
grep both dashboard files — the schema only exists as these Supabase queries, there's no
migration files or ORM to check instead.

**enroll.html** posts to a third-party service (`formsubmit.co`) via `fetch`, not Supabase — it's
a plain lead-capture form, unrelated to the auth system.

**Standalone book/dua HTML pages** (`Al-Falah-Noorani-Qaida*.html`, `Al-Falah-Duas-Azkar.html`)
are static content pages with matching PDFs, not part of the app's JS logic — they're linked from
the main site's downloads/books sections but don't touch Supabase or Firebase.

**books.json** is generated data, not hand-edited — it's the output of `books_scraper.py`
(hardcoded `VERIFIED_BOOKS` list plus scraped entries from IslamHouse/Kalamullah/Archive.org/
Sunnah.com). Edit the scraper, not the JSON, for anything beyond a one-off fix.

## Notes for edits

- Keys in `firebase-config.js` and `supabase-config.js` are client-side public keys (Firebase web
  API key, Supabase anon/publishable key) — this is expected for a static site and is not a leak
  by itself, but don't add a service-role/secret key to any file that ships to the browser.
- No CSS framework — `style.css` uses hand-written custom properties (`--g`, `--gm`, `--gold`)
  matching the green/gold Islamic-academy theme; dashboard pages duplicate a similar palette
  inline rather than importing `style.css`. Match the existing inline-style pattern in
  `login.html`/`*-dashboard.html` rather than pulling those pages onto `style.css`.
