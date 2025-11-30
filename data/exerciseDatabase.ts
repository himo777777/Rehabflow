
import { Exercise } from '../types';

// Denna databas fungerar som en "Core Cache". 
// Appen använder Gemini AI för att generera tusentals varianter utöver dessa.
export const EXERCISE_DATABASE: Exercise[] = [
  // --- NACKE (CERVICAL) ---
  {
    name: "Retraktion av Nacke (Chin Tucks)",
    description: "Sitt upprätt med stolt hållning. Dra in hakan horisontellt mot halsen (skapa dubbelhaka) utan att böja nacken framåt. Känn sträckningen i nackrosetten.",
    sets: 3,
    reps: "10 x 5 sek",
    frequency: "Dagligen",
    tips: "Tänk att bakhuvudet ska dras uppåt mot taket.",
    category: "mobility",
    risks: "Att man spänner käkarna eller håller andan.",
    advancedTips: "Utför liggande på rygg och lyft huvudet 1 cm från underlaget (Deep Neck Flexor Lift).",
    difficulty: "Lätt",
    calories: "2 kcal",
    videoUrl: "https://www.youtube.com/embed/nphE0g-G53c",
    steps: [
        { title: "Position", instruction: "Sitt eller stå med rak rygg. Blicken rakt fram.", type: "start", animationType: "pulse" },
        { title: "Rörelse", instruction: "Dra hakan rakt bakåt. Föreställ dig att nacken blir lång.", type: "execution", animationType: "slide" },
        { title: "Håll", instruction: "Håll positionen i 3-5 sekunder.", type: "execution", animationType: "pulse" },
        { title: "Släpp", instruction: "Återgå mjukt till startläget.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Isometrisk Nackextension",
    description: "Sitt rakt. Placera händerna bakom huvudet. Pressa bakhuvudet lätt bakåt mot händerna utan att huvudet rör sig. Håll emot med händerna.",
    sets: 3,
    reps: "10 x 5 sek",
    frequency: "Varannan dag",
    tips: "Det ska inte göra ont, bara aktivera musklerna.",
    category: "strength",
    risks: "Att man pressar för hårt så nacken gör ont.",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/P654tC5p1x8",
    steps: [
        { title: "Start", instruction: "Händerna knäppta bakom bakhuvudet.", type: "start", animationType: "pulse" },
        { title: "Pressa", instruction: "Tryck huvudet bakåt mot händerna. Håll statiskt.", type: "execution", animationType: "bounce" }
    ]
  },
  {
    name: "Levator Scapulae Stretch",
    description: "Sitt på en stol. Ta tag i stolsitsen med ena handen. Titta ner mot motsatt armhåla och dra försiktigt huvudet åt det hållet med andra handen.",
    sets: 2,
    reps: "30 sekunder",
    frequency: "Dagligen",
    tips: "Sänk axeln på den sida du stretcharn.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/2qT2tO4qGqg",
    steps: [
        { title: "Fixera", instruction: "Greppa stolkanten för att sänka axeln.", type: "start", animationType: "pulse" },
        { title: "Vinkla", instruction: "Vrid näsan mot motsatt armhåla.", type: "execution", animationType: "slide" },
        { title: "Dra", instruction: "Lägg på ett lätt tryck med handen på bakhuvudet.", type: "execution", animationType: "slide" }
    ]
  },

  // --- AXEL (SHOULDER) ---
  {
    name: "Utåtrotation med gummiband",
    description: "Stå med armbågen böjd i 90 grader mot sidan. Håll ett gummiband och rotera underarmen utåt.",
    sets: 3,
    reps: "12-15",
    frequency: "Varannan dag",
    tips: "Använd en handduk mellan armbåge och kropp för korrekt teknik.",
    category: "strength",
    risks: "Att armbågen lämnar kroppen.",
    advancedTips: "Gör övningen liggande på sidan med hantel mot tyngdkraften.",
    difficulty: "Lätt",
    calories: "10 kcal",
    videoUrl: "https://www.youtube.com/embed/4y2d59v2jKQ",
    steps: [
        { title: "Lås armen", instruction: "Överarmen mot revbenen. Armbåge 90 grader.", type: "start", animationType: "pulse" },
        { title: "Rotera", instruction: "För handen utåt sidan. Håll handleden rak.", type: "execution", animationType: "slide" },
        { title: "Vänd", instruction: "Håll emot på vägen tillbaka.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Serratus Push-up (Scapula Push-up)",
    description: "Stå i plankposition (eller mot vägg). Håll armarna raka. Sjunk ihop med skuldrorna, tryck sedan isär dem maximalt.",
    sets: 3,
    reps: "12",
    frequency: "Varannan dag",
    tips: "En liten rörelse! Böj inte armbågarna.",
    category: "strength",
    risks: "Att huvudet faller ner mot golvet.",
    advancedTips: "Gör på en arm i taget mot vägg.",
    difficulty: "Medel",
    calories: "18 kcal",
    videoUrl: "https://www.youtube.com/embed/3Q0XJ-5s-8U",
    steps: [
        { title: "Planka", instruction: "Stå i planka. Helt raka armar.", type: "start", animationType: "pulse" },
        { title: "Sjunk", instruction: "Låt bröstkorgen sjunka ner mellan axlarna.", type: "execution", animationType: "slide" },
        { title: "Tryck", instruction: "Tryck isär skulderbladen mot taket (kuta rygg).", type: "execution", animationType: "bounce" }
    ]
  },
  {
    name: "Wall Slides (Väggklättring)",
    description: "Stå vänd mot vägg, underarmarna mot väggen med lillfingersidan mot väggen. Glid uppåt till ett Y.",
    sets: 3,
    reps: "8-10",
    frequency: "Dagligen",
    tips: "Svanka inte. Håll revbenen nere.",
    category: "mobility",
    risks: "Compensatorisk svank i ländryggen.",
    difficulty: "Lätt",
    calories: "8 kcal",
    videoUrl: "https://www.youtube.com/embed/d6V2Exzb324",
    steps: [
        { title: "Start", instruction: "Underarmar mot vägg, axelbrett.", type: "start", animationType: "pulse" },
        { title: "Glid", instruction: "Glid uppåt längs väggen. Håll kontakt.", type: "execution", animationType: "slide" },
        { title: "Lyft", instruction: "Lyft händerna någon centimeter från väggen i toppläget.", type: "tip", animationType: "bounce" }
    ]
  },
  {
    name: "Full Can (Supraspinatus)",
    description: "Stå med hantlar. Lyft armarna snett framåt (ca 45 grader utåt) till axelhöjd. Tummen ska peka uppåt (som en full burk).",
    sets: 3,
    reps: "10",
    frequency: "Varannan dag",
    tips: "Lyft inte högre än axelhöjd om du har impingement.",
    category: "strength",
    risks: "Att man rycker upp vikten.",
    difficulty: "Medel",
    calories: "20 kcal",
    videoUrl: "https://www.youtube.com/embed/S23iF-p-0eE",
    steps: [
        { title: "Vinkel", instruction: "Armarna 45 grader ut från kroppen (Scaption-planet).", type: "start", animationType: "pulse" },
        { title: "Lyft", instruction: "Lyft till axelhöjd, tummen upp.", type: "execution", animationType: "slide" },
        { title: "Sänk", instruction: "Sänk långsamt.", type: "execution", animationType: "slide" }
    ]
  },

  // --- ARMBÅGE & HANDLED (ELBOW & WRIST) ---
  {
    name: "Excentrisk Handledsextension",
    description: "Sitt med underarmen på ett bord, handen utanför kanten. Håll en vikt. Hjälp upp vikten med andra handen, bromsa ner med den skadade.",
    sets: 3,
    reps: "15",
    frequency: "Dagligen",
    tips: "Klassisk övning för tennisarmbåge. Det ska bränna lite.",
    category: "strength",
    risks: "För tung vikt så man tappar formen.",
    difficulty: "Medel",
    calories: "10 kcal",
    videoUrl: "https://www.youtube.com/embed/0Pz5aG5G9bE",
    steps: [
        { title: "Stöd", instruction: "Underarmen stadigt på bordet.", type: "start", animationType: "pulse" },
        { title: "Upp", instruction: "Hjälp upp handen med den friska handen.", type: "execution", animationType: "slide" },
        { title: "Bromsa", instruction: "Släpp den friska handen. Bromsa ner långsamt (3 sek).", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Underarmsrotation (Supination/Pronation)",
    description: "Håll en hammare eller hantel i ena änden. Rotera underarmen långsamt från sida till sida.",
    sets: 3,
    reps: "10 per sida",
    frequency: "Varannan dag",
    tips: "Håll armbågen intill kroppen hela tiden.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/L1CGk0C8z-E",
    steps: [
        { title: "Grepp", instruction: "Håll långt ner på skaftet för hävstång.", type: "start", animationType: "pulse" },
        { title: "Vrid", instruction: "Vrid handflatan uppåt, sedan nedåt.", type: "execution", animationType: "slide" }
    ]
  },

  // --- RYGG (BACK) ---
  {
    name: "Katten och Kon",
    description: "Stå på alla fyra. Skjut rygg mot taket (Katten) och dra in hakan. Svanka sedan och titta upp mot taket (Kon).",
    sets: 2,
    reps: "10 cykler",
    frequency: "Dagligen",
    tips: "En mjuk, rytmisk rörelse för att smörja ryggraden.",
    category: "mobility",
    risks: "Att man tvingar ut rörelsen i smärtsamma ändlägen.",
    advancedTips: "Kombinera med andning: Andas in vid svank, ut vid krumning.",
    difficulty: "Lätt",
    calories: "10 kcal",
    videoUrl: "https://www.youtube.com/embed/v9i30vP77d8",
    steps: [
        { title: "Alla fyra", instruction: "Händer under axlar, knän under höfter.", type: "start", animationType: "pulse" },
        { title: "Katten", instruction: "Skjut rygg, hakan mot bröstet. Andas ut.", type: "execution", animationType: "slide" },
        { title: "Kon", instruction: "Svanka, titta uppåt. Andas in.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "McGill Curl-up",
    description: "Ligg på rygg, ena benet rakt, andra böjt. Händerna under svanken. Lyft huvud och axlar lätt från golvet. Håll.",
    sets: 3,
    reps: "6 x 8 sek",
    frequency: "Varannan dag",
    tips: "Böj inte nacken, tänk att huvudet vilar på en våg som ska visa 0.",
    category: "strength",
    risks: "Att man drar i nacken med nackmusklerna.",
    difficulty: "Medel",
    calories: "15 kcal",
    videoUrl: "https://www.youtube.com/embed/pSjJ54aN32U",
    steps: [
        { title: "Position", instruction: "En fot i golvet, ett ben rakt. Händer under svank.", type: "start", animationType: "pulse" },
        { title: "Lyft", instruction: "Lyft bröstet en aning. Spänn magen.", type: "execution", animationType: "bounce" },
        { title: "Håll", instruction: "Håll 8 sekunder utan att hålla andan.", type: "execution", animationType: "pulse" }
    ]
  },
  {
    name: "Fågelhunden (Bird Dog)",
    description: "Stå på alla fyra. Sträck ut höger arm och vänster ben tills de är parallella med golvet. Håll balansen.",
    sets: 3,
    reps: "10 per sida",
    frequency: "Varannan dag",
    tips: "Föreställ dig att du har ett vattenglas på ländryggen som inte får spillas.",
    category: "balance",
    risks: "Att höften tippar eller roterar.",
    difficulty: "Medel",
    calories: "25 kcal",
    videoUrl: "https://www.youtube.com/embed/wiFNA3sqjCA",
    steps: [
        { title: "Start", instruction: "Stå på alla fyra. Neutral rygg.", type: "start", animationType: "pulse" },
        { title: "Sträck", instruction: "Lyft motsatt arm och ben. Förläng kroppen.", type: "execution", animationType: "slide" },
        { title: "Balans", instruction: "Håll stilla i 3 sekunder. Spänn bålen.", type: "execution", animationType: "pulse" },
        { title: "Byt", instruction: "Sätt ner mjukt och byt sida.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Sidoplanka",
    description: "Ligg på sidan med stöd på underarmen. Lyft höften så kroppen bildar en rak linje.",
    sets: 3,
    reps: "30-45 sek",
    frequency: "Varannan dag",
    tips: "Spänn sätet och magen.",
    category: "strength",
    risks: "Att axeln kollapsar eller höften sjunker.",
    advancedTips: "Lyft det övre benet för extra utmaning.",
    difficulty: "Medel",
    calories: "30 kcal",
    videoUrl: "https://www.youtube.com/embed/N_CdLq-oYlA",
    steps: [
        { title: "Uppställning", instruction: "Armbåge under axel. Fötter ihop.", type: "start", animationType: "pulse" },
        { title: "Lyft", instruction: "Pressa upp höften mot taket.", type: "execution", animationType: "bounce" },
        { title: "Håll", instruction: "Andas lugnt. Håll linjen.", type: "execution", animationType: "pulse" }
    ]
  },
  {
    name: "Cobra (Prone Press-up)",
    description: "Ligg på mage. Sätt händerna i golvet och pressa upp överkroppen medan höften ligger kvar. (McKenzie-metoden).",
    sets: 3,
    reps: "10",
    frequency: "Dagligen",
    tips: "Slappna av i sätet och ryggen, låt armarna göra jobbet.",
    category: "mobility",
    risks: "Smärta som strålar längre ner i benet (avbryt då).",
    difficulty: "Lätt",
    calories: "12 kcal",
    videoUrl: "https://www.youtube.com/embed/0T2sC31_t8A",
    steps: [
        { title: "Magläge", instruction: "Ligg platt. Händer vid axlarna.", type: "start", animationType: "pulse" },
        { title: "Pressa", instruction: "Räta ut armarna. Höften kvar i golvet.", type: "execution", animationType: "slide" },
        { title: "Andas ut", instruction: "Andas ut i toppläget.", type: "tip", animationType: "pulse" }
    ]
  },

  // --- HÖFT (HIP) ---
  {
    name: "Musslan (Clamshells)",
    description: "Ligg på sidan med böjda knän. Lyft det övre knät mot taket utan att rotera höften.",
    sets: 3,
    reps: "15",
    frequency: "Dagligen",
    tips: "Handen på höften för att känna att den är stilla.",
    category: "strength",
    difficulty: "Lätt",
    calories: "15 kcal",
    videoUrl: "https://www.youtube.com/embed/A0d3r0qH_qU",
    steps: [
        { title: "Sidliggande", instruction: "Knän 90 grader. Fötter ihop.", type: "start", animationType: "pulse" },
        { title: "Öppna", instruction: "Lyft knät. Fötterna håller kontakt.", type: "execution", animationType: "slide" },
        { title: "Stäng", instruction: "Sänk långsamt.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Bäckenlyft (Glute Bridge)",
    description: "Ligg på rygg. Lyft höften tills kroppen är rak. Spänn sätet.",
    sets: 3,
    reps: "12",
    frequency: "Varannan dag",
    tips: "Driv med rumpan, inte ryggen.",
    category: "strength",
    advancedTips: "Enbenslyft för progression.",
    difficulty: "Medel",
    calories: "20 kcal",
    videoUrl: "https://www.youtube.com/embed/5D1a1B2gXAg",
    steps: [
        { title: "Start", instruction: "Fötter i golvet nära rumpan.", type: "start", animationType: "pulse" },
        { title: "Lyft", instruction: "Pressa upp höften.", type: "execution", animationType: "bounce" }
    ]
  },
  {
    name: "Höftböjarstretch (Kneeling Hip Flexor)",
    description: "Stå på ett knä. Skjut fram höften tills det drar i framsidan av höften på benet som är i golvet.",
    sets: 2,
    reps: "30 sek",
    frequency: "Dagligen",
    tips: "Spänn sätet på bakre benet för bättre effekt.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/Yq4d_D2E70A",
    steps: [
        { title: "Utfall", instruction: "Ett knä i golvet. 90 grader i främre knät.", type: "start", animationType: "pulse" },
        { title: "Tilta", instruction: "Dra in svansen (tilta bäckenet bakåt).", type: "execution", animationType: "pulse" },
        { title: "Skjut fram", instruction: "Flytta tyngden framåt.", type: "execution", animationType: "slide" }
    ]
  },

  // --- KNÄ (KNEE) ---
  {
    name: "Knäböj (Squat)",
    description: "Stå axelbrett. Böj knäna och sätt dig bakåt som på en stol.",
    sets: 3,
    reps: "12",
    frequency: "Varannan dag",
    tips: "Knäna ska peka åt samma håll som tårna.",
    category: "strength",
    risks: "Valgus (knäna faller in).",
    difficulty: "Medel",
    calories: "25 kcal",
    videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
    steps: [
        { title: "Stå", instruction: "Axelbrett. Bröst upp.", type: "start", animationType: "pulse" },
        { title: "Sitt", instruction: "Böj knä och höft samtidigt.", type: "execution", animationType: "slide" },
        { title: "Pressa", instruction: "Tryck upp genom hela foten.", type: "execution", animationType: "bounce" }
    ]
  },
  {
    name: "Step-up på låda",
    description: "Kliv upp på en låda/trappsteg med ett ben. Pressa upp till stående.",
    sets: 3,
    reps: "10/ben",
    frequency: "Varannan dag",
    tips: "Håll ryggen rak och titta framåt.",
    category: "strength",
    difficulty: "Medel",
    calories: "30 kcal",
    videoUrl: "https://www.youtube.com/embed/dVV7C0k9Xp0",
    steps: [
        { title: "Start", instruction: "Fot på lådan.", type: "start", animationType: "pulse" },
        { title: "Pressa", instruction: "Driv upp kroppen med det övre benet.", type: "execution", animationType: "bounce" },
        { title: "Kontroll", instruction: "Håll balansen på toppen.", type: "execution", animationType: "pulse" }
    ]
  },
  {
    name: "Hälglidning (Heel Slides)",
    description: "Ligg på rygg. Glid hälen mot rumpan för att böja knät maximalt.",
    sets: 3,
    reps: "10",
    frequency: "Dagligen",
    tips: "Bra för post-op rörlighet.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "8 kcal",
    videoUrl: "https://www.youtube.com/embed/jZd-W3mYl5w",
    steps: [
        { title: "Ligg", instruction: "Raka ben.", type: "start", animationType: "pulse" },
        { title: "Dra", instruction: "Glid hälen mot sätet.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Spanish Squat",
    description: "Knäböj med ett kraftigt gummiband bakom knävecken som är fäst i en stolpe. Håll ryggen upprätt.",
    sets: 3,
    reps: "45 sek statiskt",
    frequency: "Dagligen",
    tips: "Guldstandard för hopparknä (patellansena).",
    category: "strength",
    advancedTips: "Håll statiskt i 45 sekunder x 5 set för smärtlindring.",
    difficulty: "Svår",
    calories: "35 kcal",
    videoUrl: "https://www.youtube.com/embed/k-h1gK1Q2y8",
    steps: [
        { title: "Bandet", instruction: "Fäst bandet. Kliv i med båda benen. Bandet bakom knäna.", type: "start", animationType: "pulse" },
        { title: "Luta", instruction: "Luta dig bakåt mot bandet. Sätt dig ner.", type: "execution", animationType: "slide" },
        { title: "Håll", instruction: "Skenbenen ska vara vertikala.", type: "tip", animationType: "pulse" }
    ]
  },

  // --- FOT & UNDERBEN (FOOT/ANKLE) ---
  {
    name: "Tåhävningar (Calf Raise)",
    description: "Stå på tå, sänk långsamt ner.",
    sets: 3,
    reps: "15",
    frequency: "Dagligen",
    tips: "Gå hela vägen upp på tå.",
    category: "strength",
    difficulty: "Lätt",
    calories: "15 kcal",
    videoUrl: "https://www.youtube.com/embed/-M4-G8p8fmc",
    steps: [
        { title: "Upp", instruction: "Pressa upp högt på tå.", type: "execution", animationType: "bounce" },
        { title: "Ner", instruction: "Sänk kontrollerat.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Excentriska Tåhäv (Alfredson)",
    description: "Gå upp på tå på två fötter. Lyft det friska benet. Sänk långsamt på det skadade benet över en trappkant.",
    sets: 3,
    reps: "15",
    frequency: "Dagligen",
    tips: "Ska göra lite ont i senan (max 4/10).",
    category: "strength",
    risks: "Smärta över 5/10.",
    difficulty: "Medel",
    calories: "25 kcal",
    videoUrl: "https://www.youtube.com/embed/H6y-g8g6k8M",
    steps: [
        { title: "Upp", instruction: "Upp på tå med båda.", type: "start", animationType: "bounce" },
        { title: "Enfot", instruction: "Ta bort friska foten.", type: "execution", animationType: "pulse" },
        { title: "Sänk", instruction: "Sänk långsamt ner under trappkanten.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Handduksdrag (Towel Grab)",
    description: "Sitt ner. Dra en handduk mot dig med tårna.",
    sets: 3,
    reps: "1 min",
    frequency: "Dagligen",
    tips: "Försök att inte lyfta hälen från golvet.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/8Jq_Jp3qk8M",
    steps: [
        { title: "Greppa", instruction: "Knip tårna om handduken.", type: "execution", animationType: "pulse" },
        { title: "Dra", instruction: "Dra in den under foten.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Enbensbalans",
    description: "Stå på ett ben. Håll balansen.",
    sets: 3,
    reps: "30 sek",
    frequency: "Dagligen",
    tips: "Fäst blicken på en punkt långt fram.",
    category: "balance",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/9G3XX_a_g0s",
    steps: [
        { title: "Lyft", instruction: "Lyft ena foten.", type: "start", animationType: "pulse" },
        { title: "Håll", instruction: "Stå stilla. Mjukt knä.", type: "execution", animationType: "pulse" }
    ]
  }
];
