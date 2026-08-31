# ADR 0002 — Assess Production Contract

Status: Proposed for implementation; production acceptance requires every gate in this ADR to pass.

Assess and Mastery are peer delivery modes over one canonical lesson corpus. Assess is blind: no learner-facing correctness, expected answer, score, retry/correction, Mastery, pass/fail or correctness-driven theory support. Started sessions snapshot mode/version and never change mode later.

SSOT: canonical lesson owns questions; `assessmentPolicy` owns participation; Attempt log owns learner submissions; Assess scoring policy + `deriveAssessSummary` own result; trusted assignment + immutable session snapshot own delivery mode; GitHub `main` owns Production source and Vercel Production must match that SHA.

At issue time Admin creates immutable answer-key-free `sanitizedLesson`. Student uses only that projection and persists neutral raw attempts. Firestore Rules bind session to assignment and attempts to sanitized item ids. Admin reconstructs historical canonical lesson and derives score from Attempt log. There is no Assess grading/issue server API, privileged Vercel identity, WIF, or runtime service-account secret.

Threat model: repo/Mastery corpus are public/client-delivered; cryptographic secrecy from independent public-source inspection is not claimed. Assess assignment payload, UI, raw attempts and learner result flow must not expose answer-key/correctness material.

No god components: mode, payload, delivery law, scoring, summary, neutral response, delivery persistence, attempt persistence, and UI remain separate modules. Student code cannot import grading/result owners; Admin cannot implement a second score formula.

Real acceptance: Admin issues Assess; assignment snapshot is safe; concurrent Mastery works; Q1 intentionally wrong yields no feedback; student completes blind; raw attempts contain no correctness; Admin derives expected score/detail; reload is stable.

Production gates: full CI, PR real-Firebase browser E2E, merge main, Rules Action from main, Vercel Git Integration auto-deploy, Production SHA == main SHA, Production browser E2E, evidence recorded. No gate may be deferred.

Release: feature branch -> PR -> CI + PR E2E -> merge main -> Vercel auto-deploy exact main SHA + Rules Action -> verify provenance -> Production E2E. No manual `vercel deploy`, Preview promotion, alternate production branch, IAM/WIF bootstrap, alternate Assess DB, or temporary server workaround. Rollback is Git revert on `main`.
