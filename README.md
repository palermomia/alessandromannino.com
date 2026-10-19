# alessandromannino.com

Personal site: resume, ventures, press, mentoring and investing, plus an inquiry form.
Plain HTML/CSS/JS, no build step. Hosted on GitHub Pages.

## Files
- `index.html`: all content (search for `TODO` to find spots that need your details)
- `styles.css`: design (Day/Night edition colors are the variables at the top)
- `script.js`: interactions, press rendering, and the inquiry form (`FORM_ENDPOINT` at the top)
- `press.json`: press mentions and CBT News bylines shown in the Press section
- `images/logos/`: company and venture logos
- `scripts/find-press.mjs` + `.github/workflows/press.yml`: weekly press finder
- `CNAME`: tells GitHub Pages to serve the site at alessandromannino.com

## Editing styles or scripts
After changing `styles.css` or `script.js`, bump the `?v=` number on their links in `index.html`
(e.g. `styles.css?v=3` → `?v=4`) so browsers load the new version instead of a cached one.

## Run locally
`python3 -m http.server 4321`, then open http://localhost:4321

## Press that updates itself
Every Monday a GitHub Action searches Google News for "Alessandro Mannino" and opens a pull
request adding anything new to `press.json`. Name matches include other people (there's a soccer
player with your name), so review each one: delete what isn't you, or move its URL to `ignored`
so it never comes back, then merge to publish.

- Run it any time from the repo's Actions tab → "Find new press mentions" → Run workflow.
- One-time setting: repo → Settings → Actions → General → tick
  "Allow GitHub Actions to create and approve pull requests".
- To add a mention by hand, add an entry to `mentions` in `press.json`.

## Connect the inquiry form (Formspree, free tier: 50 submissions/month)
1. Sign up at https://formspree.io with the email where you want leads delivered.
2. Create a new form and copy its endpoint (looks like `https://formspree.io/f/abcdwxyz`).
3. Paste it into `FORM_ENDPOINT` in `script.js`.

## Deploy to GitHub Pages
1. Create a public repo on GitHub (e.g. `alessandromannino.com`) and push these files to `main`.
2. Repo → Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. At your domain registrar, set DNS:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` → your GitHub Pages host (`<username>.github.io`)
4. Back in Settings → Pages, confirm the custom domain and tick "Enforce HTTPS" once the certificate is issued.
