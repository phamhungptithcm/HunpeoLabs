# RELEASE-010 integration plan

Approved task: user requests commit and merge all changes to main, release and deploy production.
Intelligence DEGRADED: stale structural and semantic indexes, bounded source/diff/tests used.
Integrate all application/documentation WIP from beaus-dev into CMS candidate; original checkout preserved. Exclude pnpm cache and emulator runtime log. Existing source merged with three-way apply without conflicts.
Release v3.1.0 because v3.0.0 exists and candidate adds CMS features. Change package version and release notes only, retain locked dependency versions. Verify lint/types/unit/build and hosted CI, review auth/input/rate-limit/private-media/scheduling paths, merge reviewed PR, tag actual main commit, run release workflow and deploy exact main source.
No production data reset, OAuth secret/IAM changes, or scheduler activation. Live account acceptance and recovery remain explicitly unverified. Rollback prior ready App Hosting revision without resetting CMS data.
