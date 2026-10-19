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

## Inquiry form
Submissions go to Formspree (`FORM_ENDPOINT` in `script.js`, form `moejzdbn`) and are emailed to you
with the subject "New inquiry from alessandromannino.com". Manage the form and see past submissions
at https://formspree.io. The free tier allows 50 submissions a month.

## Hosting
- Repo: https://github.com/palermomia/alessandromannino.com (GitHub Pages from `main`, root folder).
  Every push to `main` redeploys the site in about a minute.
- Domain: registered at Namecheap. DNS has four `A` records for `@` (185.199.108–111.153),
  `www` → `palermomia.github.io.`, the GitHub domain-verification TXT record, and a Google
  Search Console TXT record. HTTPS is enforced.
