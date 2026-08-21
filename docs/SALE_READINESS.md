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
- Clean installation, TypeScript checking, production build, and all 358 unit tests passed locally on 21 August 2026
- Two unreferenced experimental modules (`coachingSessionOrchestrator.ts` and `moodDetectionService.ts`) are excluded from the shipping-app typecheck; they are not imported by the application and are not represented as verified product functionality

## Required pre-sale gates

A binding asset sale should not be completed until every applicable item is passed or expressly disclosed to the buyer.

### Technical integrity

- [x] Clean clone created for verification
- [ ] Exact sale commit SHA recorded after the audit branch is finalised
- [x] `npm ci` passes from a clean environment
- [x] `npm run typecheck` passes for the shipping application, tests, and referenced modules
- [x] `npm run build` passes
- [x] `npm run test:run` passes: 358 of 358 tests
- [ ] Critical flows manually verified with synthetic data
- [x] Known technical issues recorded in this document
- [ ] Buyer-facing demonstration recorded and reviewed

### Known technical issues

- Chromium end-to-end execution was attempted, but the environment did not contain the required Playwright browser binary. All 56 cases stopped at browser launch; this is an environment block, not evidence that the product flows passed or failed.
- Critical buyer-facing workflows still require manual verification with synthetic data.
- Production bundles include large ML, Three.js, and PDF chunks; this is a performance warning, not a build failure.
- The mixed static/dynamic import of `data/voicePhrases.ts` prevents that module from being split into a separate chunk.
- The two unreferenced experimental coaching modules remain source artifacts outside the verified shipping-app typecheck and should be removed, repaired, or separately disclosed before any buyer represents them as working functionality.

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

- [ ] Use “pose estimate”, “estimated joint angle”, and “rule-based feedback”
- [ ] Remove or qualify unsupported diagnostic, biomechanical, emotional-intelligence, efficacy, evidence, and safety claims
- [ ] Do not claim medical-device status, clinical validation, accuracy, outcomes, or regulatory readiness
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
