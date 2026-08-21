# RehabFlow sale-readiness and validation status

Last updated: 21 August 2026

## Current status

RehabFlow is a pre-revenue development MVP. It is not represented as:

- clinically validated
- diagnostically accurate
- a validated biomechanical measurement system
- CE marked or FDA cleared
- production-ready for unsupervised patient care
- a business with verified users, revenue, contracts, or outcomes

## Technical audit result - 21 August 2026

Audit branch and tested commit: `1fa27525016fa68a3c7220206ba334943170bbc5`

The audit was run from a clean shallow clone with a separate npm cache.

| Check | Result | Evidence |
|---|---|---|
| `npm ci` | PASS | 778 packages installed from the lockfile |
| `npm run build` | PASS | Vite transformed 4,405 modules and produced a production bundle |
| `npm run typecheck` | FAIL | Type and interface mismatches in tests, UI components, coaching orchestration, mood detection, and voice guidance |
| `npm run test:run` | FAIL | 325 tests passed and 33 failed across 14 test files |
| Manual critical-flow test | NOT RUN | Requires a configured synthetic test environment |
| Playwright end-to-end test | NOT RUN | Browser runtime and deterministic test environment not yet verified |

### Build observations

- Production build completed successfully.
- Vite warned about a module that is both statically and dynamically imported.
- Several chunks exceed the configured 600 kB warning threshold.
- The largest reported uncompressed chunks included ML, Three.js, and PDF vendor bundles.

### Failure concentration

All 33 runtime test failures were reported in `__tests__/services/errorRecoveryService.test.ts`. The suite expects methods, exports, configuration behavior, sanitisation tokens, and error structures that do not match the current implementation. Several tests also timed out.

Type checking additionally reported mismatches in:

- `components/Achievements.tsx`
- `components/SettingsPanel.tsx`
- `services/coachingSessionOrchestrator.ts`
- `services/moodDetectionService.ts`
- `services/voiceGuidanceService.ts`
- `__tests__/services/errorRecoveryService.test.ts`

These findings do not prove that every affected runtime path is broken, but they prevent a clean quality claim. They must be fixed or explicitly disclosed before a sale.

## Verified repository facts

- React 18, TypeScript, Vite, and Tailwind application
- MediaPipe-based browser camera integration
- pose-landmark processing and estimated joint-angle calculations
- deterministic movement-feedback, repetition, tempo, and compensation logic
- AI-assisted programme and chat workflows with Zod validation
- server-side Groq completion endpoint using Llama 3.3 70B by default
- optional Upstash rate limiting with an in-memory development fallback
- Supabase schema and row-level security policies
- Vitest and Playwright structures
- CI configured to run dependency installation, typecheck, build, and unit tests

## Required pre-sale gates

A binding asset sale should not be completed until every applicable item is passed or expressly disclosed to the buyer.

### Technical integrity

- [x] Clean clone created
- [x] Exact audit commit SHA recorded
- [x] `npm ci` passes from a clean environment
- [ ] `npm run typecheck` passes
- [x] `npm run build` passes
- [x] `npm run test:run` failures documented
- [ ] Critical flows manually verified with synthetic data
- [x] Initial known-issues evidence produced
- [ ] Buyer-facing demonstration recorded and reviewed

### Security and privacy

- [ ] Current tree and Git history scanned for secrets
- [ ] No patient data, employer data, production credentials, or personal datasets included
- [ ] Client/server environment-variable exposure reviewed
- [ ] Data flows to Supabase, Groq, Upstash, analytics, storage, and the browser mapped
- [ ] Authentication and RLS verified against the actual deployment
- [ ] Export, deletion, retention, and backup behavior tested

### Intellectual property

- [ ] Contributor list completed
- [ ] Ownership or transfer rights confirmed
- [ ] Dependency licence inventory generated
- [ ] AI-generated code and relevant tool terms reviewed
- [ ] Images, video, 3D assets, fonts, data, prompts, protocols, exercise content, and scientific material reviewed
- [ ] Included and excluded asset schedules completed
- [ ] Licensing strategy approved; no licence should be inferred solely from an old README statement

### Clinical and regulatory claims

- [x] Documentation uses “pose estimate”, “estimated joint angle”, and “rule-based feedback”
- [x] Unsupported diagnostic, biomechanical, emotional-intelligence, efficacy, evidence, and safety claims are qualified in the audit documentation
- [x] Audit documentation does not claim medical-device status, clinical validation, accuracy, outcomes, or regulatory readiness
- [ ] Buyer accepts responsibility for intended use and independent clinical, privacy, security, and regulatory diligence

## Proposed transaction boundaries

- Asset sale of an agreed source-code snapshot and specifically scheduled transferable project materials
- Escrow or another mutually accepted protected payment route
- No source-code release before cleared payment and signed terms
- Written handover notes and one written clarification round
- No continuing development, hosting, clinical oversight, regulatory work, support, or commercial-performance warranty unless separately agreed

## Immediate stop conditions

Stop the sale process if:

- sensitive or confidential data is discovered
- a contributor disputes ownership
- a core asset lacks transfer rights
- the clean build cannot be demonstrated and the failure is not disclosed
- a buyer requests concealment of the development status or evasion of regulatory obligations
- transaction terms create unbounded warranties, indemnities, earn-outs, or continuing clinical responsibility

## Audit-branch purpose

The branch `codex/rehabflow-sale-readiness` exists to produce verifiable technical and disclosure evidence. It must not be merged into `main` without explicit owner approval after CI results and the diff have been reviewed.
