# Cloud portfolio: delivery and operations

## Verified on November 14, 2026

The connected AWS account confirmed the production configuration:

- Domain: `abdullahiomer.com`
- Account: `043309365882`; S3 region: `us-east-1`
- Live CloudFront distribution: `E29CBZ3Y177V29`, enabled, domain `d12ngweanrjloj.cloudfront.net`
- Private S3 origin: `abdullahiomer.com`, all four public-access restrictions enabled
- Origin access control: `EBMB2GCFW88PY`, signed SigV4 requests
- Route 53 hosted zone: `Z01498521PTSNFTDM1WBB`; both A and AAAA aliases target the live distribution
- ACM certificate: issued for `abdullahiomer.com`; existing ARN is in your ignored local `terraform.tfvars`
- Existing WAF, TLS policy, HTTP/2, origin ID, managed CachingOptimized policy and PriceClass_All are preserved in Terraform.

Created and read back through the AWS connector:

- IAM role `portfolio-github-deploy` and inline policy `publish-portfolio-files`
- GitHub repository variable `AWS_ROLE_ARN`
- CloudWatch dashboard `portfolio-cloudfront` with four widgets
- CloudWatch alarm `portfolio-cloudfront-5xx`

The role trusts the **verified immutable repository subject** for `main` only. IAM simulation allowed an index upload and invalidation of the live distribution; a Terraform state upload and file deletion were denied. The November 15 deployment subsequently authenticated successfully with GitHub OIDC; the workflow evidence is recorded below.

## 1. Reconcile Terraform state

The old local state tracks **disabled distribution `E1JLEQ5Q3ZELBR`**, which is not serving the domain. Do not apply the old configuration or point DNS at it.

`imports.tf` adopts the verified live hosting resources and the new role/dashboard/alarm. A `removed` block releases the old distribution from state with `destroy = false`; it leaves that disabled distribution in AWS. No resource deletion is intended. This requires Terraform >= 1.7. The provider is locked in `.terraform.lock.hcl`.

During the November 14 infrastructure review, the local AWS CLI returned `InvalidClientTokenId`. Check and renew your normal AWS login before attempting the pending Terraform migration. No new access keys were created. Confirm the account:

```sh
aws sts get-caller-identity
```

It must be account `043309365882`. Then:

```sh
# Keep the existing local terraform.tfvars; it contains the verified domain inputs.
terraform init
terraform validate
terraform plan -out=portfolio.tfplan
```

Review the plan. It should adopt the live resources, retain the existing WAF/certificate/DNS configuration, and add project tags to supported resources. The old disabled distribution must be forgotten without destruction. Stop if it proposes replacing/deleting hosting resources, removing WAF, or changing the domain target. Configuration validation passed, but an authenticated plan and state migration have **not** been completed. The successful website deployment did not apply Terraform.

After reviewing that exact plan:

```sh
terraform apply portfolio.tfplan
```

Terraform state and plan files stay local and ignored. Keep a private backup of state before migration. The existing disabled distribution remains unmanaged after migration; deletion is a separate decision.

## 2. GitHub Actions deployment

Workflow: `.github/workflows/deploy.yml`. This is the active deployment workflow.

- Pull requests check syntax, local links, package safety, artifact-only deployment behavior and browser interactions without AWS access.
- Main pushes or manual runs on main assume the scoped OIDC role.
- The check job creates `site/` once and runs Playwright against that exact directory at 1440, 390 and 320 pixels. It uploads the `website` artifact only after those checks pass.
- The deployment job downloads `website` into `site/` and validates it. It does not rebuild or copy website source files from the checkout.
- Dependencies upload first, entry pages last, then CloudFront invalidation completes.
- Post-deployment checks verify the home page, case-study URL and shared assets over HTTPS.
- Browser HTML reports and failure traces/screenshots are retained as `browser-test-results` for 14 days. Deployment measurements are retained separately. Test tools and reports are never uploaded to the website.
- Deployments are serialized; no `--delete` or broad repository upload is used.

GitHub already has `AWS_ROLE_ARN=arn:aws:iam::043309365882:role/portfolio-github-deploy` as a **variable**, not an AWS credential secret. No long-lived AWS keys are needed. The role cannot change infrastructure or delete S3 objects. GitHub reports the subject as:

```text
repo:abdullahi-17@257199114/website-portfolio@1434921919:ref:refs/heads/main
```

The first deployment succeeded on **November 15, 2026**, for commit `ad02784aec50faa3cf05f9885ec0c55944891009`:

