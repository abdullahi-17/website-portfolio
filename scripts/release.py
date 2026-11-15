"""Select a trusted, retained website release using GitHub's read-only API."""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess


def validate_release(run, jobs, artifacts, repository, expected_commit):
    if not re.fullmatch(r'[0-9a-f]{40}', expected_commit):
        raise ValueError('Expected commit must be the complete 40-character lowercase commit SHA.')
    if run.get('repository', {}).get('full_name') != repository or run.get('head_repository', {}).get('full_name') != repository:
        raise ValueError('The release must originate in this repository, not a fork.')
    if run.get('path') != '.github/workflows/deploy.yml':
        raise ValueError('Select a run of the normal deployment workflow.')
    if run.get('head_branch') != 'main' or run.get('event') not in {'push', 'workflow_dispatch'}:
        raise ValueError('Only main-branch deployments can be restored; pull requests are not releases.')
    if run.get('status') != 'completed' or run.get('conclusion') != 'success':
        raise ValueError('The source deployment must have completed successfully.')
    if run.get('head_sha') != expected_commit:
        raise ValueError('The expected commit does not match the selected deployment run.')
    for name in ['check', 'deploy']:
        matches = [job for job in jobs if job.get('name') == name]
        if len(matches) != 1 or matches[0].get('conclusion') != 'success':
            raise ValueError(f'The source run must contain one successful {name} job.')

    # Older verified deployments used the plain name; keep those releases usable.
    names = [f'website-{expected_commit}', 'website']
    name = next((name for name in names if any(item.get('name') == name for item in artifacts)), None)
    matches = [item for item in artifacts if item.get('name') == name] if name else []
    if len(matches) != 1 or matches[0].get('expired') is not False:
        raise ValueError('A single unexpired website artifact is required. Choose another release.')
    artifact = matches[0]
    provenance = artifact.get('workflow_run', {})
    if provenance.get('head_sha', expected_commit) != expected_commit:
        raise ValueError('Artifact provenance does not match the selected commit.')
    return {
        'source_run_id': run['id'],
        'source_run_url': f'https://github.com/{repository}/actions/runs/{run["id"]}',
        'commit': expected_commit,
        'artifact_name': artifact['name'],
        'artifact_id': artifact['id']
    }


def api(path, paginated=False):
    command = ['gh', 'api', path]
    if paginated:
        command.extend(['--paginate', '--slurp'])
    result = subprocess.run(command, check=True, capture_output=True, text=True)
    return json.loads(result.stdout)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run-id', type=int, required=True)
    parser.add_argument('--commit', required=True)
    parser.add_argument('--repository', default=os.environ.get('GITHUB_REPOSITORY'))
    args = parser.parse_args()
    if args.run_id <= 0 or not args.repository or not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', args.repository):
        parser.error('A positive run ID and owner/repository are required.')
    prefix = f'repos/{args.repository}/actions/runs/{args.run_id}'
    run = api(prefix)
    if run.get('id') != args.run_id:
        raise ValueError('GitHub returned a different source run.')
    job_pages = api(prefix + '/jobs?filter=latest&per_page=100', paginated=True)
    artifact_pages = api(prefix + '/artifacts?per_page=100', paginated=True)
    jobs = [job for page in job_pages for job in page['jobs']]
    artifacts = [artifact for page in artifact_pages for artifact in page['artifacts']]
    release = validate_release(run, jobs, artifacts, args.repository, args.commit)
    Path('reports').mkdir(exist_ok=True)
    Path('reports/rollback-source.json').write_text(json.dumps(release, indent=2) + '\n')
    if os.environ.get('GITHUB_OUTPUT'):
        with open(os.environ['GITHUB_OUTPUT'], 'a') as output:
            for key, value in release.items():
                output.write(f'{key}={value}\n')
    print(json.dumps(release, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, subprocess.CalledProcessError) as error:
        raise SystemExit(f'Release selection failed: {error}')
