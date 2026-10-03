# Compact inline Mermaid diagrams
Human approval: direct request on 2026-10-03 to make Mermaid charts compact, clean and moderately sized.
Intelligence: DEGRADED (stale CodeGraph/CocoIndex); bounded source verified against components/mermaid-diagram.tsx, components/blog-image-viewer.tsx and styles/blog-design.css. Existing WIP preserved.
Impact and plan: CSS-only, low risk. Override full-column image stretching for direct inline Mermaid images. Center proportional image within 520 by 340px maximum (mobile 260px height); use restrained padding. Preserve diagram source, rendering, editor functions and unconstrained enlargement dialog. No API, auth, data, dependency or production changes.
Validation: CSS parser and whitespace checks, direct-child selector review to exclude enlargement dialog, mandatory final review. Browser rendered acceptance remains blocked by prior explicit browser security restriction; no workaround.
