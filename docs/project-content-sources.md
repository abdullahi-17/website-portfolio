# Project selection and source review

Reviewed November 14, 2026. This update changes the portfolio, not the source projects.

## 1. Portfolio website

Existing case study retained, with its current infrastructure and verification limits.

## 2. Azure retail data pipeline

Selected `abdullahi-17/CST8911-Midterm` because its public artifacts show ingestion, SQL modelling, error handling and reporting, with more supporting evidence than a starter-only lab.

Reviewed:

- Public project README, SHA `177e496fb8c5f0669fc189e40feb4d59f158b755`.
- `SQL Scripts/README.md`, SHA `38d552acba27d45b26c099a9a1861c8b8e3ec273`.
- Local SQL views and normalization scripts in the same checkout.
- Power BI dashboard and Azure SQL query screenshots.

`assets/retail-dashboard.png` is an unchanged copy of `PowerBI screenshots/Screenshot 2026-10-24 231531.png`. It shows dataset analysis, not project revenue or business impact. The Azure query screenshot `Screenshot 2026-10-24 230243.png` was inspected as supporting evidence but was not copied into this portfolio; the dashboard provides a cleaner preview without Azure account UI.

The README attributes pipeline work to the team and describes the Power BI work in first person. The SQL README explicitly credits Georges Ngepi for normalization. The case study preserves that distinction. No rubric or explicit AI-use policy was found in the reviewed project files. This retrospective case-study writing uses AI assistance; no new results or personal experiences were invented.

No Azure connection, SQL execution, Power BI refresh or current deployment check was performed.

## 3. Spendwise

The owner requested the title and said development will come later. No app purpose, feature set, stack or accomplishments were inferred from its name. The project page intentionally contains only status, undefined scope and the next planning step.

## 4. Paper trading system

Included as a fourth, explicitly AI-assisted exploration rather than an independently authored development claim. The owner stated that AI did most of the work.

Reviewed the connected private repository README and the local checkout's `CLAUDE.md` and `infra/template.yaml`. The local guidance corrects drift in the README, including the distinction between the Lambda Alpaca paper path and a separate container-based IBKR path. The portfolio describes only the former. It does not claim current deployment status, strategy performance, test counts, profitability or personal implementation responsibilities that have not been documented.

The diagram is an explanatory SVG based on the reviewed Lambda architecture, not a screenshot of a live system. No private source files, credentials, order details or strategy parameters are copied into the portfolio. The private repository is represented as text, without a public source link. No trading actions or deployments were performed.
