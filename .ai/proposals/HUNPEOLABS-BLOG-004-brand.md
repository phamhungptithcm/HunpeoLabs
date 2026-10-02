# BLOG-004 — Use the approved shared brand

Approval: user selected the blue H and “Hunpeo Labs” wordmark in the supplied image and requested this version. Prior lowercase-brand proposal is superseded.
Intelligence: gate run; bounded source inspection used where indexes unavailable/stale. Shared context is a placeholder. Verified SiteHeader and SiteFooter already use BrandMark; BlogBrand independently renders the old mark and lowercase text.
Plan: allow an optional destination in BrandMark; render it from BlogBrand, preserving existing public/studio navigation destinations. Shared H mark and wordmark remain unchanged. No auth/data/API/config changes. Low risk: brand sizing/navigation only. Profiles: TypeScript, frontend HTML/CSS, webapp. Validate lint/typecheck and rendered public/admin branding. Rollback: restore two component changes.
