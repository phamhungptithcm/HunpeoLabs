# FOOTER-029 — approved mockup implementation

Plan ID/version: HUNPEOLABS-FOOTER-029-v1
Approval status: APPROVED
Approver: User in current chat
Approval timestamp or task reference: User “approved” on 2026-10-02 after desktop/mobile footer-v2 mockups.
Repository intelligence gate status: DEGRADED — stale optional indexes, bounded current source inspection.
Approved scope: Implement design/footer-v2/index.html composition in shared footer; retain conditional analytics preferences and dynamic copyright year; update existing focused contact expectations.
Approved paths:
- `components/site-footer.tsx`
- `styles/globals.css`
- `tests/e2e/site.spec.ts`

Impact/plan: Replace labelled contact grid with left tagline/address/founder and right email/phone/hours. Lower rule separates copyright and legal links. CSS matches approved mockup at desktop/mobile widths; 320px stacks links. Root layout is caller; no API/data/config/dependency changes. Preserve unrelated WIP. Risk low, presentation only. Validate ESLint/TypeScript, focused desktop/mobile browser check, 1440/390/320 visual comparison and overflow. Final review required. Rollback task hunks only. No deployment.
