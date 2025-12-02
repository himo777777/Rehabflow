# RehabFlow

AI-driven rehabiliteringsapp som genererar personliga träningsprogram baserat på din skadeprofil.

## Funktioner

- **AI-genererade program** - Skräddarsydda rehabiliteringsprogram baserat på klinisk evidens
- **Interaktiv onboarding** - 3D kroppsscanner för att välja skadeområde
- **Progress tracking** - Spåra dina framsteg dag för dag
- **AI Coach chatt** - Ställ frågor till din virtuella fysioterapeut
- **Övningsbibliotek** - Sök bland evidensbaserade övningar
- **Movement Coach** - Kamerabaserad rörelseanalys med MediaPipe

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Build:** Vite
- **AI:** Google Gemini 2.5 Flash
- **Backend:** Supabase (databas + auth)
- **Rörelseanalys:** MediaPipe Pose

## Snabbstart

### 1. Klona repot

```bash
git clone https://github.com/himo777777/Rehabflow.git
cd Rehabflow
```

### 2. Installera beroenden

```bash
npm install
```

### 3. Konfigurera miljövariabler

Kopiera `.env.example` till `.env.local`:

```bash
cp .env.example .env.local
```

Fyll i dina API-nycklar:

```env
# Google Gemini API Key (från https://aistudio.google.com/)
VITE_GEMINI_API_KEY=din_gemini_api_nyckel

# Supabase (från https://supabase.com/)
VITE_SUPABASE_URL=https://ditt-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=din_supabase_anon_nyckel

# Valfritt: Stripe betalningslänk
VITE_STRIPE_LINK=https://buy.stripe.com/din_länk
```

### 4. Konfigurera Supabase

1. Skapa ett nytt projekt på [Supabase](https://supabase.com/)
2. Gå till SQL Editor
3. Kör innehållet i `db_schema.sql`

### 5. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:5173](http://localhost:5173) i din webbläsare.

## Google AI Studio

Denna app skapades ursprungligen i Google AI Studio. För att köra i AI Studio:
- Appen finns här: https://ai.studio/apps/drive/1eK3rPANYhJJieFvC9JBRsozFnitak2x8
- API-nyckeln tillhandahålls automatiskt via `process.env.API_KEY`

## Projektstruktur

```
Rehabflow/
├── components/
│   ├── AIChat.tsx            # Chattkomponent med AI-fysioterapeut
│   ├── AIMovementCoach.tsx   # Kamerabaserad rörelseanalys
│   ├── ExerciseCard.tsx      # Övningskort med guide och video
│   ├── ExerciseLibrary.tsx   # Sökbart övningsbibliotek
│   ├── Logo.tsx              # App-logotyp
│   ├── Onboarding.tsx        # Flerstegigt bedömningsformulär
│   ├── PatientEducationModule.tsx  # Patientutbildning
│   ├── ProgramView.tsx       # Huvudvy för träningsprogrammet
│   ├── ProgressDashboard.tsx # Dashboard för framsteg
│   └── Toast.tsx             # Notifikationskomponent
├── services/
│   ├── geminiService.ts      # AI-integration med Gemini
│   ├── storageService.ts     # Lokal + molnlagring
│   ├── supabaseClient.ts     # Supabase-klient
│   └── imageDb.ts            # Bildhantering
├── data/
│   └── exerciseDatabase.ts   # Lokal övningsdatabas
├── App.tsx                   # Huvudapplikation med routing
├── types.ts                  # TypeScript-typdefinitioner
├── db_schema.sql             # Databasschema för Supabase
└── index.html                # HTML-entry med Tailwind config
```

## API-krav

### Google Gemini API

1. Gå till [Google AI Studio](https://aistudio.google.com/)
2. Skapa ett projekt och generera en API-nyckel
3. Lägg till nyckeln som `VITE_GEMINI_API_KEY`

### Supabase

1. Skapa konto på [Supabase](https://supabase.com/)
2. Skapa ett nytt projekt
3. Kopiera URL och anon key från Project Settings > API
4. Kör `db_schema.sql` i SQL Editor

## Skript

```bash
# Utveckling
npm run dev

# Bygg för produktion
npm run build

# Förhandsgranska produktionsbygge
npm run preview
```

## Databasschema

### Tabeller

- **users** - Användarprofiler och prenumerationsstatus
- **programs** - Genererade rehabiliteringsprogram
- **progress** - Daglig framstegsspårning

Se `db_schema.sql` för fullständigt schema med index och RLS-policies.

## Funktioner i detalj

### Onboarding
1. Profilinformation (namn, ålder, aktivitetsnivå)
2. 3D kroppsscanner för skademarkering
3. Säkerhetskontroll (röda flaggor)
4. Klinisk diagnostik med specifika frågor
5. Livsstilsbedömning

### AI-programgenerering
- Använder Gemini 2.5 Flash
- Genererar flerstegs rehabiliteringsprogram
- Inkluderar patientutbildning och diagnos
- Anpassar efter biopsykosociala faktorer

### Progress Tracking
- Markera övningar som klara
- Streak-räkning för motivation
- Coach Level gamification
- Veckovis AI-analys (Premium)

## Premium-funktioner

- Tillgång till alla faser (Fas 2 & 3)
- AI-veckoanalys
- Obegränsad chatt med AI-fysion
- Avancerad statistik

## Säkerhet

- Row Level Security (RLS) i Supabase
- Anonym användare via localStorage UUID
- Ingen känslig data exponeras till klienten
- API-nycklar hanteras via miljövariabler

## Bidra

1. Forka repot
2. Skapa en feature-branch (`git checkout -b feature/min-funktion`)
3. Commita ändringar (`git commit -m 'Lägg till funktion'`)
4. Pusha till branchen (`git push origin feature/min-funktion`)
5. Skapa en Pull Request

## Licens

MIT

## Support

För frågor eller problem, skapa en issue på GitHub.

---

**Medicinsk friskrivning:** RehabFlow är ett verktyg för egenvård och ersätter inte professionell medicinsk rådgivning, diagnos eller behandling. Sök alltid råd från läkare eller annan kvalificerad vårdgivare vid frågor om ett medicinskt tillstånd.
