"""Collect private operations evidence with the AWS CLI; never upload reports/ to S3."""
import argparse
import datetime
import json
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--distribution-id', default='E29CBZ3Y177V29')
parser.add_argument('--include-costs', action='store_true', help='One paginated Cost Explorer query; AWS API charges can apply')
args = parser.parse_args()
now = datetime.datetime.now(datetime.timezone.utc)
end = now.replace(hour=0, minute=0, second=0, microsecond=0)
start = end - datetime.timedelta(days=7)

def aws(service, operation, *params):
    output = subprocess.run(['aws', service, operation, '--region', 'us-east-1', '--output', 'json', *params], check=True, capture_output=True, text=True)
    return json.loads(output.stdout)

queries = []
for metric, stat, name in [('Requests', 'Sum', 'requests'), ('5xxErrorRate', 'Average', 'errors')]:
    queries.append({'Id': name, 'MetricStat': {'Metric': {
        'Namespace': 'AWS/CloudFront', 'MetricName': metric,
        'Dimensions': [{'Name': 'DistributionId', 'Value': args.distribution_id}, {'Name': 'Region', 'Value': 'Global'}]
    }, 'Period': 86400, 'Stat': stat}, 'ReturnData': True})
report = {
    'captured_at': now.isoformat(), 'distribution_id': args.distribution_id,
    'period': {'start': start.isoformat(), 'end': end.isoformat()},
    'metrics': aws('cloudwatch', 'get-metric-data', '--start-time', start.isoformat(), '--end-time', end.isoformat(), '--metric-data-queries', json.dumps(queries))
}
if args.include_costs:
    month_end = end.date().replace(day=1)
    month_start = (month_end - datetime.timedelta(days=1)).replace(day=1)
    report['cost_scope'] = 'Account-wide service totals, NOT isolated portfolio spend. Credits and refunds excluded.'
    report['costs'] = aws('ce', 'get-cost-and-usage', '--time-period', f'Start={month_start},End={month_end}', '--granularity', 'MONTHLY', '--metrics', 'UnblendedCost', '--group-by', 'Type=DIMENSION,Key=SERVICE', '--filter', json.dumps({'Not': {'Dimensions': {'Key': 'RECORD_TYPE', 'Values': ['Credit', 'Refund']}}}))
Path('reports').mkdir(exist_ok=True)
Path('reports/aws-operations.json').write_text(json.dumps(report, indent=2) + '\n')
print('Wrote private evidence to reports/aws-operations.json. Review and redact before sharing.')