- [Successful workflow run](https://github.com/abdullahi-17/website-portfolio/actions/runs/43687661256): both `check` and `deploy` passed.
- AWS OIDC authentication, account verification, S3 upload and CloudFront invalidation passed.
- The homepage, cloud case-study page, CSS and both JavaScript files returned HTTP 200.
- A subsequent curl comparison confirmed that the five live files matched the deployed local files.
- The workflow measurement artifact is preserved in `evidence/deployment-2026-11-15.json`.

Future pushes to `main` trigger the same workflow. Do not add `terraform.tfstate`, `terraform.tfvars` or generated `reports/`. Infrastructure files and reference documentation remain separate from the website deployment package.

Local checks before pushing:

```sh
npm ci
npx playwright install chromium
npm run check
python3 -m unittest discover -s tests -p '*_test.py'
bash scripts/package-site.sh
npm test
```

### Artifact and browser-test improvements

The workflow now uses one tested package for deployment. Local verification passed 33 Chromium tests across three viewport configurations and five deployment/package-safety tests. The deployment tests check that changing the source after packaging cannot alter uploaded files, a missing artifact fails before AWS is called, unexpected private files block deployment, stale files are removed during packaging, and symlinked assets are rejected.

The historical November 15 run linked above predates these additional checks. A subsequent workflow run must verify this updated pipeline in GitHub. Rollback, branch protection, alarm notifications and Terraform state reconciliation remain separate follow-up work.

## 3. Monitoring, measurements and costs

Dashboard (AWS login required):

https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=portfolio-cloudfront

The standard CloudFront metrics show requests, error percentages and bytes downloaded. The alarm triggers above **5% 5xx responses in 2 of 3 five-minute periods**. Missing metrics are non-breaching; this is not an uptime check. `alarm_action_arns` is empty, so there are no email/SNS notifications. Supply an existing SNS topic ARN through that variable if notifications are needed.

Standard CloudFront metrics are emitted automatically. Dashboard/alarm charges may apply beyond free allowances; no paid additional CloudFront metrics, canaries or access-log ingestion were enabled. The monitoring resources are already active. Turning `enable_monitoring` off is a separate Terraform change that removes this dashboard/alarm.

The dated, sanitised evidence is in `evidence/operations-2026-11-14.json`. It records raw request buckets, cost scope and a **pre-release** delivery check. Before publishing, the live homepage returned 200 while the new URLs returned 403. That historical check failed and is preserved unchanged. The later successful deployment record in `evidence/deployment-2026-11-15.json` shows HTTP 200 for every checked URL. Do not confuse the two snapshots or use them as a controlled performance comparison.

To refresh private evidence after renewing the CLI session:

```sh
python3 scripts/collect-aws-evidence.py
# Optional: Cost Explorer API charges apply; retrieves the previous completed month.
python3 scripts/collect-aws-evidence.py --include-costs
python3 scripts/measure-site.py https://abdullahiomer.com
```

Reports go into ignored `reports/`, which can be removed after any useful evidence has been saved. The successful GitHub measurement artifact has already been preserved in `evidence/`. The curl timings are single-run DNS, first-byte and total timings, not Core Web Vitals, Lighthouse scores or uptime. An HTTP error makes the deployment check fail.

### Attribute costs correctly

The October billing evidence contains account-wide S3/CloudWatch excerpts, not isolated portfolio spend. Do not claim that these numbers are the website's monthly total.

Terraform applies `Project=cloud-portfolio` tags to supported resources. After applying the reviewed plan, open **Billing and Cost Management → Cost allocation tags → User-defined cost allocation tags**, select **Project**, and activate it. Tags and billing data can take time to appear. Future Cost Explorer reports can filter `Project=cloud-portfolio`; historical charges and untaggable/shared costs must be handled separately. Record Route 53/domain, WAF, CloudFront, S3 and CloudWatch costs where applicable. Do not silently count missing billing rows as zero.

## Evidence to capture after activation

- [ ] Terraform plan showing imports and no hosting deletion/replacement.
- [ ] Route 53 A and AAAA aliases pointing to the active CloudFront domain.
- [ ] Successful GitHub Actions deployment, including OIDC configuration, invalidation and smoke-check steps.
- [ ] CloudWatch dashboard with a visible time window and the distribution's request/error graphs.
- [ ] Cost Explorer with the billing period, currency, Project filter and included services visible.
- [ ] Live case-study page at the HTTPS custom domain.

## References used

- [CloudFront metrics and alarm region](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/monitoring-using-cloudwatch.html)
- [GitHub OIDC in AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
- [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/)

- [Playwright CI setup](https://playwright.dev/docs/ci-intro)
- [GitHub workflow artifact sharing](https://docs.github.com/en/actions/tutorials/store-and-share-data)
