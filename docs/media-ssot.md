# Media SSOT contract

Chiến Binh Dịch uses one media chain. Do not add a second URL table, hotlink map, DOM enhancer, or renderer.

## Owners

- `media/manifest.js` is the physical asset SSOT: immutable staging path, immutable ImageKit remote path, SHA-256, accessibility metadata, dimensions, source provenance, and rights provenance.
- `media-bundles/` is transport packaging only. `scripts/prepareMediaBundles.mjs` deterministically reconstructs reviewed staging files and verifies the bundle SHA before the manifest gate runs.
- `src/data/workbooks/gs23/g2-media.js` is the Grade 2 pedagogical mapping SSOT. It stores asset IDs only.
- `src/core/mediaAsset.js` is the only public URL resolver. `MEDIA_BASE` remains centralized in `src/config/mediaConfig.js`.
- `src/core/mediaCatalog.js` resolves asset IDs to physical manifest records.
- `src/features/drill/questionMediaRenderer.js` is the image presentation owner; `styles/question-media.css` is its style owner.
- `scripts/mediaManifest.mjs` is the physical invariant gate and is part of canonical `npm run ci`.
- `.github/workflows/imagekit-media-sync.yml` is the delivery owner.

## Preview and production

Same-repository PRs may pre-stage only immutable, content-hashed canonical ImageKit paths with overwrite disabled. This lets Vercel Preview read the exact objects that production will later verify. Feature code is not production until merge. Main re-runs the same manifest and publishes `ImageKit media` commit status after canonical verification.

## Grade 2 rollout

The first production batch covers Units 1–5 only: 35 reviewed images total, seven semantic assets per unit. Units 6–16 intentionally remain text-only until a later reviewed batch.

S06 recall/game items must not receive a pre-answer image. Theory, vocab, S01–S05 and S07 use the reviewed mapping where pedagogically appropriate.

## Forbidden split-brain patterns

Do not put full `https://ik.imagekit.io/...` URLs into lessons, mappings, or renderers. Do not create a second media manifest. Do not infer media from DOM text or prompt order. Do not bypass bundle hash, asset hash, size, provenance, or ImageKit public verification. Do not overwrite content-hashed canonical objects from a feature branch.
