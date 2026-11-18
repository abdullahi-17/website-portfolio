"""Check artifact-only deployment without calling AWS or changing the real site."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[1]
FILES = ['index.html', 'project.html', 'styles.css', 'content.js', 'main.js']

class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='portfolio-deployment-')
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        (self.root / 'scripts').mkdir()
        for name in ['deploy-site.sh', 'package-site.sh', 'validate-package.py']:
            shutil.copy2(SOURCE / 'scripts' / name, self.root / 'scripts' / name)
        for name in FILES:
            (self.root / name).write_text(f'CHECKED {name}')
        (self.root / 'assets').mkdir()
        (self.root / 'assets' / 'example.svg').write_text('<svg/>')
        (self.root / 'bin').mkdir()
        aws = self.root / 'bin' / 'aws'
        aws.write_text('''#!/usr/bin/env python3
import json, os, pathlib, sys
record = {'args': sys.argv[1:]}
if sys.argv[1:3] == ['s3', 'cp']:
    record['content'] = pathlib.Path(sys.argv[3]).read_text()
with open(os.environ['DEPLOYMENT_TEST_LOG'], 'a') as log:
    log.write(json.dumps(record) + '\\n')
if sys.argv[1:3] == ['cloudfront', 'create-invalidation']:
    print('TEST-INVALIDATION')
''')
        aws.chmod(0o755)
        npm = self.root / 'bin' / 'npm'
        npm.write_text('#!/bin/sh\nprintf "// Checked motion bundle" > site/assets/portfolio-motion.js\n')
        npm.chmod(0o755)
        self.log = self.root / 'aws-calls.jsonl'
        self.environment = {
            **os.environ,
            'PATH': str(self.root / 'bin') + os.pathsep + os.environ['PATH'],
            'AWS_S3_BUCKET': 'test-portfolio',
            'AWS_CLOUDFRONT_DISTRIBUTION_ID': 'TEST-DISTRIBUTION',
            'DEPLOYMENT_TEST_LOG': str(self.log)
        }

    def run_script(self, name):
        return subprocess.run(['bash', f'scripts/{name}'], cwd=self.root,
                              env=self.environment, capture_output=True, text=True)

    def package(self):
        result = self.run_script('package-site.sh')
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_deploy_uses_checked_package_even_if_checkout_changes(self):
        self.package()
        for name in FILES:
            (self.root / name).write_text('UNCHECKED CHANGE')
        result = self.run_script('deploy-site.sh')
        self.assertEqual(result.returncode, 0, result.stderr)
        calls = [json.loads(line) for line in self.log.read_text().splitlines()]
        uploads = [call for call in calls if call['args'][:2] == ['s3', 'cp']]
        self.assertEqual(len(uploads), len(FILES))
        self.assertTrue(all(call['content'].startswith('CHECKED ') for call in uploads))
        self.assertEqual([call['args'][2] for call in uploads[-2:]], ['site/project.html', 'site/index.html'])
        self.assertEqual(calls[-1]['args'][:3], ['cloudfront', 'wait', 'invalidation-completed'])

    def test_missing_artifact_fails_without_packaging_or_calling_aws(self):
        result = self.run_script('deploy-site.sh')
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.log.exists())
        self.assertFalse((self.root / 'site').exists())

    def test_private_file_in_artifact_blocks_deployment(self):
        self.package()
        (self.root / 'site' / 'terraform.tfstate').write_text('PRIVATE TEST STATE')
        result = self.run_script('deploy-site.sh')
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.log.exists())

    def test_repackaging_removes_stale_assets(self):
        self.package()
        (self.root / 'site' / 'assets' / 'old.svg').write_text('<svg/>')
        self.package()
        self.assertFalse((self.root / 'site' / 'assets' / 'old.svg').exists())

    def test_symlinked_asset_is_rejected(self):
        (self.root / 'private.env').write_text('PRIVATE TEST CONTENT')
        (self.root / 'assets' / 'leak.svg').symlink_to(self.root / 'private.env')
        result = self.run_script('package-site.sh')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Symlinks are not allowed', result.stderr)

if __name__ == '__main__':
    unittest.main()
