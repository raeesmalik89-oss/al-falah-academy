# Al-Falah Islamic Academy — Web Platform & Portfolio

A production web platform for an online Quran/Hadith teaching academy, **plus** a
developer portfolio showcasing the engineering behind it. Everything here is a
**static, no-build** codebase — plain HTML/CSS/JavaScript with a Supabase backend,
deployed to the edge on Cloudflare Workers via GitHub Actions.

> **Live demo / portfolio:** open `portfolio/index.html` for the portfolio;
> `index.html` is the academy homepage.

---

## What's in here

| Area | Files |
|------|-------|
| **Marketing site** | `index.html`, `about.html`, `courses.html`, `curriculum.html`, `enroll.html`, `contact.html`, `events.html`, `gallery.html`, `resources.html`, `tools.html`, `books.html`, `downloads.html`, `lessons.html`, shared `style.css` |
| **Student/teacher/admin portal** | `login.html`, `student-dashboard.html`, `teacher-dashboard.html`, `admin-dashboard.html`, `assets/dashboard-shared.js`, `supabase-config.js` |
| **Portfolio** | `portfolio/index.html`, `portfolio/portfolio.css`, `portfolio/portfolio.js`, `portfolio/favicon.svg` |
| **PWA** | `manifest.json`, `sw.js`, `assets/pwa.js`, `assets/icon-*.png` |
| **Data pipeline** | `books_scraper.py` → `books.json` |
| **Database schema** | `supabase-classes-exams.sql` |
| **CI/CD** | `.github/workflows/deploy.yml`, `.github/workflows/keepalive.yml`, `wrangler.jsonc` |

## Tech stack

- **Frontend:** vanilla HTML, CSS, JavaScript — no framework, no bundler, no `package.json`.
- **Backend:** [Supabase](https://supabase.com) (PostgreSQL + Auth) — tables `profiles`,
  `progress`, `attendance`, `announcements`, `exam_results`. Role-based routing for
  student / teacher / admin.
- **PWA:** installable, offline-capable via a service worker (`sw.js`).
- **Automation:** Python (`requests` + `BeautifulSoup`) builds the free-books catalog.
- **Deployment:** Cloudflare Workers static assets (`wrangler.jsonc`), deployed by GitHub
  Actions on every push to `main`. A scheduled workflow keeps the Supabase project warm.

## Run locally

No build step. Serve the folder with any static server:

```bash
python -m http.server 8000
```

Then open:

- Academy site — <http://localhost:8000/>
- Portfolio — <http://localhost:8000/portfolio/>
- Portal login — <http://localhost:8000/login.html>

## Regenerate the books catalog

```bash
pip install requests beautifulsoup4 lxml --break-system-packages
python books_scraper.py   # overwrites books.json
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs
`wrangler deploy` to publish the whole repo as static edge assets on Cloudflare Workers.
Required repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (and
`SUPABASE_URL` / `SUPABASE_ANON_KEY` for the keep-alive workflow).

## Notes

- The Supabase keys shipped in `supabase-config.js` are **public client keys** (anon /
  publishable) — expected for a static site. No service-role or secret keys are committed.
- A security review of the portal's authentication and row-level-security model is tracked
  separately and is **not** part of the portfolio changes.
