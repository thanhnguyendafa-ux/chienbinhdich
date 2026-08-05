# CI/CD Contract — Chiến Binh Dịch

## Source of truth

- GitHub `main` is the canonical source tree.
- `npm run ci` is the canonical quality-gate command. Local development and GitHub Actions must call the same command.
- Vercel production should deploy from this GitHub repository. Direct/manual API deployments are fallback-only because they do not preserve Git commit provenance automatically.

## CI gates

Every pull request and every push to `main` runs:

1. `npm run check:syntax` — syntax check every JavaScript module in `src/`, `tests/`, and `scripts/`.
2. `npm run lint:content` — validate lesson dependency/order/content invariants.
3. `npm test` — domain, Attempt SSOT, architecture, responsive/design-token guardrails.

A failed gate must block merge/deploy. Do not add `continue-on-error` to quality gates.

## Recommended release path

```text
feature branch
  → pull request
  → GitHub CI
  → Vercel Preview (Git integration)
  → review/verify
  → merge main
  → Vercel Production (Git integration)
  → post-deploy runtime/error check
```

## Vercel Git integration

The production Vercel project should be connected to:

- Repository: `thanhnguyendafa-ux/chienbinhdich`
- Production branch: `main`

This removes the split delivery path where GitHub contains one commit while Vercel is deployed independently through an API call.

### Connection verification

After connecting Git integration, verify it with a normal pull request rather than a manual Vercel upload:

1. The pull request should produce a Vercel Preview deployment associated with the Git branch/commit.
2. After CI passes and the pull request is merged, the `main` commit should produce a Production deployment automatically.
3. The resulting deployment metadata should identify the Git repository, branch, and commit so production provenance can be audited.
4. Production smoke checks must include `/`, `/s/g7-u1-s1`, static assets, security headers, and runtime errors.

If any of these checks fails, treat Git delivery as unverified and do not substitute a manual file deployment.

## Rollback

If production fails after a release:

1. Keep the failed Git commit intact for auditability.
2. Promote the last known-good Vercel deployment, or revert the offending Git commit and let the Git integration redeploy.
3. Record the root cause in the fixing commit/PR.

Avoid editing production files manually; production artifacts must be reproducible from a Git commit.

## Branch protection

Recommended rule for `main`:

- Require a pull request before merging.
- Require status check `Quality gates`.
- Require branch to be up to date before merging.
- Block force pushes and branch deletion.

Branch protection is an administrative GitHub setting and is intentionally separate from application code.
