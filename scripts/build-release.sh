#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

release_tag="${1:-${RELEASE_TAG:-}}"

if [[ -z "$release_tag" ]]; then
  echo "release build error: provide a tag such as v0.1.0." >&2
  exit 1
fi

if [[ -z "${NEXT_PUBLIC_SITE_URL:-}" ]]; then
  echo "release build error: NEXT_PUBLIC_SITE_URL is required." >&2
  exit 1
fi

export REQUIRE_CONTACT_DELIVERY="${REQUIRE_CONTACT_DELIVERY:-false}"
export VERCEL_ENV="${VERCEL_ENV:-production}"

node scripts/verify-release-version.mjs "$release_tag"
pnpm validate:production-env
pnpm lint
pnpm typecheck
pnpm test
pnpm build

echo "release build complete: $release_tag"
