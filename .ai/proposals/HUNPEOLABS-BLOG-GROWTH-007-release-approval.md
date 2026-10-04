# Blog growth release approval

Plan ID/version: HUNPEOLABS-BLOG-GROWTH-007-release-v1
Repository intelligence gate status: DEGRADED - both indexes stale; bounded source, Git, compiler, tests and browser fallback
Approval status: APPROVED
Approver: Human user in current conversation
Approval timestamp or task reference: October 4, 2026 - let comlete and hoàn thành sau đó release lên prouection comit to git

Release impact: additive reader/editor advice changes from approved 007 plan; package version and release notes. Use isolated release checkout based on origin/main, preserve original dirty shared workspace. Validate exact candidate, commit and fast-forward push main, deploy only App Hosting hunpeolabs-prod/hunpeolabs, read back production. Four approved articles may be published through authenticated Studio flow; never bypass staff/publish checks. Existing auth/One Tap/config unchanged. Rollback to previous deployed commit beb625b through same release workflow; no schema migration.

Approved paths:
- `app/resources/blog/**`
- `app/sitemap.ts`
- `components/blog-content.tsx`
- `components/blog-editor/editor.tsx`
- `components/blog-growth.tsx`
- `components/blog-reader-tools*`
- `components/blog-saved-articles.tsx`
- `lib/blog/growth.ts`
- `lib/blog/reading-state.ts`
- `tests/unit/blog-growth.test.ts`
- `docs/marketing/blog/**`
- `public/images/blog-guides/**`
- `package.json`
- `docs/releases/v3.5.0.md`
- `.ai/proposals/HUNPEOLABS-BLOG-GROWTH-007*`
