# Restore a known working website release

Rollback restores public website files from a **successful main-branch deployment**. It does not change Route 53, Terraform, IAM or CloudFront configuration.

## Choose a release

Open **Actions → Check and deploy portfolio** and choose a completed successful run. Its summary lists the source run ID, full commit SHA and retained `website-<commit SHA>` artifact. New website artifacts request 90-day retention, subject to repository policy. Deleted or expired artifacts cannot be restored.

The selector also supports earlier successful runs whose artifact is named `website`. Those still require the matching full commit SHA, successful `check` and `deploy` jobs, and an unexpired artifact.

## Run the rollback

1. Open **Actions → Rollback portfolio → Run workflow**.
2. Select the `main` branch.
3. Enter the **source run ID** and the matching **complete 40-character commit SHA**.
4. Run the workflow and wait for the restore and public HTTPS checks to pass.
5. Check the homepage and project pages, then save the workflow URL as the incident/recovery record.

CLI equivalent:

```sh
gh workflow run rollback.yml --repo abdullahi-17/website-portfolio --ref main \
  -f source_run_id=SOURCE_RUN_ID \
  -f expected_commit=FULL_COMMIT_SHA
```

For example, the previously successful release from run `43762357028` has commit `f16ba7af7b770bb12e62d0732d3423567b011143`. Use it only while its artifact remains available and when it is the version you intend to restore.

## What the workflow verifies

Before requesting AWS access:

- The run comes from this repository, the normal deployment workflow, and `main`.
- It is a successful completed push or manual deployment, with successful check/deploy jobs.
- The supplied commit matches the source run.
- Exactly one matching, unexpired website artifact exists.
- The downloaded package contains the expected public files and permitted assets.

The restore then uses the same scoped OIDC role and deployment script as a normal release. It uploads dependencies first and HTML pages last, waits for CloudFront invalidation, and checks public URLs. Both deployment jobs use `portfolio-production` concurrency so a rollback and normal deployment cannot write simultaneously. Do not queue several conflicting production requests.

`rollback-evidence-<run ID>` retains the selected release metadata and delivery timings. The run summary identifies the restored commit and original deployment. If a check fails, inspect the failed step and report before selecting another release; a failure does not imply that all uploads were reversed automatically.

## Limits

Files are restored in place; this is not an atomic release switch. Newer assets that are absent from the restored release remain in S3, because the deployment role has no deletion permission. Restored pages reference their own release's assets. The workflow does not restore database state, external services or infrastructure. HTTP checks establish that selected URLs respond, not full application correctness or uptime.

## Local tests

```sh
python3 -m unittest discover -s tests -p '*_test.py'
```

`tests/release_test.py` covers source-run, commit, job and artifact rejection paths. `tests/deployment_test.py` verifies artifact-only upload and package safety with a fake AWS CLI.
