# RELEASE-010 security delta

Status: APPROVED
User approval: "Duyệt vá và tiếp tục release" from question reply call_Z8NPdszNRgmdUS6FZYr87Frn.
Observed production audit: lodash-es GHSA-r5fr-rjxr-66jc HIGH and GHSA-f23m-r3pf-42rh MODERATE through Mermaid/chevrotain. Both patched >=4.17.24; installed transitive 4.17.23.
Smallest change: add pnpm-workspace.yaml override 'lodash-es@<4.17.24': 4.17.24 and regenerate pnpm-lock.yaml using pnpm install --lockfile-only --ignore-scripts. Preserve other dependency and app behavior, especially deployed CMS limiter and One Tap. No runtime/production permission change.
Verify production audit zero high/moderate, frozen install, unit/build and exact-head CI. Commit fix, merge/release/deploy per existing user authorization. Rollback prior application revision; retain data.

Registry readback: 4.17.24 is unpublished; published patched same-major version 4.18.1 selected within existing transitive semver range. Override pins 4.18.1; scope remains lodash-es-only advisory fix.
