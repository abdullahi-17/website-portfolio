#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${AWS_S3_BUCKET:?Set AWS_S3_BUCKET}"
: "${AWS_CLOUDFRONT_DISTRIBUTION_ID:?Set AWS_CLOUDFRONT_DISTRIBUTION_ID}"
bash scripts/package-site.sh
# Upload dependencies first and the entry pages last. No broad sync or deletion.
aws s3 sync site/assets/ "s3://${AWS_S3_BUCKET}/assets/" --cache-control 'public,max-age=3600'
for file in styles.css content.js main.js; do
  aws s3 cp "site/${file}" "s3://${AWS_S3_BUCKET}/${file}" --cache-control 'public,max-age=300'
done
for file in project.html index.html; do
  aws s3 cp "site/${file}" "s3://${AWS_S3_BUCKET}/${file}" --cache-control 'public,max-age=0,must-revalidate'
done
invalidation_id=$(aws cloudfront create-invalidation \
  --distribution-id "$AWS_CLOUDFRONT_DISTRIBUTION_ID" \
  --paths '/*' --query 'Invalidation.Id' --output text)
aws cloudfront wait invalidation-completed \
  --distribution-id "$AWS_CLOUDFRONT_DISTRIBUTION_ID" --id "$invalidation_id"
