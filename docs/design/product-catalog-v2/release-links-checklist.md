# Product destination checklist — required before release

Owner instruction: missing website/store URLs may remain pending during design and development. Record them and resolve them before release. Never invent a URL, use `#` as a destination, or substitute a private GitHub repository.

This checklist is a manual release requirement, not an automated deployment gate. Product owner supplies URLs; release owner verifies and records the result.

| Product | Channel | Destination / required action | Status |
| --- | --- | --- | --- |
| AI-Agent-Kit | npm (primary) | https://www.npmjs.com/package/@hunpeolabs/ai-agent-kit — confirmed in the package repository README; recheck package identity and availability before release | Source confirmed; live recheck pending |
| SatsunicSEO | Chrome Web Store | https://chromewebstore.google.com/detail/satsunic-seo-crawler/kmgkplopobgekpfgchliolgkgfhkeknh — confirmed in extension README; recheck listing, publisher and destination before release | Source confirmed; live recheck pending |
| SatsunicSEO | Website | Owner confirmed no website; channel removed | Not applicable |
| SatsunicMec | Website | TODO(owner): supply canonical product website using the confirmed SatsunicMec identity | Pending |
| BeFam | Website | TODO(owner): supply canonical product website | Pending |
| BeFam | App Store | TODO(owner): confirm iOS distribution and supply exact `apps.apple.com` app listing | Pending |
| BeFam | Google Play | TODO(owner): confirm Android distribution and supply exact `play.google.com/store/apps/details?id=...` listing | Pending |

Mobile badges on the design preview are placement samples, not a claim of release or a confirmed platform commitment. Other products may add mobile channels when the owner confirms they apply.

## Release sign-off

- [ ] Resolve every pending row: fill a verified destination, or record explicit owner deferral / not-applicable decision with date. Do not silently count missing URLs as complete.
- [ ] Verify HTTPS, final redirected origin, exact product/package/app identity and publisher. No credentials in URLs.
- [ ] Verify mobile store availability in intended launch regions on iOS and Android, plus browser fallback on desktop.
- [ ] Only render enabled links with verified destinations. Until then, render the owner-approved disabled controls with subdued disabled appearance, no helper text and no href. Do not imply download availability.
- [ ] Make npm the AI-Agent-Kit primary distribution action. GitHub is optional and only allowed for independently verified public open-source products; never a fallback for missing websites/stores.
- [ ] Use official unmodified store badges and retain their clear space, proportions and readable size. Confirm asset terms at release.
- [ ] Verify keyboard names/focus, 320px layout, two-store wrapping, no external-link prefetch, and discovery output after configuring URLs.
- [ ] Record reviewer, date, candidate revision and result here or in the release evidence bundle.

## Design assets

- Apple badge: https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg
- Apple guidance: https://developer.apple.com/app-store/marketing/guidelines/
- Google Play badge: https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png
- Google marketing guidance: https://developer.android.com/distribute/marketing-tools

The local copies under `action-assets/` are design assets only. Application integration must use local approved assets and existing CSP rather than widening third-party access.
