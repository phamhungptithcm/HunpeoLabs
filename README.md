# Hunpeo Labs Website

The official source repository for the Hunpeo Labs marketing website: a
multi-page Next.js site for presenting engineering services, products,
open-source work, and the company's approach.

## Requirements

- Node.js 24 or newer
- pnpm 11.9.0

## Local development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The site fails closed to `noindex` when a verified HTTPS production origin is
not configured.

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e:core
pnpm test:e2e:cross-browser
pnpm lighthouse:ci
```

## Release build

```bash
NEXT_PUBLIC_SITE_URL=https://example.com \
VERCEL_ENV=production \
pnpm release:build v0.1.0
```

The example origin is a CI fixture only. A production build requires the real,
verified HTTPS origin.

## Production configuration

See [Production readiness](docs/operations/production-readiness.md) for
contact delivery, indexing, privacy, security, monitoring, preview, and
rollback requirements.

Creating a GitHub source release does not deploy the website.
