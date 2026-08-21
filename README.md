# RehabFlow

## Available for acquisition

RehabFlow is currently offered as a **pre-revenue development asset** on Vertos for **USD 7,500**, with buyers able to make an offer:

**[View the escrow-protected RehabFlow listing on Vertos](https://vertosmarket.com/project/cmt3ebr2700mwij4n4tlkxmet)**

The proposed transfer includes the current seller-controlled source snapshot, database schema and migrations, setup and security documentation, known-limitations register, and one written clarification round. The transaction is intended to stay on Vertos and use its escrow process.

Important: this repository has previously been public, so the seller does not represent that no historical copies exist. The project is development software—not a clinically validated, certified, diagnostically validated, or production-ready healthcare product. Asset provenance and exclusions are documented in [COPYRIGHT_AND_SALE_NOTICE.md](COPYRIGHT_AND_SALE_NOTICE.md) and [docs/THIRD_PARTY_ASSET_REGISTER.md](docs/THIRD_PARTY_ASSET_REGISTER.md).

RehabFlow är en **pre-revenue utvecklings-MVP** för AI-stödd muskuloskeletal rehabilitering och guidad träning.

Projektet är inte kliniskt validerat, CE-märkt, FDA-godkänt eller verifierat för diagnostik, behandling eller osuperviserad patientanvändning. Den som vill driftsätta eller kommersialisera koden måste göra egen teknisk, säkerhetsmässig, klinisk, regulatorisk och juridisk granskning.

## Verifierade programvarufunktioner

- **AI-stödda programflöden** med strukturerad outputvalidering via Zod
- **Onboarding och säkerhetsfrågor** som måste kliniskt valideras före vårdanvändning
- **Progress-, smärt- och träningsloggning**
- **AI-chatt och patientutbildningsstrukturer**
- **Övningsbibliotek och fasbaserade program**
- **Movement Coach** med kameraintegration via MediaPipe Pose
- **Pose-estimering och uppskattade ledvinklar**
- **Regelbaserad repetitions-, tempo-, kompensations- och rörelsefeedback**
- **Supabase-schema** med row-level security policies
- **Server-side AI-endpoint** med Groq
- **Rate limiting** via Upstash Redis med utvecklingsfallback

## Viktig teknisk tolkning

Kamerafunktionen använder MediaPipe-landmärken och deterministiska regler. Resultaten ska beskrivas som pose-estimat, uppskattade ledvinklar och regelbaserad feedback - inte som validerad biomekanisk scanning, diagnostik eller klinisk mätprecision.

Funktioner som benämns emotionell intelligens använder rörelse- och engagemangsheuristik, exempelvis tempo, pauser, upprepade försök och fullföljande. De är inte ett validerat system för emotionell diagnostik eller affektigenkänning.

AI-genererat innehåll är programvaruoutput och behöver mänsklig kvalitetskontroll, produktmässiga skydd och klinisk validering före patientanvändning.

## Tech stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Build:** Vite
- **AI:** Groq server-side proxy; standardmodell i nuvarande kod är `llama-3.3-70b-versatile`
- **Backend:** Supabase
- **Rörelseanalys:** MediaPipe Pose
- **Validering:** Zod
- **Tester:** Vitest och Playwright
- **Rate limiting:** Upstash Redis eller in-memory fallback för utveckling

## Snabbstart

### 1. Klona repot

```bash
git clone https://github.com/himo777777/Rehabflow.git
cd Rehabflow
```

### 2. Installera beroenden

```bash
npm ci
```

### 3. Konfigurera miljövariabler

Kopiera `.env.example` till `.env.local`.

Server-side variabler för en Vercel-liknande deployment:

```env
GROQ_API_KEY=din_groq_api_nyckel
UPSTASH_REDIS_REST_URL=din_upstash_url
UPSTASH_REDIS_REST_TOKEN=din_upstash_token
```

Klientvariabler:

```env
VITE_SUPABASE_URL=https://ditt-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=din_supabase_anon_key
VITE_STRIPE_LINK=https://buy.stripe.com/din_lank
```

Lägg aldrig produktionshemligheter i repot. Kontrollera alltid vilka variabler som exponeras av Vite till webbläsaren.

### 4. Konfigurera Supabase

1. Skapa ett Supabase-projekt.
2. Granska SQL-schemat och migrationsfilerna för den avsedda deploymenten.
3. Kör relevanta migrationer.
4. Verifiera autentisering och row-level security mot den faktiska miljön.

### 5. Kör lokalt

```bash
npm run dev
```

## Kvalitetskontroller

```bash
npm run typecheck
npm run build
npm run test:run
npm run test:e2e
```

CI kör typkontroll, build och enhetstester. Playwright-strukturen finns, men end-to-end-tester kräver en fungerande testmiljö och ska verifieras separat.

## AI-arkitektur

Klienten anropar projektets server-side completion-endpoint. Endpointen skyddar Groq-nyckeln på serversidan och stöder streaming, icke-streaming och rate limiting.

README beskrev tidigare Gemini som primär implementation. Den webbläsarbaserade Gemini-integrationen har tagits bort. Nuvarande kod använder Groq/Llama genom en server-side endpoint så att den privilegierade AI-nyckeln inte skickas till klienten.

## Databas

`db_schema.sql` innehåller tabeller för bland annat:

- användarprofiler
- program
- progress
- smärtloggar
- träningsloggar
- milestones

SQL-filer är inte bevis för en säker produktionskonfiguration. Auth, policies, dataminimering, retention, export, radering och tredjepartsflöden måste testas i den faktiska deploymenten.

## Test- och release-status

Projektet innehåller Vitest- och Playwright-struktur. En grön build eller ett grönt testresultat bevisar inte klinisk säkerhet, medicinsk effekt, regulatorisk efterlevnad eller produktionsberedskap.

Se [docs/SALE_READINESS.md](docs/SALE_READINESS.md) för kända begränsningar och försäljningsgrindar.

## Licens och överlåtelse

README angav tidigare MIT, men ingen fristående `LICENSE`-fil har verifierats. Licens- och överlåtelserätt är därför **under granskning**.

Innan distribution eller försäljning måste följande verifieras:

- bidragsgivare och äganderätt
- tredjepartsberoenden och licenser
- AI-genererad kod och tillämpliga verktygsvillkor
- bilder, videor, 3D-modeller, typsnitt, dataset, övningsmaterial, protokoll och textkällor
- exakt vilka tillgångar som får överlåtas

Se [COPYRIGHT_AND_SALE_NOTICE.md](COPYRIGHT_AND_SALE_NOTICE.md). Tolka inte denna README som en licens eller som ett tillstånd att använda koden utöver vad tillämplig rätt och ett separat avtal medger.

## Medicinsk och regulatorisk begränsning

RehabFlow är utvecklingsprogramvara. Projektet ersätter inte professionell bedömning och erbjuds inte som en validerad diagnos-, behandlings- eller medicinteknisk produkt. Den framtida operatören ansvarar för avsedd användning, klassificering, riskhantering, klinisk utvärdering, dataskydd, cybersäkerhet och övrig efterlevnad.
