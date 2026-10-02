#!/usr/bin/env python3
"""Create a deterministic source release; never include credentials or runtime data."""
import gzip
import hashlib
import io
import json
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'output' / 'blog-release'
TREES = ('app', 'components', 'content', 'lib', 'styles', 'public', 'scripts', 'tests')
FILES = ('package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'next.config.ts',
         'tsconfig.json', 'eslint.config.mjs', 'vitest.config.ts',
         'playwright.config.ts', 'playwright.blog.config.ts', 'firebase.json', 'firestore.rules',
         'firestore.indexes.json', 'storage.rules', 'apphosting.yaml',
         '.firebaserc', '.env.example', '.npmrc', '.nvmrc', 'README.md',
         'docs/operations/blog-runbook.md', 'docs/blog-editor-guide.md')
paths = set()
for name in TREES:
    paths.update(p for p in (ROOT / name).rglob('*') if p.is_file())
paths.update(ROOT / name for name in FILES if (ROOT / name).is_file())
manifest = {}
archive = io.BytesIO()
with tarfile.open(fileobj=archive, mode='w') as tar:
    for path in sorted(paths):
        relative = path.relative_to(ROOT).as_posix()
        if path.is_symlink() or any(x in relative.split('/') for x in ('node_modules', '__pycache__', '.next')):
            raise SystemExit(f'Refuse unexpected source path: {relative}')
        if path.name.startswith('.env') and path.name != '.env.example':
            raise SystemExit('Refuse environment file')
        if path.suffix.lower() in ('.pem', '.key', '.p12', '.pfx') or 'service-account' in path.name.lower():
            raise SystemExit('Refuse credential file')
        data = path.read_bytes()
        manifest[relative] = hashlib.sha256(data).hexdigest()
        info = tarfile.TarInfo('hunpeolabs/' + relative)
        info.size = len(data)
        info.mode = 0o644
        tar.addfile(info, io.BytesIO(data))
OUTPUT.mkdir(parents=True, exist_ok=True)
package = OUTPUT / 'hunpeolabs-blog-source.tar.gz'
package.write_bytes(gzip.compress(archive.getvalue(), mtime=0))
result = {'kind': 'source-release-not-deployment', 'files': manifest,
          'archiveSha256': hashlib.sha256(package.read_bytes()).hexdigest()}
(OUTPUT / 'manifest.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'archive': str(package), 'sha256': result['archiveSha256'], 'files': len(manifest)}))
