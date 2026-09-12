# Public archive UX checks

Verified on 2026-09-12 in the local in-app Chromium browser.

- Checked document overflow at exactly 320, 375, 390, 430, 768, 1024 and 1440 CSS pixels on Home, Romcom, Drama, an anime detail, Other Collections, About and 404: all 49 checks passed.
- Visually reviewed narrow mobile Home/detail and desktop category/detail layouts.
- Condensed control updates its pressed state; cards navigate to the intended anime.
- Enter activates Next anime; route changes focus the main content. Skip to content also focuses it.
- Verified active category links, explicit parent links, breadcrumbs, and adjacent anime destinations.
- `tests/ui-states.html` exercises broken remote artwork with a local fallback, a terminal unavailable-artwork state, and page skeletons. Both image recovery states verified in the browser.
- Ran an isolated Vite instance with an unreachable Supabase URL: a direct anime route retained bundled synopsis, images, streaming links and adjacent navigation, alongside a retry banner. No production environment settings were changed.
- Unit tests cover navigation aliases, invalid cached content, empty catalogs, and unpublished-content exclusion, alongside the existing API/artwork tests.
- TypeScript and production build pass. This is targeted accessibility testing, not a full WCAG audit or physical-device test.

## Data failure architecture

Supabase remains the editable source of truth. Successful reads save only published content to browser storage. On a first-load failure the app uses that snapshot, or the bundled catalog if no snapshot exists. A later failed refresh preserves the current catalog. Reads have an eight-second timeout and an explicit retry action; empty successful catalogs are never replaced with sample content.

Public pages render stored synopsis and saved artwork directly, without waiting for external anime metadata APIs. Images reserve their layout space, show skeletons while loading, then use a local fallback where one exists or an unavailable state. Eager images have a bounded timeout; below-the-fold images use native lazy loading.
