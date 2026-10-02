# Hyderabad Property Data — Version 1

A beginner-friendly, static educational website about Hyderabad residential property research. It has **eight HTML pages**, one CSS file, one small JavaScript file, and an editable JSON file. There is no backend, login, database, scraper, analytics tracker, or build step.

**All example price, rent, and yield figures are fictional demonstrations.** The current real-market sample size is **zero**. Do not use the sample numbers for a property decision. Verify official records and get qualified advice for a real transaction.

## 1. What is where?

| File | What it does |
| --- | --- |
| `index.html` | Homepage, featured areas, demonstration snapshot |
| `areas.html` | Directory of 11 localities; three have guides |
| `gachibowli.html`, `kondapur.html`, `financial-district.html` | Example locality guides |
| `methodology.html` | Definitions, limitations, gross-yield calculator |
| `about.html`, `contact.html` | Project background and placeholder contact |
| `styles.css` | Colors, typography, cards, responsive layout |
| `script.js` | Loads the JSON data and runs the calculator |
| `data/localities.json` | Manual source of the **fictional** example figures |
| `images/README.md` | Notes about image licensing |
| `CNAME.example` | Inactive example for a future custom domain |

The pages use relative paths such as `styles.css` and `./data/localities.json`. This lets the same files work on a local server and under a GitHub Pages **project URL**.

## 2. Open it on your laptop

1. On GitHub, select **Code → Download ZIP** and unzip it, or run `git clone https://github.com/vamshiravular/hyderabad-property-data.git` in a terminal.
2. Open the `hyderabad-property-data` folder in VS Code.
3. Start a local server. With Python installed, run:

   ```bash
   cd hyderabad-property-data
   python -m http.server 8000
   ```

   Open `http://localhost:8000/` in your browser. On some systems use `python3 -m http.server 8000`. VS Code's **Live Server** extension is another option: open `index.html` and choose **Open with Live Server**.
4. Stop the Python server with **Ctrl+C**.

Do not double-click an HTML file and use a `file://` URL for testing: browsers often block JavaScript `fetch()` of a neighboring JSON file that way. Use the local server above.

## 3. Edit words and figures

- Edit page text in the relevant `.html` file. The header and footer are repeated on every page, so update all eight if you change shared navigation or disclaimers.
- Edit colors, spacing, and responsive rules in `styles.css`.
- Edit fictional example numbers in `data/localities.json`. Each object has a `slug` matching its HTML page name. Preserve JSON punctuation: double quotes, commas between fields, and no comma after the final item. The figures on the three locality pages and the homepage snapshot update when you reload the site.
- The `examples` arrays hold fictional table rows. `sampleSize: 0` means zero reviewed **real market** observations; the made-up rows do not count as observed listings.
- `estimatedGrossYieldPercent` is a separately invented demonstration value. It does not come from mixing the sale and rent ranges. The calculator on `methodology.html` computes a yield from the two values a visitor enters.
- Change `lastUpdated` only when you review and change the data. Do not label fictional values as current market estimates.
- Replace `[Your name]` in `about.html` and `hello@example.com` in `contact.html` only when you are ready to make that information public. There is no working contact form in Version 1.

Before publishing **real** values, record the source, source date, sample size, property type, floor-area definition, deduplication method, review date, and limitations. Make that information visible on the site. Have a human review it. Remove the fictional-data label only after the page actually contains reviewed real data. Never upload raw personal property records, private contact data, passwords, or API keys to a public repository.

## 4. Add a locality later

1. Copy `gachibowli.html` to a new file, for example `tellapur.html`.
2. Replace the visible title, introduction, area suitability, connectivity, questions, and table caption with carefully reviewed text.
3. In the opening `<body data-locality="gachibowli">`, change the slug to `tellapur`.
4. Add an object to `data/localities.json` with the same `slug`, all expected fields, and an `examples` array. While there is no reviewed data, retain explicit fictional/sample labels and `sampleSize: 0`.
5. Change the Tellapur card in `areas.html` from “Coming soon” to a link to `tellapur.html`. Optionally add it to the homepage.
6. Open the local server and check the page at `http://localhost:8000/tellapur.html`.

