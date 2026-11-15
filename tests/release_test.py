"""Exercise release-selection safeguards without GitHub or AWS credentials."""
from copy import deepcopy
import unittest
from scripts.release import validate_release

REPOSITORY = 'abdullahi-17/website-portfolio'
COMMIT = 'a' * 40

class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.run = {
            'id': 123, 'repository': {'full_name': REPOSITORY},
            'head_repository': {'full_name': REPOSITORY},
            'path': '.github/workflows/deploy.yml', 'head_branch': 'main',
            'event': 'push', 'status': 'completed', 'conclusion': 'success', 'head_sha': COMMIT
        }
        self.jobs = [{'name': name, 'conclusion': 'success'} for name in ['check', 'deploy']]
        self.artifacts = [{'name': f'website-{COMMIT}', 'id': 456, 'expired': False, 'workflow_run': {'head_sha': COMMIT}}]

    def select(self):
        return validate_release(self.run, self.jobs, self.artifacts, REPOSITORY, COMMIT)

    def test_successful_release_returns_exact_artifact_and_commit(self):
        selected = self.select()
        self.assertEqual(selected['commit'], COMMIT)
        self.assertEqual(selected['artifact_id'], 456)
        self.assertEqual(selected['source_run_id'], 123)

    def test_previously_deployed_legacy_artifact_is_usable(self):
        self.artifacts[0]['name'] = 'website'
        self.assertEqual(self.select()['artifact_name'], 'website')

    def test_untrusted_or_incomplete_runs_are_rejected(self):
        for key, value in [
            ('head_branch', 'feature'), ('event', 'pull_request'),
            ('path', '.github/workflows/unrelated.yml'), ('status', 'in_progress'),
            ('conclusion', 'failure'), ('head_sha', 'b' * 40),
            ('head_repository', {'full_name': 'another/repository'}),
            ('repository', {'full_name': 'another/repository'})
        ]:
            with self.subTest(field=key):
                run = deepcopy(self.run)
                run[key] = value
                with self.assertRaises(ValueError):
                    validate_release(run, self.jobs, self.artifacts, REPOSITORY, COMMIT)

    def test_skipped_failed_or_missing_deploy_jobs_are_rejected(self):
        for jobs in [self.jobs[:1], [{'name': 'check', 'conclusion': 'success'}, {'name': 'deploy', 'conclusion': 'skipped'}], [{'name': 'check', 'conclusion': 'failure'}, {'name': 'deploy', 'conclusion': 'success'}]]:
            with self.subTest(jobs=jobs), self.assertRaises(ValueError):
                validate_release(self.run, jobs, self.artifacts, REPOSITORY, COMMIT)

    def test_missing_expired_ambiguous_or_unrelated_artifacts_are_rejected(self):
        for artifacts in [[], [{**self.artifacts[0], 'expired': True}], self.artifacts * 2, [{**self.artifacts[0], 'name': 'browser-test-results'}], [{**self.artifacts[0], 'workflow_run': {'head_sha': 'b' * 40}}]]:
            with self.subTest(artifacts=artifacts), self.assertRaises(ValueError):
                validate_release(self.run, self.jobs, artifacts, REPOSITORY, COMMIT)

    def test_commit_prefix_or_injected_text_is_rejected(self):
        for commit in ['abc1234', COMMIT + '\nextra=value', '$(command)', 'B' * 40]:
            with self.subTest(commit=commit), self.assertRaises(ValueError):
                validate_release(self.run, self.jobs, self.artifacts, REPOSITORY, commit)

if __name__ == '__main__':
    unittest.main()
