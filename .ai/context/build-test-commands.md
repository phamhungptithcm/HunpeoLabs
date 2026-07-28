# Build And Test Commands

Source-verified commands for the Next.js marketing website:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e:core
pnpm test:e2e:cross-browser
pnpm lighthouse:ci
pnpm validate:production-env
pnpm release:verify-version v0.1.0
NEXT_PUBLIC_SITE_URL=https://example.com VERCEL_ENV=production pnpm release:build v0.1.0
```

CI notes:

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Pull requests and pushes to `main` run the full source/build gate, 32-scenario core E2E, Firefox/WebKit smoke coverage, and Lighthouse CI.
- Production deployment is not part of this workflow and requires separate approval.
- Production environment validation requires a verified `NEXT_PUBLIC_SITE_URL`; contact configuration remains optional unless `REQUIRE_CONTACT_DELIVERY=true`.
- Tag pushes run `.github/workflows/release.yml`; the workflow validates the
  version, release notes, full build, cross-browser coverage, and Lighthouse
  before creating a GitHub source release. It does not deploy production.