## 5. GitHub: files versus hosting

GitHub holds the repository: your editable project files and their version history. **GitHub Pages is the static web host** that serves those files to visitors. A GitHub repository URL is for seeing the code; a GitHub Pages URL is for seeing the website. You do not paste a repo link into a separate host.

If starting from a folder with no GitHub repository, create a **public** repository named `hyderabad-property-data` on your GitHub account. On your laptop, inside the project folder, you can then run:

```bash
git init
git add .
git commit -m "Build Hyderabad Property Data version 1"
git branch -M main
git remote add origin https://github.com/vamshiravular/hyderabad-property-data.git
git push -u origin main
```

Replace the account name in that URL if you use another GitHub account. If the GitHub repository already contains a README, clone it first before copying in the site files, or resolve any existing-history issue before pushing. You can also upload files with GitHub's **Add file → Upload files** interface while preserving the `data/` folder. Future edits: save locally, then `git add .`, `git commit -m "Describe the edit"`, and `git push`. Alternatively edit a file on GitHub and choose **Commit changes**.

## 6. Turn on GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Select the **`main`** branch and **`/(root)`** folder; select **Save**.
4. When GitHub finishes publishing, Pages settings show the public URL. For a repository named `hyderabad-property-data` under `vamshiravular`, the expected **project site** address is `https://vamshiravular.github.io/hyderabad-property-data/`. It includes the repository name. `https://vamshiravular.github.io/` is reserved for a user site using a repository named exactly `vamshiravular.github.io`.
5. Check the homepage, every area page, calculator, JSON figures, and links on the public URL. A commit to the chosen publishing branch triggers another publication.

Official guide: [Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 7. Add a domain later

| Term | Meaning |
| --- | --- |
| Domain registrar | The company where you buy a `.com` name |
| DNS | Settings that direct a domain to a host |
| GitHub Pages | Your Version 1 website host |
| GitHub repository | Your editable website files and history |

Future flow: **your-domain.com → your registrar's DNS records → GitHub Pages → files in this repository**.

When you own the domain, follow [GitHub's current custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Verify domain ownership, add the domain in **Settings → Pages**, configure the DNS records GitHub specifies for the chosen domain type, wait for DNS and the certificate, then enable/confirm HTTPS. `CNAME.example` is just a placeholder; do not commit an active `CNAME` for a domain you do not own. If you create an active `CNAME` manually, its content must be just your domain name, with no comments.

## 8. When to consider other tools

| Stage | Reasonable approach | Trigger |
| --- | --- | --- |
| Version 1 — now | Static HTML/CSS/JS, GitHub Pages, manual JSON or CSV, Python/pandas locally | Learn hosting and manually review two or three months of content |
| Version 2 — after validation | Next.js/TypeScript, Vercel, Supabase Postgres, Python/pandas ETL, admin-only import and review | Many localities/observations, dynamic routes, a controlled editing workflow, or server APIs |
| Version 3 — if demand warrants | Scheduled quality reports, an approved-data publication step, newsletter, compare/search, optional accounts or paid reports | The manual process is stable and there is a clear user need |

**Vercel** can connect to a Git repository and deploy modern application frameworks such as Next.js automatically when code changes. It is useful for server-side work, APIs, and more complex previews. **Supabase** provides a managed Postgres database and related backend services such as authentication and storage. Neither is necessary for these static pages. Additional services add operating work and new security responsibilities.

## 9. Editorial and safety rules

- Do not scrape property portals or copy their photos, text, or proprietary listing data.
- No investment, buy, or sell recommendations; no guaranteed price growth or rental return.
- Treat registration/guideline values, asking prices, achieved rents, and transaction prices as distinct measures.
- Link readers to the [Telangana Registration Market Value Search](https://registration.telangana.gov.in/UnitRateMV/getDistrictList.htm) and [Telangana RERA project/agent search](https://rerait.telangana.gov.in/SearchList/Search) for independent checks.
- Publish sources, observation dates, sample sizes, exclusions, and limitations with any future real data. Require manual review before publishing it.

This project is educational content only, not legal, tax, financial, real-estate, or investment advice.
