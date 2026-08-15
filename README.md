# Ledger — Financial Statement Analyzer

A free, client-side tool that reads financial statement PDFs, extracts standard
line items (revenue, net income, total assets, etc.), lets you correct anything
misread, and generates ratio analysis + trend charts. Nothing is uploaded to a
server — PDF parsing happens entirely in the browser, so hosting costs nothing
beyond a free Netlify site.

## Run it locally

You need [Node.js](https://nodejs.org) 18+ installed.

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## Deploy to GitHub Pages (free)

This repo already includes a GitHub Actions workflow (`.github/workflows/deploy.yml`)
that builds and deploys automatically on every push to `main` — genuinely dynamic,
not a one-off static export.

1. Push this project to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**
   (you only need to do this once)
3. That's it — the push you just made already triggers the workflow. Check the
   **Actions** tab for progress. Once it's green, your site is live at:
   `https://<your-username>.github.io/<your-repo>/`
4. Every future `git push` to `main` rebuilds and redeploys automatically.

No repo-name configuration is needed in the code — `vite.config.js` uses relative
asset paths (`base: './'`) so it works under any repo subpath out of the box.

## Deploy to Netlify (free, alternative)

**Option A — drag and drop (fastest, no git needed):**
1. `npm install`
2. `npm run build` — this creates a `dist/` folder
3. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `dist` folder in
4. Done — you get a live URL immediately, no account required for a one-off drop
   (create a free account if you want to keep updating the same site later)

**Option B — connect a GitHub repo (best for an ongoing project):**
1. Push this folder to a new GitHub repo
2. Go to [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import an existing project"
3. Pick your repo — Netlify will auto-detect the build command (`npm run build`)
   and publish directory (`dist`) from `netlify.toml`, already included here
4. Click deploy. Every future `git push` auto-redeploys.

No environment variables, API keys, or paid tier are needed anywhere in this project.

## How the extraction works

`src/lib/pdfParse.js` uses `pdf.js` to pull text out of the PDF and reconstructs
lines from the positioned text fragments. `src/lib/extractFinancials.js` then
scans those lines against a list of common financial statement labels (Revenue,
COGS, Net Income, Total Assets, Total Liabilities, Total Equity, Operating Cash
Flow, etc. — see `LINE_ITEMS` in that file) and pulls out the numbers on each
matching line.

This is regex-based pattern matching, not OCR or AI — it works well on
text-based PDFs (most annual reports and 10-Ks) but:
- won't work on **scanned/image-only PDFs** (no extractable text layer)
- may miss line items that use non-standard wording — that's what the editable
  table (step 2 in the app) is for: correct or fill in anything it got wrong
- if you upload **multiple single-year PDFs**, each file is treated as one
  period; if you upload **one PDF with multiple year columns**, it tries to
  detect the year headers and keep the columns

## Extending it

To recognize more line items, add entries to the `LINE_ITEMS` array in
`src/lib/extractFinancials.js` — each just needs a `key`, `label`, `group`
(`income` / `balance` / `cashflow`), and a regex `pattern` to match the label
text. To add new ratios, add to `RATIO_DEFS` and the corresponding calculation
in `src/lib/ratios.js`.
