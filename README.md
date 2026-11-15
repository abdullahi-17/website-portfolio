# Abdullahi Omer — Portfolio

A buildless HTML, CSS and JavaScript portfolio. Cloud development is the primary focus, alongside industrial design, UX, Phase 1 and a personal journal.

## Run locally

From this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No npm installation or build is needed.

## Edit content

- `content.js`: project entries, case-study text, project images and contact/résumé destinations. Keep missing links `null`; the site displays “to add” rather than fake links.
- `index.html`: introduction, education, Phase 1, About and Outside Work.
- `styles.css`: shared design, desktop/mobile rules and reduced-motion support.
- `project.html?id=cloud-portfolio`: shared case-study page. Each project's `id` in `content.js` determines its URL. Unknown IDs show a not-found message.
- `main.js`: gallery rendering, filters, scroll controls and case-study rendering.

To add a project, copy an object in `portfolio.projects`, give it a unique `id`, and use category `cloud`, `ux` or `industrial`. Put cloud projects first. Describe your actual contribution, and include only observed results.

## Replace placeholders

- Replace the labelled SVG slots in `assets/` with your own portrait, cloud-project image, industrial design sketch, UX interface and journal image. The Phase 1 workshop photo and retail dashboard screenshot are already populated. Update paths and accurate `alt` text in `index.html` and `content.js` if filenames change.
- Prefer compressed WebP/JPEG, roughly 800–1200 pixels wide; supply width/height matching the image ratio. Keep below-fold images lazy-loaded. The portrait stack is loaded immediately.
- Your email, LinkedIn and GitHub are configured in `portfolio.contact`. Add the real résumé PDF to `assets/` and set its path there.
- Phase 1 now includes sourced programs, your published role and organization-reported figures. Add detailed personal responsibilities, real work experience and actual hobbies/journal entries. Spendwise remains planned; define its brief when development begins.
- The portfolio website case study includes its repository URL, verified AWS configuration and dated operational evidence. Terraform state reconciliation is prepared but not applied. Its diagram is `assets/cloud-architecture.svg`.

## Check before publishing

Check wide and narrow windows, Tab/Shift+Tab, Enter on links, Space/Enter on filter/arrow buttons, touch scrolling, reduced motion, and zoom. The home image stack expands on hover and retracts on pointer leave. Its button toggles the same view by keyboard or touch; Escape, focus leaving the stack, or an outside tap closes it. The expanded images form a curved fan above the name, with a smaller arc on narrow screens. All project content must remain accessible without hover. Verify real contact destinations and every case-study URL after replacing content. JavaScript is required for the data-driven gallery and case-study text; noscript messages explain this.

Terraform now models the verified live AWS hosting configuration, OIDC deployment role and CloudWatch dashboard/alarm. The hosting state migration has not been applied. The role and monitoring additions were created through the connected AWS account. Publish only website files (`index.html`, `project.html`, `styles.css`, `content.js`, `main.js`, and `assets/`) to your website origin. Never upload Terraform state, variable files, Git data or credentials.

## Cloud delivery and operations

See [docs/cloud-operations.md](docs/cloud-operations.md) for the verified AWS setup, safe Terraform imports, GitHub OIDC deployment and monitoring/evidence commands. The deployment role, repository role variable and CloudWatch dashboard/alarm are configured. The website was deployed successfully through [GitHub Actions on November 15, 2026](https://github.com/abdullahi-17/website-portfolio/actions/runs/43687661256). Terraform state reconciliation is prepared but not applied. `evidence/operations-2026-11-14.json` preserves the original pre-release measurements and billing scope. `evidence/deployment-2026-11-15.json` records the successful deployment and its HTTPS measurements.

## CI browser and deployment tests

The website still runs without a Node build step. Node dependencies are development-only browser-test tools.

```sh
npm ci
npx playwright install chromium
npm run check
python3 -m unittest discover -s tests -p '*_test.py'
bash scripts/package-site.sh
npm test
```

Playwright starts a temporary server for `site/` and checks desktop (1440px), mobile (390px) and small-mobile (320px) layouts. Tests cover navigation, project routes and images, gallery controls, image-fan hover/touch/keyboard behavior, reduced motion, and unknown-project recovery. These browser checks do not replace manual screen-reader testing.

Use `npm run test:report` to open the local HTML report. CI saves browser reports and failure screenshots/traces for 14 days.

The check job packages the website once, tests that package and uploads it as the `website` artifact. The deploy job downloads and validates that artifact, then publishes it without repackaging. `scripts/deploy-site.sh` intentionally fails if the package is missing or contains unexpected files. Deployment tests use a fake AWS CLI and make no AWS changes.

## Current project order

1. Portfolio website — AWS-hosted website and operations case study.
2. Azure retail data pipeline — CST8911 team project, with an actual Power BI screenshot and explicit team credit.
3. Spendwise — planned; no features, implementation or links are claimed.
4. Paper trading pipeline — AI-assisted cloud pipeline engineering with a simulated trading workload and AI-led authorship disclosed. Its repository is private; the site does not expose the source or claim trading performance.

Project 2 was checked against the public `abdullahi-17/CST8911-Midterm` README, SQL scripts/README and dashboard screenshots. The school project was not rerun or redeployed. See `docs/project-content-sources.md` for the review boundaries and image provenance.

## Generated files

`site/` is recreated by `scripts/package-site.sh`. `reports/` holds optional local measurements, and Python may create `scripts/__pycache__/`. These folders are ignored and can be removed after preserving any useful evidence. The dated records in `evidence/` are retained. Terraform state files remain local and must be kept for the pending reconciliation.
