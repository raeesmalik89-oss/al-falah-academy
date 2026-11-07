# Al-Falah Islamic Academy

This is the website for Al-Falah Islamic Academy, an online Quran and Hadith
teaching service. It's a plain static site (just HTML, CSS and JavaScript, no
build step) with a Supabase backend for the student and teacher portal. The whole
thing is hosted on Cloudflare Workers and deploys automatically when I push to
`main`.

Open `index.html` for the academy site, or `portfolio/index.html` for the
developer portfolio that sits alongside it.

## What's in the repo

- Public pages: `index.html`, `about.html`, `courses.html`, `curriculum.html`,
  `enroll.html`, `contact.html`, `events.html`, `gallery.html`, `resources.html`,
  `tools.html`, `books.html`, `downloads.html`, `lessons.html`, all sharing `style.css`.
- Portal: `login.html` plus the student, teacher, admin and CEO dashboards, with
  `assets/dashboard-shared.js` and `supabase-config.js`.
- Portfolio: everything under `portfolio/`.
- PWA bits: `manifest.json`, `sw.js`, `assets/pwa.js` and the icon set in `assets/`.
- Free-books catalog: `books_scraper.py` generates `books.json`.
- Database notes: the `supabase-*.sql` files.
- Deployment: `.github/workflows/` and `wrangler.jsonc`.

## How it's built

There's no framework and no bundler here, just vanilla HTML/CSS/JS. Each page is a
single self-contained file with its styles and scripts inline; only the marketing
pages share `style.css`.

The portal uses Supabase (Postgres + Auth). After login, users are routed by the
`role` field on their profile (student, teacher, admin or CEO). The teacher
dashboard is where attendance, fees, progress notes and announcements are managed.

The site installs as a PWA and works offline through the service worker in `sw.js`.

## Running it locally

No build needed. Serve the folder with any static server:

```bash
python -m http.server 8000
```

Then visit:

- The site: http://localhost:8000/
- The portfolio: http://localhost:8000/portfolio/
- The portal: http://localhost:8000/login.html

## Rebuilding the books list

The free-books library is scraped, not hand-written. To regenerate it:

```bash
pip install requests beautifulsoup4 lxml --break-system-packages
python books_scraper.py
```

That overwrites `books.json`, which the site loads in the browser.

## Deployment

A push to `main` runs the deploy workflow, which uses `wrangler deploy` to publish
the repo as static assets on Cloudflare Workers. It needs the
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets. A second workflow
pings Supabase on a schedule so the free-tier database doesn't pause itself; that
one needs `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

## A note on the keys

The Supabase keys in `supabase-config.js` are the public anon/publishable keys,
which are meant to be in the browser for a static site like this. There are no
secret or service-role keys in the repo.
