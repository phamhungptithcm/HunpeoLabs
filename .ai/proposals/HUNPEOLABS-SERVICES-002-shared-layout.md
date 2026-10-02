# Services shared layout correction

User approval: “khi bấm vào service thì lại ra navbar và layout khác với các tran khác cần dùng chung như trang khác đang xài”. This explicitly authorizes correcting the previously approved implementation.

Impact and plan: low-risk presentation-only correction. Remove ServicesChrome selection from root layout while preserving BlogChrome, shared SiteHeader/SiteFooter, consent and structured data. Load scoped Services body CSS through a nested Services layout. Preserve approved service body and all six detail routes. Retain the unused chrome source because it contains concurrent work. Add browser regression coverage for the shared shell and mobile navigation. No backend, dependency, deployment or provider changes.

Repository intelligence: DEGRADED (stale CodeGraph/CocoIndex); bounded current source and browser/compiler evidence used. Local Next layouts/CSS guides consulted.
