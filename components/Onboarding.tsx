import React, { useState, useRef, useMemo, useEffect, lazy, Suspense } from 'react';
import { UserAssessment, InjuryType, PatientPainHistory, SMARTGoal, BaselineAssessmentScore, FollowUpQuestion, AIQuestionAnswer, BaselineROM } from '../types';
import { generateFollowUpQuestions, shouldShowTSK11, generateAssessmentSummary } from '../services/geminiService';

// Lazy load ROM Assessment for optional camera-based measurement
const ROMAssessment = lazy(() => import('./ROMAssessment'));
import {
  User, ShieldCheck,
  Activity as Pulse, Zap, Target,
  Smile, Meh, Frown,
  ChevronLeft, ChevronRight, CheckCircle2,
  ZoomIn, ZoomOut, Rotate3d, Scan, MousePointer2,
  Moon, Brain, Briefcase, AlertTriangle, Stethoscope,
  Flame, Activity, Siren, MessageSquare, Info, Move3d, Undo2,
  Thermometer, Hammer, Wind, Cigarette,
  Clock, History, Pill, TrendingUp, Award, Calendar, ClipboardList, HeartPulse
} from 'lucide-react';
import {
  ODI_SCALE,
  QUICKDASH_SCALE,
  KOOS_PS_SCALE,
  HOOS_PS_SCALE,
  TSK11_SCALE,
  calculateScore,
  getScaleForBodyArea,
  AssessmentScale,
  AssessmentQuestion
} from '../data/assessments/standardizedScales';

// Import the new SVG-based anatomical skeleton
import AnatomicalSkeleton from './AnatomicalSkeleton';

interface OnboardingProps {
  onSubmit: (assessment: UserAssessment) => void;
  isLoading: boolean;
}

const INJURY_DESCRIPTIONS: Record<string, string> = {
  [InjuryType.ACUTE]: "Plötslig skada (t.ex. vrickning, sträckning, smäll)",
  [InjuryType.CHRONIC]: "Långvarig smärta (>3 mån) eller återkommande besvär",
  [InjuryType.POST_OP]: "Rehabilitering efter operation (t.ex. Artroskopi, Protes)",
  [InjuryType.PREHAB]: "Förebyggande träning inför säsong eller op."
};

const BODY_PART_SYMPTOMS: Record<string, string> = {
    'Nacke': 'Cervikalgi, Whiplash, Diskbråck eller Spänningshuvudvärk.',
    'Axlar': 'Impingement, Rotatorcuff-ruptur, Frozen Shoulder eller AC-led.',
    'Bröstrygg': 'Thorakal segmentell dysfunktion, "Låsning" eller Stress.',
    'Armbåge': 'Lateral epikondylit (Tennis), Medial (Golf) eller Bursit.',
    'Handled': 'Karpaltunnelsyndrom, TFCC-skada eller Överbelastning.',
    'Ländrygg': 'Lumbago (Ryggskott), Ischias, Diskbråck eller Spinal stenos.',
    'Ljumskar': 'FAI (Impingement), Adduktor-tendinopati eller Sportbråck.',
    'Säte': 'Gluteal tendinopati, Piriformis-syndrom eller Höftledsartros.',
    'Lår (Bak)': 'Hamstrings-ruptur/tendinopati (Löparskada).',
    'Knä': 'Patellofemoralt smärtsyndrom (PFSS), Menisk, Korsband eller Artros.',
    'Underben': 'Medialt Tibialt Stressyndrom (Benhinnor) eller Kompartment.',
    'Vad': 'Gastrocnemius-ruptur (Gubbvad) eller Akillestendinopati.',
    'Häl': 'Plantar fasciit (Hälsporre), Haglunds häl eller Fettkudde.',
    'Fot': 'Metatarsalgi, Morton\'s neurom eller Fotledsstukning.'
};

const PAIN_CHARACTERS = [
    { id: 'molande', label: 'Molande / Värkande', icon: Moon, desc: 'Vanligt vid inflammation/artros' },
    { id: 'huggande', label: 'Huggande / Skarp', icon: Zap, desc: 'Vid vissa rörelser/låsningar' },
    { id: 'brannande', label: 'Brännande / Elektrisk', icon: Flame, desc: 'Kan tyda på nervpåverkan' },
    { id: 'bultande', label: 'Bultande / Pulserande', icon: Activity, desc: 'Hög inflammation/akut fas' }
];

const FUNCTIONAL_LIMITS: Record<string, string[]> = {
    'Knä': ['Gå i trappor', 'Sitta på huk', 'Springa/Hoppa', 'Sitta stilla länge (bio)'],
    'Ländrygg': ['Ta på strumpor', 'Lyfta tungt', 'Sitta vid skrivbord', 'Sova hela natten'],
    'Axlar': ['Kamma håret/tvätta rygg', 'Sova på sidan', 'Lyfta armen över axelhöjd', 'Bära matkassar'],
    'Nacke': ['Vrida huvudet vid bilkörning', 'Titta ner i mobilen', 'Sova på mage', 'Jobba vid datorn'],
    'General': ['Sova', 'Gå promenader', 'Lyfta barn/barnbarn', 'Utöva min sport']
};

const RED_FLAGS: Record<string, string[]> = {
    'Ländrygg': [
        'Har du tappat känseln i underlivet/ljumskarna? (Ridbyxeanestesi)',
        'Har du svårt att kontrollera urin eller avföring?',
        'Har du plötslig kraftlöshet i båda benen?'
    ],
    'Nacke': [
        'Upplever du svårigheter att prata eller svälja?',
        'Har du domningar runt munnen eller i ansiktet?',
        'Har du svimmat (drop attack) vid huvudvridning?'
    ],
    'Generic': [
        'Har du feber eller allmän sjukdomskänsla ihop med smärtan?',
        'Har du haft oväntad viktnedgång den senaste tiden?',
        'Är smärtan konstant dygnet runt och påverkas inte av läge?',
        'Har du tidigare cancerhistorik?'
    ]
};

const BODY_SPECIFIC_QUESTIONS: Record<string, { id: string, label: string, options: string[], hint?: string }[]> = {
    'Knä': [
        { id: 'warmup_effect', label: 'Hur reagerar smärtan på aktivitet?', options: ['Värst i början, blir bättre när jag är varm', 'Gör mer och mer ont ju längre jag håller på', 'Gör ont direkt och släpper aldrig', 'Kommer smygande efter passet'], hint: 'Skiljer på Senor (Warm-up) vs Led/Ben (Värre)' },
        { id: 'stairs', label: 'Var gör det ont i trappor?', options: ['Mest nerför (Framsida knä)', 'Mest uppför (Belastning)', 'Inga problem i trappor', 'Det hugger till plötsligt'], hint: 'Nerförsmärta indikerar ofta PFSS/Hopparknä' },
        { id: 'locking', label: 'Mekaniska symptom?', options: ['Knät låser sig helt', 'Det knäpper/klickar ljudligt', 'Känsla av att det viker sig (Giving way)', 'Nej, bara smärta'], hint: 'Låsningar = Menisk? Viker sig = Korsband/Muskelsvaghet?' },
        { id: 'swelling', label: 'Svullnad?', options: ['Nej', 'Ja, direkt efter skada (inom 2h)', 'Ja, kommer dagen efter', 'Konstant svullet'], hint: 'Snabbt = Blödning (ACL). Långsamt = Synovit/Menisk.' }
    ],
    'Ländrygg': [
        { id: 'radiation', label: 'Utstrålning i benen?', options: ['Nej, bara i ryggen', 'Ja, ner till skinkan/baksida lår', 'Ja, nedanför knät/till foten', 'Domningar/sockerdricka'], hint: 'Nedanför knät = Rotpåverkan (Diskbråck/Stenos)' },
        { id: 'directional', label: 'Vad känns BÄST?', options: ['Att gå/stå (Extension)', 'Att sitta/ligga med böjda ben (Flexion)', 'Att ligga helt stilla', 'Variera position ofta'], hint: 'Gilla Flexion = Stenos? Gilla Extension = Disk?' },
        { id: 'cough', label: 'Gör det ont att hosta/nysa?', options: ['Nej', 'Ja, det hugger i ryggen', 'Ja, det strålar ner i benet'], hint: 'Bukhöjningstryck indikerar diskinvolvering' }
    ],
    'Axlar': [
        { id: 'pain_arc', label: 'När gör det ont i lyftet (Painful Arc)?', options: ['Gör inte ont att lyfta', 'Ont i mitten av lyftet (70-120 grader)', 'Ont allra högst upp (170-180 grader)', 'Kan inte lyfta armen'], hint: 'Mitten = Subacromiell (Impingement). Toppen = AC-led.' },
        { id: 'night', label: 'Nattlig smärta?', options: ['Nej', 'Kan inte ligga på axeln', 'Vaknar av värk oavsett läge'], hint: 'Vilo/nattsmärta indikerar Frozen Shoulder eller inflammatorisk process.' },
        { id: 'sudden', label: 'Känns axeln instabil?', options: ['Nej, den sitter fast', 'Känns "glapp" vid kaströrelser', 'Känns som den ska hoppa ur led'], hint: 'Instabilitet vs Smärta.' }
    ],
    'Häl': [
        { id: 'morning', label: 'Morgonstelhet/Smärta?', options: ['De första stegen är värst, sen mjuknar det', 'Ingen skillnad på morgonen', 'Stel men inte smärtsam'], hint: 'Klassiskt tecken på Plantar Fasciit' },
        { id: 'location', label: 'Var sitter smärtan exakt?', options: ['Under hälen (trampdynan)', 'Bak på hälen (fästet)', 'Några cm upp på hälsenan'], hint: 'Under = PF. Bak = Haglund/Bursit. Upp = Akilles.' }
    ]
};

const GENERIC_QUESTIONS: { id: string, label: string, options: string[], hint?: string }[] = [
    { id: 'load', label: 'När gör det mest ont?', options: ['I vila', 'Vid belastning', 'Efter aktivitet', 'Hela tiden'] },
    { id: 'stiffness', label: 'Upplever du stelhet?', options: ['Ingen', 'På morgonen', 'Efter stillasittande', 'Konstant'] }
];

// Pain History Options
const PAIN_DURATION_OPTIONS = [
  { id: 'akut', label: 'Akut (< 6 veckor)', description: 'Nyligen uppkommen smärta', icon: Zap },
  { id: 'subakut', label: 'Subakut (6v - 3 mån)', description: 'Pågått ett tag', icon: Clock },
  { id: 'kronisk', label: 'Kronisk (> 3 månader)', description: 'Långvarig smärta', icon: History }
];

const PREVIOUS_TREATMENTS = [
  { id: 'fysioterapi', label: 'Fysioterapi', icon: HeartPulse },
  { id: 'medicin', label: 'Smärtstillande', icon: Pill },
  { id: 'kirurgi', label: 'Tidigare operation', icon: Stethoscope },
  { id: 'kiropraktik', label: 'Kiropraktik/Naprapat', icon: User },
  { id: 'akupunktur', label: 'Akupunktur', icon: Target },
  { id: 'vila', label: 'Vila/Avlastning', icon: Moon },
  { id: 'träning', label: 'Egenträning', icon: Activity },
  { id: 'inget', label: 'Ingen behandling', icon: AlertTriangle }
];

const DAILY_PAIN_PATTERNS = [
  { id: 'morgon', label: 'Värst på morgonen', desc: 'Stelhet efter natten' },
  { id: 'kväll', label: 'Värst på kvällen', desc: 'Byggs upp under dagen' },
  { id: 'konstant', label: 'Konstant hela dagen', desc: 'Ingen variation' },
  { id: 'varierande', label: 'Varierar', desc: 'Beror på aktivitet' }
];

// Surgical Procedure Categories
const SURGICAL_PROCEDURES: Record<string, { label: string, procedures: string[] }> = {
  'Knä': {
    label: 'Knäoperationer',
    procedures: [
      'Korsbandrekonstruktion (ACL)',
      'Meniskoperation',
      'Knäprotes (TKA)',
      'Korrigering av knäskål (MPFL)',
      'Brosk-/Microfracture',
      'Artroskopi (övrigt)'
    ]
  },
  'Axlar': {
    label: 'Axeloperationer',
    procedures: [
      'Rotatorkuff-sutur',
      'Axelprotes',
      'Stabilisering (Bankart/Latarjet)',
      'AC-ledsoperation',
      'Subakromial dekompression',
      'Artroskopi (övrigt)'
    ]
  },
  'Höft': {
    label: 'Höftoperationer',
    procedures: [
      'Höftprotes (THA)',
      'Höftartroskopi (FAI)',
      'Labrumsutur',
      'Osteotomi'
    ]
  },
  'Ländrygg': {
    label: 'Ryggoperationer',
    procedures: [
      'Diskbråcksoperation',
      'Steloperation (Fusion)',
      'Dekompression (Stenos)',
      'Diskprotes'
    ]
  },
  'Fot': {
    label: 'Fotoperationer',
    procedures: [
      'Hallux valgus',
      'Hälsenesutur',
      'Fotledsartroskopi',
      'Fotledsprotes'
    ]
  }
};

// SMART Goal Categories
const GOAL_CATEGORIES = [
  { id: 'sport', label: 'Återgå till sport', icon: Activity, examples: ['Springa 5km', 'Spela fotboll', 'Cykla 50km'] },
  { id: 'vardaglig', label: 'Klara vardagen', icon: User, examples: ['Gå i trappor', 'Bära barnbarn', 'Handla mat'] },
  { id: 'arbete', label: 'Kunna arbeta', icon: Briefcase, examples: ['Sitta vid skrivbord', 'Lyfta på jobbet', 'Stå hela dagen'] },
  { id: 'smärtfri', label: 'Bli smärtfri', icon: HeartPulse, examples: ['Sova utan smärta', 'Vakna utvilad', 'Koncentrera mig'] },
  { id: 'styrka', label: 'Bygga styrka', icon: TrendingUp, examples: ['Lyfta 50kg', 'Göra 10 armhävningar', 'Springa fortare'] }
];

const TIMEFRAME_OPTIONS = [
  { id: '4v', label: '4 veckor', desc: 'Kort sikt' },
  { id: '8v', label: '8 veckor', desc: 'Medel' },
  { id: '12v', label: '12 veckor', desc: 'Standard rehab' },
  { id: '6m', label: '6 månader', desc: 'Längre mål' },
  { id: '12m', label: '12 månader', desc: 'Postoperativt' }
];

// --- HOLOGRAPHIC 3D BODY SCANNER (DETAILED LINE ART STYLE) ---
interface BodyPoint { id: string; x: number; y: number; view: 'front' | 'back'; label: string; }
const BODY_POINTS: BodyPoint[] = [
  // FRONT POINTS
  { id: 'Nacke', x: 50, y: 13, view: 'front', label: 'Nacke' },
  { id: 'Axlar', x: 28, y: 20, view: 'front', label: 'Höger Axel' },
  { id: 'Axlar', x: 72, y: 20, view: 'front', label: 'Vänster Axel' },
  { id: 'Bröstrygg', x: 50, y: 26, view: 'front', label: 'Bröstkorg' },
  { id: 'Armbåge', x: 20, y: 34, view: 'front', label: 'Höger Armbåge' },
  { id: 'Armbåge', x: 80, y: 34, view: 'front', label: 'Vänster Armbåge' },
  { id: 'Handled', x: 14, y: 48, view: 'front', label: 'Höger Handled' },
  { id: 'Handled', x: 86, y: 48, view: 'front', label: 'Vänster Handled' },
  { id: 'Ljumskar', x: 44, y: 46, view: 'front', label: 'Höger Ljumske' },
  { id: 'Ljumskar', x: 56, y: 46, view: 'front', label: 'Vänster Ljumske' },
  { id: 'Knä', x: 38, y: 68, view: 'front', label: 'Höger Knä' },
  { id: 'Knä', x: 62, y: 68, view: 'front', label: 'Vänster Knä' },
  { id: 'Underben', x: 36, y: 78, view: 'front', label: 'Höger Smalben' },
  { id: 'Underben', x: 64, y: 78, view: 'front', label: 'Vänster Smalben' },
  { id: 'Fot', x: 34, y: 92, view: 'front', label: 'Höger Fot' },
  { id: 'Fot', x: 66, y: 92, view: 'front', label: 'Vänster Fot' },
  // BACK POINTS
  { id: 'Nacke', x: 50, y: 13, view: 'back', label: 'Nacke (Bak)' },
  { id: 'Skulderblad', x: 35, y: 22, view: 'back', label: 'Vänster Skuldra' },
  { id: 'Skulderblad', x: 65, y: 22, view: 'back', label: 'Höger Skuldra' },
  { id: 'Ländrygg', x: 50, y: 38, view: 'back', label: 'Ländrygg' },
  { id: 'Säte', x: 42, y: 48, view: 'back', label: 'Vänster Säte' },
  { id: 'Säte', x: 58, y: 48, view: 'back', label: 'Höger Säte' },
  { id: 'Lår (Bak)', x: 36, y: 60, view: 'back', label: 'Vänster Baksida Lår' },
  { id: 'Lår (Bak)', x: 64, y: 60, view: 'back', label: 'Höger Baksida Lår' },
  { id: 'Vad', x: 36, y: 78, view: 'back', label: 'Vänster Vad' },
  { id: 'Vad', x: 64, y: 78, view: 'back', label: 'Höger Vad' },
  { id: 'Häl', x: 38, y: 92, view: 'back', label: 'Vänster Häl' },
  { id: 'Häl', x: 62, y: 92, view: 'back', label: 'Höger Häl' },
];

const HolographicBodyScanner = ({ selected, onSelect }: { selected: string, onSelect: (part: string) => void }) => {
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const startX = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => { 
        setIsDragging(true); 
        setHasInteracted(true);
        startX.current = e.clientX; 
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const delta = e.clientX - startX.current;
        setRotation(prev => (prev + delta * 0.5) % 360);
        startX.current = e.clientX;
    };
    
    const handleMouseUp = () => setIsDragging(false);

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation(); 
        const delta = e.deltaY * -0.001; 
        setZoom(prevZoom => Math.min(Math.max(prevZoom + delta, 0.6), 2.5));
    };

    const snapToView = (view: 'front' | 'back') => {
        setHasInteracted(true);
        const targetRotation = view === 'front' ? 0 : 180;
        setRotation(targetRotation);
    };

    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const isBackView = normalizedRotation > 90 && normalizedRotation < 270;
    const infoText = selected ? BODY_PART_SYMPTOMS[selected.split(' ')[0]] || BODY_PART_SYMPTOMS[selected] : null;

    return (
        <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-700">
            <div 
                ref={containerRef}
                className={`relative h-[550px] w-full max-w-[380px] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900 border border-slate-800 group select-none ring-4 ring-slate-100 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                {/* Background Grid - Dark */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/80 to-black pointer-events-none z-10"></div>
                
                {/* 3D Tools UI */}
                <div className="absolute top-6 right-6 z-30 flex flex-col gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.2, 2.5)); }} className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 border border-white/10 backdrop-blur-md shadow-lg active:scale-95 transition-all" title="Zooma in"><ZoomIn size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.2, 0.6)); }} className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 border border-white/10 backdrop-blur-md shadow-lg active:scale-95 transition-all" title="Zooma ut"><ZoomOut size={18} /></button>
                </div>
                
                <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
                     <button onClick={(e) => { e.stopPropagation(); snapToView('front'); }} className={`px-3 py-2 text-xs font-bold rounded-xl border backdrop-blur-md transition-all ${!isBackView ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/10 text-slate-400 border-white/10 hover:text-white'}`}>Framsida</button>
                     <button onClick={(e) => { e.stopPropagation(); snapToView('back'); }} className={`px-3 py-2 text-xs font-bold rounded-xl border backdrop-blur-md transition-all ${isBackView ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/10 text-slate-400 border-white/10 hover:text-white'}`}>Baksida</button>
                </div>

                {/* Info HUD */}
                {selected && infoText && (
                    <div className="absolute bottom-6 left-6 right-6 z-40 bg-black/90 backdrop-blur-md border border-cyan-500/50 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 pointer-events-none">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-cyan-900/50 rounded-lg text-cyan-400 mt-1 border border-cyan-800">
                                <Info size={16} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wide">{selected}</h4>
                                <p className="text-gray-300 text-xs leading-relaxed">{infoText}</p>
                            </div>
                        </div>
                    </div>
                )}

                {!hasInteracted && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 text-white/50 pointer-events-none animate-pulse">
                        <Move3d size={40} />
                        <span className="font-bold tracking-widest text-sm uppercase bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">Dra för att rotera</span>
                    </div>
                )}

                {/* 3D Scene */}
                <div 
                    className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out will-change-transform cursor-grab active:cursor-grabbing"
                    style={{ perspective: '1000px', transform: `scale(${zoom})` }}
                >
                    <div className="relative w-[280px] h-[550px]" style={{ transformStyle: 'preserve-3d', transform: `rotateY(${rotation}deg)` }}>
                        
                        {/* FRONT SKELETON - ANATOMICAL LINE ART (STROKE BASED) */}
                        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                             <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                                <defs>
                                    <filter id="glowLine">
                                        <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                
                                <g stroke="#e2e8f0" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#glowLine)">
                                    
                                    {/* SKULL */}
                                    <g transform="translate(100, 30)">
                                        {/* Cranium */}
                                        <path d="M0,-22 C-15,-22 -22,-12 -22,0 C-22,20 -12,32 0,35 C12,32 22,20 22,0 C22,-12 15,-22 0,-22 Z" />
                                        {/* Jaw / Mandible */}
                                        <path d="M-22,0 Q-22,15 -10,32 L0,38 L10,32 Q22,15 22,0" />
                                        <path d="M-10,25 Q0,28 10,25" strokeWidth="0.5" /> {/* Teeth */}
                                        {/* Orbits */}
                                        <path d="M-12,2 A5,4 0 1,1 -4,2 A5,4 0 1,1 -12,2" />
                                        <path d="M4,2 A5,4 0 1,1 12,2 A5,4 0 1,1 4,2" />
                                        {/* Nose */}
                                        <path d="M0,12 L-2,18 L2,18 Z" strokeWidth="0.8" />
                                    </g>

                                    {/* CERVICAL SPINE */}
                                    <path d="M100,68 L100,85" strokeWidth="6" stroke="black" /> {/* Spacer */}
                                    <path d="M96,72 H104 M96,76 H104 M96,80 H104" strokeWidth="1.5" />

                                    {/* CLAVICLES */}
                                    <path d="M100,85 C85,82 70,88 55,85" />
                                    <path d="M100,85 C115,82 130,88 145,85" />

                                    {/* THORAX / RIBCAGE */}
                                    <g transform="translate(100, 110)">
                                        <path d="M0,-25 L0,20" strokeWidth="3" /> {/* Sternum */}
                                        
                                        {/* Ribs L */}
                                        <path d="M-2,-20 C-15,-22 -30,-10 -25,0" />
                                        <path d="M-2,-12 C-20,-12 -35,0 -28,10" />
                                        <path d="M-2,-4 C-22,-2 -38,10 -32,20" />
                                        <path d="M-2,4 C-20,8 -32,18 -25,28" />
                                        <path d="M-2,12 C-15,15 -25,22 -20,28" />
                                        
                                        {/* Ribs R */}
                                        <path d="M2,-20 C15,-22 30,-10 25,0" />
                                        <path d="M2,-12 C20,-12 35,0 28,10" />
                                        <path d="M2,-4 C22,-2 38,10 32,20" />
                                        <path d="M2,4 C20,8 32,18 25,28" />
                                        <path d="M2,12 C15,15 25,22 20,28" />
                                    </g>

                                    {/* LUMBAR SPINE */}
                                    <path d="M100,140 L100,170" strokeWidth="8" stroke="black" /> {/* Spacer */}
                                    <path d="M95,145 H105 M94,152 H106 M93,159 H107 M94,166 H106" strokeWidth="1.5" />

                                    {/* PELVIS - Detailed */}
                                    <g transform="translate(100, 185)">
                                        {/* Iliac Crests */}
                                        <path d="M-5,0 C-20,-10 -40,0 -35,25 C-32,35 -20,40 -5,42" />
                                        <path d="M5,0 C20,-10 40,0 35,25 C32,35 20,40 5,42" />
                                        {/* Sacrum */}
                                        <path d="M-5,0 L5,0 L0,25 Z" />
                                        {/* Pubis/Ischium */}
                                        <path d="M-5,42 Q-10,50 0,52 Q10,50 5,42" />
                                        <circle cx="-25" cy="25" r="4" strokeWidth="0.8" /> {/* Hip Socket L */}
                                        <circle cx="25" cy="25" r="4" strokeWidth="0.8" /> {/* Hip Socket R */}
                                    </g>

                                    {/* ARMS */}
                                    <g>
                                        {/* Left Humerus */}
                                        <path d="M55,85 L45,145" strokeWidth="1.5" />
                                        <path d="M57,87 L47,147" strokeWidth="0.5" strokeOpacity="0.5" /> {/* Bone thickness hint */}
                                        {/* Elbow */}
                                        <path d="M45,145 Q42,150 48,150" strokeWidth="1" />
                                        {/* Forearm (Radius/Ulna) */}
                                        <path d="M48,150 L42,200" /> 
                                        <path d="M44,150 L38,198" />
                                        
                                        {/* Right Humerus */}
                                        <path d="M145,85 L155,145" strokeWidth="1.5" />
                                        {/* Elbow */}
                                        <path d="M155,145 Q158,150 152,150" strokeWidth="1" />
                                        {/* Forearm */}
                                        <path d="M152,150 L158,200" />
                                        <path d="M156,150 L162,198" />
                                    </g>

                                    {/* HANDS */}
                                    <g>
                                        <path d="M42,200 L35,215" /> {/* Wrist/Palm L */}
                                        <path d="M35,215 L30,225 M37,215 L35,225 M40,215 L40,225" strokeWidth="0.8" /> {/* Fingers L */}
                                        
                                        <path d="M158,200 L165,215" /> {/* Wrist/Palm R */}
                                        <path d="M165,215 L170,225 M163,215 L165,225 M160,215 L160,225" strokeWidth="0.8" /> {/* Fingers R */}
                                    </g>

                                    {/* LEGS */}
                                    <g>
                                        {/* Left Femur */}
                                        <path d="M75,210 Q68,260 75,310" strokeWidth="1.5" />
                                        {/* Patella */}
                                        <circle cx="75" cy="315" r="2.5" fill="black" stroke="white" />
                                        {/* Tibia */}
                                        <path d="M75,320 L73,390" strokeWidth="1.5" />
                                        {/* Fibula */}
                                        <path d="M78,320 L76,385" strokeWidth="1" />
                                        
                                        {/* Right Femur */}
                                        <path d="M125,210 Q132,260 125,310" strokeWidth="1.5" />
                                        {/* Patella */}
                                        <circle cx="125" cy="315" r="2.5" fill="black" stroke="white" />
                                        {/* Tibia */}
                                        <path d="M125,320 L127,390" strokeWidth="1.5" />
                                        {/* Fibula */}
                                        <path d="M122,320 L124,385" strokeWidth="1" />
                                    </g>

                                    {/* FEET */}
                                    <g>
                                        <path d="M73,390 L65,405 L80,405 Z" strokeWidth="1" />
                                        <path d="M127,390 L135,405 L120,405 Z" strokeWidth="1" />
                                    </g>
                                </g>
                             </svg>
                        </div>
                        
                        {/* BACK SKELETON - DETAILED LINE ART */}
                        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                                <g stroke="#e2e8f0" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#glowLine)">
                                    {/* SKULL BACK */}
                                    <g transform="translate(100, 30)">
                                        <path d="M0,-22 C-15,-22 -22,-12 -22,0 C-22,25 -12,38 0,40 C12,38 22,25 22,0 C22,-12 15,-22 0,-22 Z" />
                                        <path d="M-5,40 L0,25 L5,40" strokeWidth="0.5" /> {/* Occipital bone hint */}
                                    </g>

                                    {/* SPINE COLUMN (Spinous Processes) */}
                                    <path d="M100,45 L100,175" strokeWidth="4" stroke="black" />
                                    {/* Vertebrae markers */}
                                    {[...Array(18)].map((_, i) => (
                                        <path key={i} d={`M97,${50 + i*7} L100,${53 + i*7} L103,${50 + i*7}`} strokeWidth="1" />
                                    ))}

                                    {/* SCAPULA */}
                                    <path d="M70,90 L90,90 L85,120 Z" strokeWidth="1.5" />
                                    <path d="M72,95 L88,95" strokeWidth="0.5" /> {/* Spine of scapula */}
                                    
                                    <path d="M130,90 L110,90 L115,120 Z" strokeWidth="1.5" />
                                    <path d="M128,95 L112,95" strokeWidth="0.5" />

                                    {/* RIBS BACK */}
                                    <g transform="translate(100, 110)">
                                        <path d="M-5,0 C-20,5 -30,15 -25,25" strokeWidth="1" strokeOpacity="0.5" />
                                        <path d="M5,0 C20,5 30,15 25,25" strokeWidth="1" strokeOpacity="0.5" />
                                    </g>

                                    {/* PELVIS BACK (Sacrum & Ilium) */}
                                    <g transform="translate(100, 175)">
                                        <path d="M0,0 C-15,-5 -35,5 -35,25 C-30,40 -10,40 0,45 C10,40 30,40 35,25 C35,5 15,-5 0,0" strokeWidth="2" />
                                        <path d="M0,0 L-8,30 L0,40 L8,30 L0,0" strokeWidth="1.5" /> {/* Sacrum Triangle */}
                                        <path d="M-30,25 L-10,35" strokeWidth="0.5" opacity="0.5" />
                                        <path d="M30,25 L10,35" strokeWidth="0.5" opacity="0.5" />
                                    </g>

                                    {/* LIMBS BACK */}
                                    <g>
                                        <path d="M55,85 L45,145" strokeWidth="1.5" />
                                        <path d="M45,145 L40,195" />
                                        <path d="M42,145 L36,193" />
                                        
                                        <path d="M145,85 L155,145" strokeWidth="1.5" />
                                        <path d="M155,145 L160,195" />
                                        <path d="M158,145 L164,193" />
                                        
                                        <path d="M75,205 Q68,255 75,305" strokeWidth="1.5" />
                                        <path d="M75,315 L73,385" />
                                        <path d="M78,315 L76,380" />
                                        
                                        <path d="M125,205 Q132,255 125,305" strokeWidth="1.5" />
                                        <path d="M125,315 L127,385" />
                                        <path d="M122,315 L124,380" />
                                    </g>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Hotspots - Enhanced Visibility for Line Art */}
                <div className="absolute inset-0 pointer-events-none" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
                    {BODY_POINTS.map((point, idx) => {
                        if (point.view === 'front' && isBackView) return null;
                        if (point.view === 'back' && !isBackView) return null;
                        
                        const isSelected = selected === point.id;

                        return (
                           <button 
                                key={idx} 
                                onClick={(e) => { e.stopPropagation(); onSelect(point.id); }}
                                className="absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center pointer-events-auto group/point z-40 outline-none"
                                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                            >
                                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-black/90 text-white text-[11px] font-bold rounded-lg border border-white/30 whitespace-nowrap opacity-0 group-hover/point:opacity-100 transition-all transform group-hover/point:translate-x-1 pointer-events-none z-50 shadow-xl backdrop-blur-sm">
                                    {point.label}
                                </span>

                                {!isSelected && (
                                    <span className="absolute w-full h-full rounded-full bg-cyan-400 opacity-20 animate-ping group-hover/point:opacity-50"></span>
                                )}

                                <span className={`absolute rounded-full transition-all duration-300 border-2 ${
                                    isSelected 
                                    ? 'w-6 h-6 border-cyan-400 bg-white shadow-[0_0_15px_white]' 
                                    : 'w-3 h-3 border-white bg-black/50 group-hover/point:w-5 group-hover/point:h-5 group-hover/point:border-cyan-400 group-hover/point:bg-white/10'
                                }`}></span>

                                <span className={`absolute rounded-full transition-all duration-300 ${
                                    isSelected 
                                    ? 'w-2 h-2 bg-cyan-500' 
                                    : 'w-1 h-1 bg-white'
                                }`}></span>
                           </button> 
                        );
                    })}
                </div>
            </div>
            
            <div className="w-full max-w-xs mt-6 flex items-center gap-4 px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Rotate3d size={16} className="text-slate-400" />
                <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    value={rotation} 
                    onChange={(e) => { setRotation(parseFloat(e.target.value)); setHasInteracted(true); }} 
                    className="flex-grow h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" 
                />
            </div>
        </div>
    );
};

// CSS animations for smooth transitions
const onboardingStyles = `
  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeSlideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-20px);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes celebrateIn {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fadeSlideIn {
    animation: fadeSlideIn 0.3s ease-out forwards;
  }

  .animate-scaleIn {
    animation: scaleIn 0.25s ease-out forwards;
  }

  .animate-celebrateIn {
    animation: celebrateIn 0.4s ease-out forwards;
  }
`;

const Onboarding: React.FC<OnboardingProps> = ({ onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5; // Restructured: Profile, Pain, Safety, AI Assessment, Goals

  // AI-driven assessment state
  const [aiQuestions, setAiQuestions] = useState<FollowUpQuestion[]>([]);
  const [aiAnswers, setAiAnswers] = useState<AIQuestionAnswer[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [showTSK11, setShowTSK11] = useState(false);
  const [tsk11Answers, setTsk11Answers] = useState<Record<number, number>>({});
  const [assessmentSummary, setAssessmentSummary] = useState<string>('');

  // Progressive question display state
  const [currentAIQuestionIndex, setCurrentAIQuestionIndex] = useState(0);
  const [showAISummary, setShowAISummary] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyserar din situation...');
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [data, setData] = useState<UserAssessment>({
    name: '', age: 30, injuryLocation: '', injuryType: InjuryType.ACUTE, symptoms: [], painLevel: 3, activityPainLevel: 5, goals: '', activityLevel: 'Måttlig',
    specificAnswers: {},
    redFlags: [],
    painCharacter: 'molande',
    functionalLimitations: [],
    lifestyle: { sleep: 'Okej', stress: 'Medel', fearAvoidance: false, workload: 'Stillasittande' },
    additionalInfo: '',
    painHistory: {
      duration: 'akut',
      previousEpisodes: 0,
      previousTreatments: []
    },
    smartGoal: {
      specific: '',
      measurable: '',
      timeframe: '12v',
      primaryGoal: ''
    }
  });

  // State for standardized assessment questionnaire
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [customBodyPart, setCustomBodyPart] = useState('');
  const [showCustomBodyInput, setShowCustomBodyInput] = useState(false);

  // State för att spåra senast skippade steg (för feedback)
  const [lastSkippedStep, setLastSkippedStep] = useState<number | null>(null);

  // ROM Assessment state (optional camera-based measurement)
  const [showROMOffer, setShowROMOffer] = useState(false);
  const [showROMAssessment, setShowROMAssessment] = useState(false);
  const [romBaseline, setRomBaseline] = useState<BaselineROM | null>(null);
  const [romDeclined, setRomDeclined] = useState(false);

  // Simplified step navigation - no skipping with AI-driven flow
  const handleNext = () => {
      const nextStep = getNextStep(step);
      setLastSkippedStep(null);
      setStep(nextStep);
  };

  const handleBack = () => {
      const prevStep = getPrevStep(step);
      setLastSkippedStep(null);
      setStep(prevStep);
  };
  const updateData = (key: keyof UserAssessment, value: any) => setData(prev => ({ ...prev, [key]: value }));
  const updateSpecificAnswer = (questionId: string, answer: string) => {
      setData(prev => ({
          ...prev,
          specificAnswers: { ...prev.specificAnswers, [questionId]: answer }
      }));
  };
  const updateLifestyle = (key: keyof typeof data.lifestyle, value: any) => {
      setData(prev => ({
          ...prev,
          lifestyle: { ...prev.lifestyle, [key]: value }
      }));
  };
  
  const toggleRedFlag = (flag: string) => {
      setData(prev => {
          const current = prev.redFlags || [];
          if (current.includes(flag)) {
              return { ...prev, redFlags: current.filter(f => f !== flag) };
          }
          return { ...prev, redFlags: [...current, flag] };
      });
  };

  const toggleLimitation = (limit: string) => {
      setData(prev => {
          const current = prev.functionalLimitations || [];
          if (current.includes(limit)) return { ...prev, functionalLimitations: current.filter(l => l !== limit) };
          return { ...prev, functionalLimitations: [...current, limit] };
      });
  };

  // --- NEW: Surgical Details Handler ---
  const updateSurgicalDetails = (key: string, value: any) => {
      setData(prev => ({
          ...prev,
          surgicalDetails: {
              procedure: prev.surgicalDetails?.procedure || '',
              date: prev.surgicalDetails?.date || '',
              surgeonRestrictions: prev.surgicalDetails?.surgeonRestrictions || '',
              weightBearing: (prev.surgicalDetails?.weightBearing || 'Fullt') as any,
              riskFactors: prev.surgicalDetails?.riskFactors || [],
              [key]: value
          }
      }));
  };

  const toggleRiskFactor = (factor: string) => {
      setData(prev => {
          const current = prev.surgicalDetails?.riskFactors || [];
          const newFactors = current.includes(factor)
            ? current.filter(f => f !== factor)
            : [...current, factor];

          return {
              ...prev,
              surgicalDetails: {
                  ...prev.surgicalDetails!,
                  riskFactors: newFactors
              }
          };
      });
  };

  // --- NEW: Pain History Handler ---
  const updatePainHistory = (key: keyof PatientPainHistory, value: any) => {
      setData(prev => ({
          ...prev,
          painHistory: {
              ...prev.painHistory!,
              [key]: value
          }
      }));
  };

  const togglePreviousTreatment = (treatment: string) => {
      setData(prev => {
          const current = prev.painHistory?.previousTreatments || [];
          const newTreatments = current.includes(treatment)
            ? current.filter(t => t !== treatment)
            : [...current, treatment];
          return {
              ...prev,
              painHistory: {
                  ...prev.painHistory!,
                  previousTreatments: newTreatments
              }
          };
      });
  };

  // --- NEW: SMART Goal Handler ---
  const updateSmartGoal = (key: keyof SMARTGoal, value: string) => {
      setData(prev => ({
          ...prev,
          smartGoal: {
              ...prev.smartGoal!,
              [key]: value
          }
      }));
  };

  // --- NEW: Assessment Answer Handler ---
  const updateAssessmentAnswer = (questionId: string, value: number) => {
      setAssessmentAnswers(prev => ({
          ...prev,
          [questionId]: value
      }));
  };

  // Get appropriate scale based on body area
  const getRelevantScale = useMemo((): AssessmentScale | null => {
      const location = data.injuryLocation.toLowerCase();

      if (['ländrygg', 'rygg', 'bäcken'].some(area => location.includes(area))) {
          return ODI_SCALE;
      }
      if (['axel', 'armbåge', 'handled', 'hand', 'fingrar'].some(area => location.includes(area))) {
          return QUICKDASH_SCALE;
      }
      if (location.includes('knä')) {
          return KOOS_PS_SCALE;
      }
      if (location.includes('höft') || location.includes('ljumsk') || location.includes('säte')) {
          return HOOS_PS_SCALE;
      }
      return null;
  }, [data.injuryLocation]);

  // Check if TSK-11 should be shown (pain > 5 or fear avoidance)
  const shouldShowTSK = useMemo(() => {
      return data.painLevel > 5 || data.activityPainLevel > 5 || data.lifestyle.fearAvoidance;
  }, [data.painLevel, data.activityPainLevel, data.lifestyle.fearAvoidance]);

  // ============================================
  // ADAPTIV ONBOARDING - Skip Logic
  // ============================================

  // With AI-driven assessment, we no longer skip steps
  // The AI dynamically generates relevant questions
  const getSkippedSteps = useMemo((): Set<number> => new Set<number>(), []);

  // All 5 steps are always shown
  const actualStepCount = TOTAL_STEPS;

  // Current position is just the step number
  const getCurrentPosition = (): number => step;

  // Simple step navigation
  const getNextStep = (currentStep: number): number => Math.min(currentStep + 1, TOTAL_STEPS);
  const getPrevStep = (currentStep: number): number => Math.max(currentStep - 1, 1);

  // No skip reasons needed
  const getSkipReason = (_stepNum: number): string | null => null;

  // Realtids-insikter efter nyckelsteg
  const getStepInsight = (): string | null => {
      switch (step) {
          case 2:
              // Skadetyp-insikter
              if (data.injuryType === InjuryType.CHRONIC) {
                  return "Kronisk smärta kräver ofta ett annorlunda förhållningssätt - vi fokuserar på gradvis exponering och smärthantering";
              }
              if (data.injuryType === InjuryType.POST_OP) {
                  return "Postoperativ rehabilitering följer specifika protokoll - vi anpassar efter din operation och läkningstid";
              }
              break;
          case 4:
              // Smärtnivå-insikter
              if (data.painLevel && data.painLevel > 7) {
                  return "Din höga smärtnivå kommer att påverka programintensiteten - vi börjar försiktigt";
              }
              if (data.painCharacter === 'brannande') {
                  return "Brännande smärta kan tyda på nervpåverkan - vi undviker aggressiv stretching";
              }
              if (data.painCharacter === 'bultande') {
                  return "Bultande smärta indikerar inflammation - fokus på vila och lätta övningar";
              }
              break;
          case 5:
              if (data.lifestyle?.fearAvoidance) {
                  return "Vi noterar viss oro kring rörelse - programmet kommer fokusera på trygghet och gradvis exponering";
              }
              if (data.lifestyle?.stress === 'Hög' && data.lifestyle?.sleep === 'Dålig') {
                  return "Hög stress + dålig sömn: Vi prioriterar återhämtning och stresshantering i ditt program";
              }
              if (data.lifestyle?.workload === 'Fysiskt tungt') {
                  return "Fysiskt tungt arbete: Programmet inkluderar pausövningar och arbetsanpassad träning";
              }
              break;
          case 6:
              // Smärthistorik-insikter
              if (data.painHistory?.duration === 'kronisk') {
                  return "Kronisk smärta (>3 månader): Programmet fokuserar på smärthantering och central sensitisering";
              }
              if (data.painHistory?.previousEpisodes && data.painHistory.previousEpisodes > 2) {
                  return `Återkommande besvär (${data.painHistory.previousEpisodes} episoder): Vi inkluderar förebyggande övningar och motorisk kontroll`;
              }
              if (data.painHistory?.dailyPattern === 'morgon') {
                  return "Morgonsmärta: Programmet börjar med mjuka mobiliseringsövningar";
              }
              if (data.painHistory?.dailyPattern === 'kväll') {
                  return "Kvällssmärta: Träning rekommenderas på morgon/förmiddag för bästa resultat";
              }
              break;
          case 7:
              const tsk = data.baselineAssessments?.tsk11?.score;
              if (tsk && tsk > 30) {
                  return "Rörelserädsla identifierad - programmet inkluderar psykoedukation och graded exposure";
              }
              if (data.baselineAssessments?.odi?.percentScore && data.baselineAssessments.odi.percentScore > 60) {
                  return "Hög funktionsnedsättning - vi börjar med få övningar och bygger gradvis";
              }
              break;
          case 8:
              // SMART-mål insikter
              if (data.smartGoal?.primaryGoal === 'sport') {
                  return "Mål: Återgång till sport - programmet inkluderar sportspecifika övningar i senare faser";
              }
              if (data.smartGoal?.primaryGoal === 'arbete') {
                  return "Mål: Återgång till arbete - vi inkluderar arbetsplatsanpassade övningar och pausprogram";
              }
              break;
      }
      return null;
  };

  // Analysera smärtmönster och ge rekommendation
  const getPainPatternAnalysis = (): { type: string; recommendation: string; color: string } | null => {
      if (step !== 6 || !data.painHistory) return null;

      const { duration, previousEpisodes, dailyPattern } = data.painHistory;

      // Kronisk + många episoder = motorisk kontroll fokus
      if (duration === 'kronisk' && previousEpisodes && previousEpisodes > 2) {
          return {
              type: 'Återkommande kronisk smärta',
              recommendation: 'Ditt smärtmönster tyder på att motorisk kontroll och stabilitet är viktigt. Programmet kommer fokusera på detta.',
              color: 'amber'
          };
      }

      // Akut + första gången = standard rehab
      if (duration === 'akut' && (!previousEpisodes || previousEpisodes === 0)) {
          return {
              type: 'Akut första episod',
              recommendation: 'Bra prognos! De flesta med akut smärta återhämtar sig inom 6-8 veckor med rätt träning.',
              color: 'green'
          };
      }

      // Kronisk + morgonsmärta = inflammatorisk komponent
      if (duration === 'kronisk' && dailyPattern === 'morgon') {
          return {
              type: 'Inflammatoriskt mönster',
              recommendation: 'Morgonstelhet kan indikera inflammation. Vi inkluderar lätta rörlighetsövningar för morgonen.',
              color: 'blue'
          };
      }

      // Aktivitetsrelaterad smärta
      if (dailyPattern === 'varierande') {
          return {
              type: 'Aktivitetsrelaterad smärta',
              recommendation: 'Din smärta varierar med aktivitet. Vi hjälper dig hitta rätt belastningsnivå.',
              color: 'purple'
          };
      }

      return null;
  };

  // Generera detaljerat tolkningskort för bedömningsresultat
  interface InterpretationCard {
      severityLevel: 'minimal' | 'mild' | 'moderate' | 'severe';
      severityColor: string;
      severityBg: string;
      whatItMeans: string;
      programImplication: string;
      expectedTimeline: string;
      keyFocus: string[];
  }

  const getAssessmentInterpretationCard = (
      scaleId: string,
      percentScore: number,
      level?: string
  ): InterpretationCard => {
      // Determine severity based on percent score (lower = more disability for ODI, QUICKDASH, etc)
      const getSeverity = (): 'minimal' | 'mild' | 'moderate' | 'severe' => {
          if (percentScore <= 20) return 'minimal';
          if (percentScore <= 40) return 'mild';
          if (percentScore <= 60) return 'moderate';
          return 'severe';
      };

      const severity = getSeverity();
      const severityConfig = {
          minimal: { color: 'text-green-700', bg: 'bg-green-100' },
          mild: { color: 'text-yellow-700', bg: 'bg-yellow-100' },
          moderate: { color: 'text-orange-700', bg: 'bg-orange-100' },
          severe: { color: 'text-red-700', bg: 'bg-red-100' }
      };

      // Scale-specific interpretations
      const interpretations: Record<string, Record<string, Partial<InterpretationCard>>> = {
          odi: {
              minimal: {
                  whatItMeans: 'Din rygg påverkar knappt ditt dagliga liv. Bra utgångsläge för förebyggande träning.',
                  programImplication: 'Fokus på styrkebyggande och förebyggande. Aktiv rehabilitering rekommenderas.',
                  expectedTimeline: '2-4 veckor för full återgång',
                  keyFocus: ['Kärnstabilitet', 'Hållningsträning', 'Gradvis belastningsökning']
              },
              mild: {
                  whatItMeans: 'Viss begränsning i vardagen. Smärtan påverkar ibland aktiviteter.',
                  programImplication: 'Balanserat program med smärthantering och styrkeövningar.',
                  expectedTimeline: '4-8 veckor för betydande förbättring',
                  keyFocus: ['Smärtlindring', 'Motorisk kontroll', 'Graderad aktivitet']
              },
              moderate: {
                  whatItMeans: 'Märkbar påverkan på dagliga aktiviteter. Behov av strategier för smärthantering.',
                  programImplication: 'Graderad exponering med fokus på smärtreducering först.',
                  expectedTimeline: '8-12 veckor för stabil förbättring',
                  keyFocus: ['Smärtneuroedukation', 'Trygga rörelser', 'Sömnoptimering']
              },
              severe: {
                  whatItMeans: 'Betydande funktionsbegränsning. Smärtan dominerar vardagen.',
                  programImplication: 'Försiktig start med fokus på att bryta smärtcykeln.',
                  expectedTimeline: '12-16+ veckor med individuell anpassning',
                  keyFocus: ['Grundläggande rörelse', 'Central sensitisering', 'Pacing-strategier']
              }
          },
          quickdash: {
              minimal: {
                  whatItMeans: 'Armen/handen fungerar väl. God grund för rehabilitering.',
                  programImplication: 'Progressiv styrketräning och funktionell träning.',
                  expectedTimeline: '3-6 veckor för full funktion',
                  keyFocus: ['Styrka', 'Uthållighet', 'Arbetsspecifika rörelser']
              },
              mild: {
                  whatItMeans: 'Vissa begränsningar vid belastning eller upprepade rörelser.',
                  programImplication: 'Graderad belastning med fokus på svaga områden.',
                  expectedTimeline: '6-10 veckor för stabil förbättring',
                  keyFocus: ['Excentrisk träning', 'Gripstyrka', 'Ergonomisk rådgivning']
              },
              moderate: {
                  whatItMeans: 'Tydliga begränsningar i dagliga aktiviteter och arbete.',
                  programImplication: 'Individualiserat program med fokus på smärtfria rörelser.',
                  expectedTimeline: '10-14 veckor för betydande förbättring',
                  keyFocus: ['Rörelsebanor', 'Inflammation', 'Aktivitetsmodifiering']
              },
              severe: {
                  whatItMeans: 'Allvarlig funktionsnedsättning. Överväg specialistkonsultation.',
                  programImplication: 'Mycket försiktig start. Fokus på att bibehålla rörlighet.',
                  expectedTimeline: '14+ veckor med nära uppföljning',
                  keyFocus: ['Smärthantering', 'Assisterade rörelser', 'Kompensationsstrategier']
              }
          },
          tsk11: {
              minimal: {
                  whatItMeans: 'Låg rörelserädsla. Du är redo för aktiv rehabilitering.',
                  programImplication: 'Standard träningsprogram utan särskilda anpassningar.',
                  expectedTimeline: 'Normal progression enligt planerat',
                  keyFocus: ['Styrkeökning', 'Uthållighet', 'Funktionell träning']
              },
              mild: {
                  whatItMeans: 'Viss försiktighet kring rörelse. Medvetenhet om smärta.',
                  programImplication: 'Tydlig kommunikation om säkra rörelser.',
                  expectedTimeline: 'Något långsammare vid nya övningar',
                  keyFocus: ['Trygghetsbyggande', 'Graderad exponering', 'Positiv förstärkning']
              },
              moderate: {
                  whatItMeans: 'Märkbar rörelserädsla som kan bromsa rehabiliteringen.',
                  programImplication: 'Graded exposure med fokus på trygghet och edukation.',
                  expectedTimeline: 'Kan kräva längre tid för varje progression',
                  keyFocus: ['Smärtneuroedukation', 'Kognitiv omstrukturering', 'Trygga miljöer']
              },
              severe: {
                  whatItMeans: 'Hög rörelserädsla. Risk för kronifiering om ej adresseras.',
                  programImplication: 'Primärt fokus på att minska rädsla före fysisk träning.',
                  expectedTimeline: 'Utökad tid behövs - psykologiskt stöd övervägs',
                  keyFocus: ['Fear-avoidance terapi', 'Exponering', 'Multidisciplinärt stöd']
              }
          },
          koos_ps: {
              minimal: {
                  whatItMeans: 'God knäfunktion. Redo för progressiv träning.',
                  programImplication: 'Fokus på styrka och stabilitet.',
                  expectedTimeline: '4-8 veckor för optimal funktion',
                  keyFocus: ['Quadriceps-styrka', 'Balans', 'Sport-specifik träning']
              },
              mild: {
                  whatItMeans: 'Viss begränsning vid belastande aktiviteter.',
                  programImplication: 'Graderad belastning med fokus på stabilitet.',
                  expectedTimeline: '8-12 veckor för stabil förbättring',
                  keyFocus: ['Neuromuskulär kontroll', 'Proprioception', 'Funktionella övningar']
              },
              moderate: {
                  whatItMeans: 'Märkbar begränsning i vardagen och vid aktivitet.',
                  programImplication: 'Strukturerat program med tydliga milstolpar.',
                  expectedTimeline: '12-16 veckor för betydande förbättring',
                  keyFocus: ['Smärtlindring', 'Grundläggande styrka', 'Aktivitetsanpassning']
              },
              severe: {
                  whatItMeans: 'Betydande funktionsnedsättning. Överväg specialist.',
                  programImplication: 'Försiktig start med fokus på lindring.',
                  expectedTimeline: '16+ veckor med individuell plan',
                  keyFocus: ['Vila/aktivitet-balans', 'Anti-inflammatoriskt', 'Ev. hjälpmedel']
              }
          },
          hoos_ps: {
              minimal: {
                  whatItMeans: 'God höftfunktion. Redo för aktiv träning.',
                  programImplication: 'Progressiv styrke- och rörlighetsträning.',
                  expectedTimeline: '4-8 veckor för optimal funktion',
                  keyFocus: ['Höftabduktorer', 'Core-stabilitet', 'Gångmönster']
              },
              mild: {
                  whatItMeans: 'Viss stelhet eller obehag vid längre aktivitet.',
                  programImplication: 'Rörlighet och styrka i kombination.',
                  expectedTimeline: '8-12 veckor för stabil förbättring',
                  keyFocus: ['Höftextension', 'Rotation', 'Funktionell belastning']
              },
              moderate: {
                  whatItMeans: 'Tydlig begränsning i rörelse och funktion.',
                  programImplication: 'Fokus på rörlighet före styrka.',
                  expectedTimeline: '12-16 veckor för betydande förbättring',
                  keyFocus: ['Ledrörlighet', 'Mjukdelsarbete', 'Anpassade aktiviteter']
              },
              severe: {
                  whatItMeans: 'Allvarlig begränsning. Överväg bilddiagnostik.',
                  programImplication: 'Skonsam start med fokus på komfort.',
                  expectedTimeline: '16+ veckor med specialistuppföljning',
                  keyFocus: ['Smärthantering', 'Assisterade rörelser', 'Livsstilsanpassning']
              }
          }
      };

      // Get scale-specific interpretation or use generic
      const scaleInterp = interpretations[scaleId]?.[severity] || {
          whatItMeans: `Din funktionsnivå är ${severity === 'minimal' ? 'god' : severity === 'mild' ? 'något begränsad' : severity === 'moderate' ? 'märkbart begränsad' : 'betydligt begränsad'}.`,
          programImplication: 'Programmet anpassas efter din funktionsnivå.',
          expectedTimeline: severity === 'minimal' ? '2-4 veckor' : severity === 'mild' ? '4-8 veckor' : severity === 'moderate' ? '8-12 veckor' : '12+ veckor',
          keyFocus: ['Anpassad träning', 'Graderad progression', 'Individuell uppföljning']
      };

      return {
          severityLevel: severity,
          severityColor: severityConfig[severity].color,
          severityBg: severityConfig[severity].bg,
          whatItMeans: scaleInterp.whatItMeans || '',
          programImplication: scaleInterp.programImplication || '',
          expectedTimeline: scaleInterp.expectedTimeline || '',
          keyFocus: scaleInterp.keyFocus || []
      };
  };

  // Calculate and store assessment result
  const saveAssessmentResult = (scale: AssessmentScale) => {
      const answers = scale.questions.map(q => ({
          questionId: q.id,
          value: assessmentAnswers[q.id] ?? 0
      }));

      const result = calculateScore(scale, answers);

      const baselineScore: BaselineAssessmentScore = {
          score: result.rawScore,
          percentScore: result.percentScore,
          date: new Date().toISOString(),
          interpretation: result.interpretation.description,
          level: result.interpretation.level,
          clinicalImplication: result.interpretation.clinicalImplication
      };

      // Update the appropriate baseline assessment
      setData(prev => ({
          ...prev,
          baselineAssessments: {
              ...prev.baselineAssessments,
              [scale.id]: baselineScore
          }
      }));
  };

  const getPainVisuals = (level: number) => {
    if (level <= 3) return { label: "Hanterbar", color: "text-green-600", bg: "bg-green-100", icon: Smile };
    if (level <= 6) return { label: "Besvärlig", color: "text-amber-600", bg: "bg-amber-100", icon: Meh };
    return { label: "Svår", color: "text-red-600", bg: "bg-red-100", icon: Frown };
  };

  const getActivityPainVisuals = (level: number) => {
    if (level <= 3) return { label: "Hanterbar", color: "text-amber-600", bg: "bg-amber-100", icon: Activity };
    if (level <= 7) return { label: "Påtaglig", color: "text-orange-600", bg: "bg-orange-100", icon: Flame };
    return { label: "Ilsken", color: "text-red-600", bg: "bg-red-100", icon: Zap };
  };

  // Step 1: Profile (Existing - Keep but ensure styles match)
  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="text-center md:text-left mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Din Profil</h2>
          <p className="text-lg text-slate-500">Vi börjar med grunderna för att anpassa din belastning.</p>
      </div>
      
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Namn</label>
            <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium" value={data.name} onChange={(e) => updateData('name', e.target.value)} placeholder="Vad heter du?" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Ålder</label>
                <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium" value={data.age} onChange={(e) => updateData('age', parseInt(e.target.value))} />
            </div>
            <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Aktivitetsnivå</label>
                 <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium appearance-none cursor-pointer" value={data.activityLevel} onChange={(e) => updateData('activityLevel', e.target.value)}>
                    <option value="Stillasittande">Stillasittande (Kontor/Lite rörelse)</option>
                    <option value="Måttlig">Motionär (1-3 pass/vecka)</option>
                    <option value="Aktiv">Aktiv (3-5 pass/vecka)</option>
                    <option value="Atlet">Elit/Atlet (Daglig träning)</option>
                 </select>
            </div>
        </div>
        <div>
             <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Arbetssituation</label>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Stillasittande', 'Fysiskt lätt', 'Fysiskt tungt'].map(type => (
                    <button 
                        key={type} 
                        onClick={() => updateLifestyle('workload', type)} 
                        className={`p-4 text-sm font-bold rounded-2xl border transition-all ${data.lifestyle.workload === type ? 'bg-slate-900 text-white border-slate-900 shadow-lg transform scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                        {type}
                    </button>
                ))}
             </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Injury Selection & Post-Op Logic
  const renderStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="text-center md:text-left mb-4">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Var gör det ont?</h2>
          <p className="text-lg text-slate-500">Klicka på skelettet för att markera exakt område.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 items-center xl:items-start">
        <div className="w-full max-w-[450px] flex justify-center order-2 xl:order-1">
            <AnatomicalSkeleton
              selected={data.injuryLocation}
              onSelect={(part) => { updateData('injuryLocation', part); setShowCustomBodyInput(false); }}
              use3D={false}
            />
        </div>
        
        <div className="w-full xl:flex-1 space-y-6 order-1 xl:order-2">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target size={100} />
                </div>
                <span className="text-xs uppercase text-slate-400 font-bold tracking-widest">Valt Område</span>
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 my-2 min-h-[40px]">
                    {data.injuryLocation || "Markera i modellen"}
                </div>
                <button onClick={() => { updateData('injuryLocation', ''); setShowCustomBodyInput(!showCustomBodyInput); }} className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors border-b border-dashed border-slate-300 pb-0.5">Hittar du inte? Skriv manuellt</button>
                
                {showCustomBodyInput && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="T.ex. Käke, Tå..." value={customBodyPart} onChange={(e) => { setCustomBodyPart(e.target.value); updateData('injuryLocation', e.target.value); }} autoFocus />
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide ml-1">Typ av besvär</label>
                <div className="grid gap-3">
                    {Object.values(InjuryType).map(type => (
                        <button
                            key={type}
                            onClick={() => updateData('injuryType', type)}
                            className={`p-5 min-h-[72px] text-left rounded-2xl border transition-all relative overflow-hidden group active:scale-[0.98] ${data.injuryType === type ? 'bg-slate-900 border-slate-900 shadow-lg scale-[1.01]' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                            <div className="relative z-10">
                                <div className={`font-bold text-base ${data.injuryType === type ? 'text-white' : 'text-slate-800'}`}>{type}</div>
                                <div className={`text-sm mt-1 ${data.injuryType === type ? 'text-slate-400' : 'text-slate-500'}`}>{INJURY_DESCRIPTIONS[type]}</div>
                            </div>
                            {data.injuryType === type && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500"><CheckCircle2 size={24} /></div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONDITIONAL POST-OP INPUTS */}
            {data.injuryType === InjuryType.POST_OP && (
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="font-bold text-blue-900 flex items-center gap-2"><Stethoscope size={18} /> Kirurgiska Detaljer</h3>
                    
                    <div>
                        <label className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1 block">Vilken operation?</label>
                        <input type="text" className="w-full p-3 bg-white border border-blue-200 rounded-xl text-sm" placeholder="T.ex. Korsbandsrekonstruktion, Menisk..." value={data.surgicalDetails?.procedure || ''} onChange={(e) => updateSurgicalDetails('procedure', e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1 block">Datum</label>
                            <input type="date" className="w-full p-3 bg-white border border-blue-200 rounded-xl text-sm" value={data.surgicalDetails?.date || ''} onChange={(e) => updateSurgicalDetails('date', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1 block">Belastning</label>
                            <select className="w-full p-3 bg-white border border-blue-200 rounded-xl text-sm cursor-pointer" value={data.surgicalDetails?.weightBearing || 'Fullt'} onChange={(e) => updateSurgicalDetails('weightBearing', e.target.value)}>
                                <option value="Fullt">Full belastning</option>
                                <option value="Partiell">Partiell (Kryckor)</option>
                                <option value="Avlastad">Ingen belastning</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1 block">Läkarens Restriktioner</label>
                        <input type="text" className="w-full p-3 bg-white border border-blue-200 rounded-xl text-sm" placeholder="T.ex. Ingen böjning över 90 grader..." value={data.surgicalDetails?.surgeonRestrictions || ''} onChange={(e) => updateSurgicalDetails('surgeonRestrictions', e.target.value)} />
                    </div>

                    {/* NEW: RISK FACTOR SCREENING */}
                    <div>
                        <label className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2 block">Riskfaktorer (påverkar läkning)</label>
                        <div className="flex flex-wrap gap-2">
                            {['Rökning', 'Diabetes', 'Blodförtunnande', 'Tidigare Infektion', 'Högt BMI'].map(factor => {
                                const active = (data.surgicalDetails?.riskFactors || []).includes(factor);
                                return (
                                    <button
                                        key={factor}
                                        onClick={() => toggleRiskFactor(factor)}
                                        className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-bold border transition-all active:scale-[0.97] ${active ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                                    >
                                        {factor}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );

  // Step 3: Red Flags
  const renderStep3 = () => {
      const specificRedFlags = RED_FLAGS[data.injuryLocation] || [];
      const genericRedFlags = RED_FLAGS['Generic'];
      const allFlags = [...specificRedFlags, ...genericRedFlags];

      return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="text-center md:text-left">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center gap-3 justify-center md:justify-start">
                      <Siren className="text-red-500 animate-pulse" /> 
                      Säkerhetskontroll
                  </h2>
                  <p className="text-lg text-slate-500">Innan vi fortsätter måste vi utesluta allvarliga symptom. Kryssa i om något stämmer.</p>
              </div>

              <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
                  <div className="space-y-4">
                      {allFlags.map((flag, idx) => {
                          const isChecked = (data.redFlags || []).includes(flag);
                          return (
                            <button
                                key={idx}
                                onClick={() => toggleRedFlag(flag)}
                                className={`w-full flex items-start gap-4 p-4 min-h-[56px] rounded-xl text-left transition-all border active:scale-[0.98] ${isChecked ? 'bg-red-500 text-white border-red-600 shadow-md' : 'bg-white text-slate-700 border-red-100 hover:bg-red-50/50'}`}
                            >
                                <div className={`w-7 h-7 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isChecked ? 'bg-white border-white text-red-500' : 'bg-white border-red-200'}`}>
                                    {isChecked && <CheckCircle2 size={18} />}
                                </div>
                                <span className="font-medium text-sm">{flag}</span>
                            </button>
                          );
                      })}
                  </div>
              </div>

              {(data.redFlags || []).length > 0 ? (
                   <div className="p-6 bg-slate-900 text-white rounded-2xl flex gap-4 items-start shadow-xl">
                       <AlertTriangle className="flex-shrink-0 text-yellow-400" size={24} />
                       <div>
                           <h4 className="font-bold text-lg mb-1">Viktig information</h4>
                           <p className="text-sm opacity-90 leading-relaxed">Du har markerat symptom som kan kräva läkarbedömning. Vi kommer generera ett anpassat program, men du bör kontakta sjukvården (1177) för rådgivning.</p>
                       </div>
                   </div>
              ) : (
                  <div className="p-6 bg-green-50 text-green-800 rounded-2xl flex gap-4 items-center border border-green-100">
                      <ShieldCheck className="flex-shrink-0 text-green-600" size={24} />
                      <p className="font-medium text-sm">Inga röda flaggor rapporterade. Vi kan gå vidare säkert.</p>
                  </div>
              )}
          </div>
      );
  };

  // Step 4: Deep Clinical Analysis
  const renderStep4 = () => {
    const questions = BODY_SPECIFIC_QUESTIONS[data.injuryLocation] || GENERIC_QUESTIONS;
    const limits = FUNCTIONAL_LIMITS[data.injuryLocation] || FUNCTIONAL_LIMITS['General'];
    
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Klinisk Diagnostik</h2>
                <p className="text-lg text-slate-500">Vi fördjupar oss för att skilja på olika vävnader och tillstånd.</p>
            </div>

            {/* A. SPECIFIC ORTHOPEDIC QUESTIONS */}
            <div className="space-y-6">
                {questions.map((q) => (
                    <div key={q.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl"><Stethoscope size={20} /></div>
                                {q.label}
                            </h3>
                            {q.hint && <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md hidden sm:inline-block">Klinisk Ledtråd</span>}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => updateSpecificAnswer(q.id, opt)}
                                    className={`px-5 py-4 min-h-[52px] rounded-xl text-sm font-medium text-left transition-all border relative overflow-hidden group active:scale-[0.98] ${
                                        data.specificAnswers[q.id] === opt
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-offset-2 ring-slate-900'
                                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-white hover:border-slate-300'
                                    }`}
                                >
                                    {opt}
                                    {data.specificAnswers[q.id] === opt && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-500 rounded-full"></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* B. PAIN CHARACTERISTICS */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                        <Thermometer size={16} /> Hur känns smärtan?
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {PAIN_CHARACTERS.map(char => (
                            <button
                                key={char.id}
                                onClick={() => updateData('painCharacter', char.id)}
                                className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                                    data.painCharacter === char.id 
                                    ? 'bg-primary-50 border-primary-500 text-primary-900 ring-1 ring-primary-500' 
                                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-300'
                                }`}
                            >
                                {React.createElement(char.icon, { size: 24, className: data.painCharacter === char.id ? 'text-primary-600' : 'text-slate-400' })}
                                <div>
                                    <span className="block font-bold text-sm">{char.label}</span>
                                    <span className="text-[10px] opacity-70 block leading-tight">{char.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* C. PAIN LEVELS */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* REST PAIN */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5"><Moon size={80} /></div>
                        <label className="font-bold text-slate-800 mb-4 flex justify-between items-end relative z-10">
                            <span className="text-lg">Smärta i vila</span>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPainVisuals(data.painLevel).bg} ${getPainVisuals(data.painLevel).color}`}>
                                {React.createElement(getPainVisuals(data.painLevel).icon, { size: 14 })}
                                {getPainVisuals(data.painLevel).label} ({data.painLevel}/10)
                            </span>
                        </label>
                        <input type="range" min="0" max="10" value={data.painLevel} onChange={(e) => updateData('painLevel', parseInt(e.target.value))} className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-900 relative z-10" />
                        <div className="flex justify-between mt-2 text-xs font-bold text-slate-300 uppercase relative z-10">
                            <span>Smärtfri</span>
                            <span>Outhärdlig</span>
                        </div>
                    </div>

                    {/* ACTIVITY PAIN */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5"><Activity size={80} /></div>
                        <label className="font-bold text-slate-800 mb-4 flex justify-between items-end relative z-10">
                            <span className="text-lg">Smärta vid rörelse</span>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getActivityPainVisuals(data.activityPainLevel).bg} ${getActivityPainVisuals(data.activityPainLevel).color}`}>
                                {React.createElement(getActivityPainVisuals(data.activityPainLevel).icon, { size: 14 })}
                                {getActivityPainVisuals(data.activityPainLevel).label} ({data.activityPainLevel}/10)
                            </span>
                        </label>
                        <input type="range" min="0" max="10" value={data.activityPainLevel} onChange={(e) => updateData('activityPainLevel', parseInt(e.target.value))} className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-orange-500 relative z-10" />
                        <div className="flex justify-between mt-2 text-xs font-bold text-slate-300 uppercase relative z-10">
                            <span>Smärtfri</span>
                            <span>Outhärdlig</span>
                        </div>
                    </div>
                </div>

                {/* D. FUNCTIONAL LIMITATIONS */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                        <Hammer size={16} /> Vad hindrar smärtan dig från att göra?
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {limits.map(limit => {
                            const active = (data.functionalLimitations || []).includes(limit);
                            return (
                                <button
                                    key={limit}
                                    onClick={() => toggleLimitation(limit)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                        active 
                                        ? 'bg-slate-800 text-white border-slate-800' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                    }`}
                                >
                                    {limit}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Free Text Input */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                     <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <MessageSquare size={16} /> Egna ord / Övrigt
                     </label>
                     <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium h-32 resize-none" 
                        placeholder="Berätta mer om hur det känns, om du har andra sjukdomar eller något annat vi bör veta..."
                        value={data.additionalInfo || ''}
                        onChange={(e) => updateData('additionalInfo', e.target.value)}
                     />
                </div>
            </div>
        </div>
    );
  };

  // Step 5: Lifestyle (Existing)
  const renderStep5 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
        <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Livsstil & Mål</h2>
            <p className="text-lg text-slate-500">Sista steget. Vi ser till hela människan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 hover:bg-indigo-50 transition-colors">
                <label className="flex items-center gap-3 font-bold text-indigo-900 text-lg mb-4">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><Moon size={20} /></div> Sömnkvalitet
                </label>
                <div className="flex gap-3">
                    {['Dålig', 'Okej', 'Bra'].map(opt => (
                        <button key={opt} onClick={() => updateLifestyle('sleep', opt)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${data.lifestyle.sleep === opt ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-indigo-900/60 border border-transparent hover:border-indigo-200'}`}>{opt}</button>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100/50 hover:bg-amber-50 transition-colors">
                <label className="flex items-center gap-3 font-bold text-amber-900 text-lg mb-4">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Brain size={20} /></div> Stressnivå
                </label>
                <div className="flex gap-3">
                    {['Låg', 'Medel', 'Hög'].map(opt => (
                        <button key={opt} onClick={() => updateLifestyle('stress', opt)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${data.lifestyle.stress === opt ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'bg-white text-amber-900/60 border border-transparent hover:border-amber-200'}`}>{opt}</button>
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><AlertTriangle size={24} /></div>
                <div className="flex-1">
                    <label className="font-bold text-slate-900 text-lg block mb-1">
                        Upplever du rädsla för att röra dig?
                    </label>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">Detta kallas "Rörelserädsla" (Kinesiofobi). Det är en naturlig skyddsmekanism, men viktig att vi känner till för att anpassa tempot.</p>
                    
                    <div className="flex flex-wrap gap-4">
                        <button onClick={() => updateLifestyle('fearAvoidance', false)} className={`px-8 py-3 rounded-xl border-2 font-bold text-sm transition-all ${!data.lifestyle.fearAvoidance ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}>Nej, jag kör på</button>
                        <button onClick={() => updateLifestyle('fearAvoidance', true)} className={`px-8 py-3 rounded-xl border-2 font-bold text-sm transition-all ${data.lifestyle.fearAvoidance ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}>Ja, jag är orolig</button>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide ml-1">Ditt Huvudmål</label>
            <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" className="w-full p-5 pl-12 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 outline-none text-lg font-medium placeholder:text-slate-300 transition-shadow" placeholder="T.ex. Kunna springa 5km smärtfritt..." value={data.goals} onChange={(e) => updateData('goals', e.target.value)} />
            </div>
        </div>
    </div>
  );

  // Step 6: Pain History (NEW)
  const renderStep6 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
        <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Smärthistorik</h2>
            <p className="text-lg text-slate-500">Hjälper oss förstå din smärtas natur och vad som fungerat.</p>
        </div>

        {/* Duration */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                <Clock size={16} /> Hur länge har du haft besvär?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PAIN_DURATION_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const isActive = data.painHistory?.duration === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => updatePainHistory('duration', opt.id)}
                            className={`p-5 rounded-2xl border-2 text-left transition-all ${
                                isActive
                                ? 'border-primary-500 bg-primary-50 shadow-lg'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                        >
                            <div className={`p-2 rounded-xl inline-flex mb-3 ${isActive ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                                <Icon size={20} />
                            </div>
                            <div className={`font-bold ${isActive ? 'text-primary-700' : 'text-slate-700'}`}>{opt.label}</div>
                            <div className="text-sm text-slate-500 mt-1">{opt.description}</div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Previous Episodes */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                <History size={16} /> Antal tidigare episoder med liknande besvär
            </label>
            <div className="flex flex-wrap gap-3">
                {[0, 1, 2, 3, 5].map(num => (
                    <button
                        key={num}
                        onClick={() => updatePainHistory('previousEpisodes', num)}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${
                            data.painHistory?.previousEpisodes === num
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {num === 0 ? 'Första gången' : num === 5 ? '5+ gånger' : `${num} gång${num > 1 ? 'er' : ''}`}
                    </button>
                ))}
            </div>
        </div>

        {/* Previous Treatments */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                <Pill size={16} /> Vilka behandlingar har du provat?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PREVIOUS_TREATMENTS.map(treatment => {
                    const Icon = treatment.icon;
                    const isActive = (data.painHistory?.previousTreatments || []).includes(treatment.id);
                    return (
                        <button
                            key={treatment.id}
                            onClick={() => togglePreviousTreatment(treatment.id)}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                isActive
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                        >
                            <Icon size={20} />
                            <span className="text-sm font-medium text-center">{treatment.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Daily Pattern */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">
                När är smärtan värst?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DAILY_PAIN_PATTERNS.map(pattern => (
                    <button
                        key={pattern.id}
                        onClick={() => updatePainHistory('dailyPattern', pattern.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                            data.painHistory?.dailyPattern === pattern.id
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className={`font-bold ${data.painHistory?.dailyPattern === pattern.id ? 'text-amber-700' : 'text-slate-700'}`}>
                            {pattern.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{pattern.desc}</div>
                    </button>
                ))}
            </div>
        </div>

        {/* What Helps / Worsens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50/50 p-6 rounded-[2rem] border border-green-100">
                <label className="block text-sm font-bold text-green-800 mb-3 uppercase tracking-wide">
                    Vad lindrar smärtan?
                </label>
                <textarea
                    className="w-full p-4 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none resize-none h-24"
                    placeholder="T.ex. värme, vila, rörelse..."
                    value={data.painHistory?.whatHelps || ''}
                    onChange={(e) => updatePainHistory('whatHelps', e.target.value)}
                />
            </div>
            <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100">
                <label className="block text-sm font-bold text-red-800 mb-3 uppercase tracking-wide">
                    Vad förvärrar smärtan?
                </label>
                <textarea
                    className="w-full p-4 bg-white border border-red-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none resize-none h-24"
                    placeholder="T.ex. långvarigt sittande, kyla..."
                    value={data.painHistory?.whatWorsens || ''}
                    onChange={(e) => updatePainHistory('whatWorsens', e.target.value)}
                />
            </div>
        </div>
    </div>
  );

  // Step 7: Standardized Assessment (NEW)
  const renderStep7 = () => {
    const scale = getRelevantScale;
    const showTSK = shouldShowTSK && !scale; // Only show TSK if no body-area specific scale

    if (!scale && !showTSK) {
        // No assessment needed for this body area
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Funktionsbedömning</h2>
                    <p className="text-lg text-slate-500">Din kroppslokalisation har inget specifikt formulär.</p>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2rem] text-center">
                    <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                    <p className="text-slate-600">Du kan gå vidare till nästa steg.</p>
                </div>
            </div>
        );
    }

    const activeScale = scale || TSK11_SCALE;

    // Safety check: ensure scale has valid questions array
    if (!activeScale?.questions || !Array.isArray(activeScale.questions) || activeScale.questions.length === 0) {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="text-center">
            <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Formuläret kunde inte laddas</h2>
            <p className="text-slate-500">Det uppstod ett problem. Klicka på Nästa för att fortsätta.</p>
          </div>
        </div>
      );
    }

    // Ensure currentQuestionIndex is within bounds
    const safeQuestionIndex = Math.min(Math.max(0, currentQuestionIndex), activeScale.questions.length - 1);
    const totalQuestions = activeScale.questions.length;
    const progressPercent = Math.round(((safeQuestionIndex + 1) / totalQuestions) * 100);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{activeScale.shortName}</h2>
                <p className="text-lg text-slate-500">{activeScale.description}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                    <Award size={14} aria-hidden="true" />
                    <span>Evidensnivå: {activeScale.evidenceLevel}</span>
                </div>
            </div>

            {/* Progress indicator with ARIA */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                    <span>Fråga {safeQuestionIndex + 1} av {totalQuestions}</span>
                    <span>{progressPercent}%</span>
                </div>
                <div
                    className="h-2 bg-slate-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={safeQuestionIndex + 1}
                    aria-valuemin={1}
                    aria-valuemax={totalQuestions}
                    aria-label={`Framsteg: fråga ${safeQuestionIndex + 1} av ${totalQuestions}`}
                >
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Current Question - using safeQuestionIndex for safe array access */}
            {activeScale.questions[safeQuestionIndex] && (
                <fieldset className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    {activeScale.questions[safeQuestionIndex].section && (
                        <div className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-2">
                            {activeScale.questions[safeQuestionIndex].section}
                        </div>
                    )}
                    <legend className="text-xl font-bold text-slate-900 mb-6">
                        {activeScale.questions[safeQuestionIndex].question}
                    </legend>

                    <div className="space-y-3" role="radiogroup" aria-label={activeScale.questions[safeQuestionIndex].question}>
                        {activeScale.questions[safeQuestionIndex].options?.map((opt, idx) => {
                            const currentQuestion = activeScale.questions[safeQuestionIndex];
                            const isSelected = assessmentAnswers[currentQuestion.id] === opt.value;
                            return (
                                <button
                                    key={idx}
                                    role="radio"
                                    aria-checked={isSelected}
                                    onClick={() => {
                                        updateAssessmentAnswer(currentQuestion.id, opt.value);
                                        // Auto-advance to next question after selection
                                        if (safeQuestionIndex < totalQuestions - 1) {
                                            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300);
                                        }
                                    }}
                                    className={`w-full p-4 min-h-[52px] rounded-xl border-2 text-left transition-all active:scale-[0.98] ${
                                        isSelected
                                        ? 'border-primary-500 bg-primary-50 shadow-md'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className={`font-medium ${isSelected ? 'text-primary-700' : 'text-slate-700'}`}>
                                        {opt.text}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Question navigation */}
                    <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={safeQuestionIndex === 0}
                            aria-label="Föregående fråga"
                            className="px-5 py-3 min-h-[48px] rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-[0.97]"
                        >
                            ← Föregående
                        </button>
                        <button
                            onClick={() => {
                                if (safeQuestionIndex < totalQuestions - 1) {
                                    setCurrentQuestionIndex(prev => prev + 1);
                                } else {
                                    // Save assessment when last question answered
                                    saveAssessmentResult(activeScale);
                                }
                            }}
                            aria-label={safeQuestionIndex === totalQuestions - 1 ? 'Slutför formuläret' : 'Nästa fråga'}
                            className="px-6 py-3 min-h-[48px] rounded-xl text-sm text-white bg-primary-600 hover:bg-primary-700 font-medium transition-all active:scale-[0.97]"
                        >
                            {safeQuestionIndex === totalQuestions - 1 ? 'Slutför ✓' : 'Nästa →'}
                        </button>
                    </div>
                </fieldset>
            )}

            {/* Show result if all questions answered - Enhanced Interpretation Card */}
            {data.baselineAssessments?.[activeScale.id as keyof typeof data.baselineAssessments] && (() => {
                const result = data.baselineAssessments[activeScale.id as keyof typeof data.baselineAssessments];
                const interpretation = getAssessmentInterpretationCard(
                    activeScale.id,
                    result?.percentScore || 0,
                    result?.level
                );
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Score Summary */}
                        <div className="bg-gradient-to-r from-primary-50 to-indigo-50 p-6 rounded-[2rem] border border-primary-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm">
                                    <ClipboardList className="text-primary-600" size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-slate-900">Ditt resultat</h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${interpretation.severityBg} ${interpretation.severityColor}`}>
                                            {interpretation.severityLevel === 'minimal' ? 'Minimal påverkan' :
                                             interpretation.severityLevel === 'mild' ? 'Lätt påverkan' :
                                             interpretation.severityLevel === 'moderate' ? 'Måttlig påverkan' :
                                             'Betydande påverkan'}
                                        </span>
                                    </div>
                                    <p className="text-3xl font-extrabold text-primary-600 my-2">
                                        {result?.percentScore?.toFixed(0)}%
                                    </p>
                                    <p className="text-slate-600">
                                        {result?.interpretation}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Interpretation Card */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-primary-600" />
                                Vad innebär detta?
                            </h5>

                            <div className="space-y-4">
                                {/* What it means */}
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-xl ${interpretation.severityBg}`}>
                                        <Info className={`w-4 h-4 ${interpretation.severityColor}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Tolkning</p>
                                        <p className="text-sm text-slate-600">{interpretation.whatItMeans}</p>
                                    </div>
                                </div>

                                {/* Program implication */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-blue-100">
                                        <Target className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Programanpassning</p>
                                        <p className="text-sm text-slate-600">{interpretation.programImplication}</p>
                                    </div>
                                </div>

                                {/* Expected timeline */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-purple-100">
                                        <Calendar className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Förväntad tidsram</p>
                                        <p className="text-sm text-slate-600">{interpretation.expectedTimeline}</p>
                                    </div>
                                </div>

                                {/* Key focus areas */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-green-100">
                                        <Award className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Fokusområden</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {interpretation.keyFocus.map((focus, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                                                    {focus}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
  };

  // Step 8: SMART Goals (NEW)
  const renderStep8 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
        <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Dina Mål</h2>
            <p className="text-lg text-slate-500">Sätt konkreta och mätbara mål för din rehabilitering.</p>
        </div>

        {/* Goal Category Selection */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">
                Vad är viktigast för dig?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {GOAL_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isActive = data.smartGoal?.primaryGoal === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => updateSmartGoal('primaryGoal', cat.id)}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                isActive
                                ? 'border-primary-500 bg-primary-50 shadow-md'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <Icon size={24} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                            <span className={`text-sm font-medium text-center ${isActive ? 'text-primary-700' : 'text-slate-600'}`}>
                                {cat.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Examples based on selected category */}
            {data.smartGoal?.primaryGoal && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">
                        <strong>Exempel:</strong> {GOAL_CATEGORIES.find(c => c.id === data.smartGoal?.primaryGoal)?.examples.join(', ')}
                    </p>
                </div>
            )}
        </div>

        {/* Specific Goal */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Target size={16} /> Specifikt mål
            </label>
            <p className="text-sm text-slate-500 mb-3">Vad exakt vill du kunna göra?</p>
            <input
                type="text"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                placeholder="T.ex. Springa 5 km utan smärta"
                value={data.smartGoal?.specific || ''}
                onChange={(e) => updateSmartGoal('specific', e.target.value)}
            />
        </div>

        {/* Measurable Goal */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp size={16} /> Hur mäter du framgång?
            </label>
            <p className="text-sm text-slate-500 mb-3">Hur vet du att du nått målet?</p>
            <input
                type="text"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                placeholder="T.ex. Smärta under 3/10 efter löpning"
                value={data.smartGoal?.measurable || ''}
                onChange={(e) => updateSmartGoal('measurable', e.target.value)}
            />
        </div>

        {/* Timeframe */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                <Calendar size={16} /> Tidsram
            </label>
            <div className="flex flex-wrap gap-3">
                {TIMEFRAME_OPTIONS.map(tf => (
                    <button
                        key={tf.id}
                        onClick={() => updateSmartGoal('timeframe', tf.id)}
                        className={`px-5 py-3 rounded-xl border-2 transition-all ${
                            data.smartGoal?.timeframe === tf.id
                            ? 'border-primary-500 bg-primary-50 shadow-md'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className={`font-bold ${data.smartGoal?.timeframe === tf.id ? 'text-primary-700' : 'text-slate-700'}`}>
                            {tf.label}
                        </div>
                        <div className="text-xs text-slate-500">{tf.desc}</div>
                    </button>
                ))}
            </div>
        </div>

        {/* Goal Summary */}
        {data.smartGoal?.specific && data.smartGoal?.timeframe && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-[2rem] border border-green-200">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <Award className="text-green-600" size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-green-800 mb-2">Ditt mål</h4>
                        <p className="text-slate-700">
                            <strong>"{data.smartGoal.specific}"</strong> inom {TIMEFRAME_OPTIONS.find(t => t.id === data.smartGoal?.timeframe)?.label}.
                        </p>
                        {data.smartGoal.measurable && (
                            <p className="text-sm text-slate-600 mt-2">
                                Mätning: {data.smartGoal.measurable}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  // ============================================
  // NEW: AI-DRIVEN ASSESSMENT (Step 4)
  // ============================================

  // Load AI questions when entering step 4
  useEffect(() => {
    if (step === 4 && aiQuestions.length === 0 && !isLoadingQuestions) {
      loadAIQuestions();
    }
  }, [step]);

  const loadAIQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const questions = await generateFollowUpQuestions(data);
      setAiQuestions(questions);
    } catch (error) {
      console.error('Failed to load AI questions:', error);
      // Fallback handled by the service
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleAIAnswer = (question: FollowUpQuestion, answer: string | string[] | number) => {
    // Clear validation error when user answers
    if (validationError) {
      setValidationError(null);
    }

    const newAnswer: AIQuestionAnswer = {
      questionId: question.id,
      question: question.question,
      answer,
      answeredAt: new Date().toISOString()
    };

    setAiAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== question.id);
      return [...filtered, newAnswer];
    });
  };

  const allQuestionsAnswered = useMemo(() => {
    const requiredQuestions = aiQuestions.filter(q => q.required);
    return requiredQuestions.every(q =>
      aiAnswers.some(a => a.questionId === q.id)
    );
  }, [aiQuestions, aiAnswers]);

  // Get category label in Swedish
  const getCategoryLabel = (category?: string) => {
    const labels: Record<string, string> = {
      'pain_character': 'Smärtkaraktär',
      'function': 'Funktion',
      'history': 'Historik',
      'lifestyle': 'Livsstil',
      'kinesiophobia': 'Rörelserädsla'
    };
    return category ? labels[category] || 'Allmänt' : 'Allmänt';
  };

  // Handle going to next question with validation
  const handleNextQuestion = () => {
    // Get current question
    const currentQuestion = aiQuestions[currentAIQuestionIndex];

    // Validate required question is answered
    if (currentQuestion?.required) {
      const answer = aiAnswers.find(a => a.questionId === currentQuestion.id);
      const isAnswered = answer && (
        (Array.isArray(answer.answer) && answer.answer.length > 0) ||
        (typeof answer.answer === 'string' && answer.answer.trim().length > 0) ||
        (typeof answer.answer === 'number')
      );

      if (!isAnswered) {
        setValidationError('Vänligen svara på frågan innan du fortsätter');
        // Auto-clear error after 3 seconds
        setTimeout(() => setValidationError(null), 3000);
        return;
      }
    }

    // Clear any previous error
    setValidationError(null);

    if (currentAIQuestionIndex < aiQuestions.length - 1) {
      setCurrentAIQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered - show summary
      setShowAISummary(true);
      // Generate summary points
      const points = aiAnswers.map(a => {
        const q = aiQuestions.find(q => q.id === a.questionId);
        const answerText = Array.isArray(a.answer) ? a.answer.join(', ') : String(a.answer);
        return `${q?.question?.replace('?', '')}: ${answerText}`;
      });
      setSummaryPoints(points);
    }
  };

  // Handle going back to previous question
  const handlePrevQuestion = () => {
    if (showAISummary) {
      setShowAISummary(false);
    } else if (currentAIQuestionIndex > 0) {
      setCurrentAIQuestionIndex(prev => prev - 1);
    }
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = useMemo(() => {
    if (aiQuestions.length === 0) return false;
    const currentQ = aiQuestions[currentAIQuestionIndex];
    if (!currentQ) return false;
    const answer = aiAnswers.find(a => a.questionId === currentQ.id);
    if (!answer) return false;
    if (Array.isArray(answer.answer)) return answer.answer.length > 0;
    if (typeof answer.answer === 'string') return answer.answer.trim().length > 0;
    return answer.answer !== undefined;
  }, [aiQuestions, aiAnswers, currentAIQuestionIndex]);

  // Loading messages for better UX
  useEffect(() => {
    if (isLoadingQuestions) {
      const messages = [
        'Analyserar din situation...',
        'Förbereder relevanta frågor...',
        'Anpassar bedömningen...',
        'Nästan klart...'
      ];
      let idx = 0;
      const interval = setInterval(() => {
        idx = (idx + 1) % messages.length;
        setLoadingMessage(messages[idx]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoadingQuestions]);

  const renderAIAssessment = () => {
    // Loading state with progressive messages
    if (isLoadingQuestions) {
      return (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Brain size={18} />
              AI-Driven Bedömning
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary-100 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-600 rounded-full animate-spin" />
              <Brain className="absolute inset-0 m-auto text-primary-600" size={28} />
            </div>
            <div className="text-center space-y-2">
              <p className="text-slate-700 font-medium animate-pulse">{loadingMessage}</p>
              <p className="text-sm text-slate-400">Detta tar bara några sekunder</p>
            </div>
          </div>
        </div>
      );
    }

    // AI Summary screen
    if (showAISummary) {
      return (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              <CheckCircle2 size={18} />
              Sammanfattning
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Så här förstår jag din situation
            </h3>
            <p className="text-slate-500">
              Kontrollera att informationen stämmer innan vi går vidare.
            </p>
          </div>

          {/* Summary card */}
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="space-y-4">
              {/* Basic info */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{data.name || 'Patient'}, {data.age} år</p>
                  <p className="text-sm text-slate-500">{data.injuryLocation} • {data.injuryType}</p>
                </div>
              </div>

              {/* AI answers summary */}
              <div className="space-y-3">
                {summaryPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700 text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons - larger touch targets */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAISummary(false);
                setCurrentAIQuestionIndex(0);
              }}
              className="flex-1 py-4 px-4 min-h-[52px] rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ChevronLeft size={20} />
              Ändra svar
            </button>
            <button
              onClick={handleNext}
              className="flex-[1.5] py-4 px-4 min-h-[52px] rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Ja, stämmer!
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      );
    }

    // No questions yet
    if (aiQuestions.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-500">Inga frågor kunde genereras. Klicka på Nästa för att fortsätta.</p>
        </div>
      );
    }

    // Bounds protection - ensure index is valid
    const safeIndex = Math.min(currentAIQuestionIndex, aiQuestions.length - 1);
    const currentQuestion = aiQuestions[safeIndex];

    // Safety check - if no current question, show summary
    if (!currentQuestion) {
      setShowAISummary(true);
      return null;
    }

    // Progressive question display - one at a time
    const progress = ((safeIndex + 1) / aiQuestions.length) * 100;

    return (
      <div className="space-y-6" role="form" aria-label="AI-driven bedömning">
        {/* Header with progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-medium">
              <Brain size={14} aria-hidden="true" />
              AI-Driven Bedömning
            </div>
            <span className="text-sm text-slate-500" aria-live="polite">
              Fråga {safeIndex + 1} av {aiQuestions.length}
            </span>
          </div>

          {/* Progress bar with ARIA */}
          <div
            className="relative h-2 bg-slate-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={safeIndex + 1}
            aria-valuemin={1}
            aria-valuemax={aiQuestions.length}
            aria-label={`Framsteg: fråga ${safeIndex + 1} av ${aiQuestions.length}`}
          >
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Category badge */}
          {currentQuestion.category && (
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                <Info size={12} />
                {getCategoryLabel(currentQuestion.category)}
              </span>
            </div>
          )}
        </div>

        {/* Question card with animation */}
        <div
          key={currentQuestion.id}
          className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 transform transition-all duration-300 animate-fadeIn"
          style={{
            animation: 'fadeSlideIn 0.3s ease-out'
          }}
        >
          <p className="text-xl font-medium text-slate-900 text-center mb-8">
            {currentQuestion.question}
          </p>

          {/* Single choice */}
          {currentQuestion.type === 'single_choice' && currentQuestion.options && (
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {currentQuestion.options.map(option => {
                const isSelected = aiAnswers.find(a => a.questionId === currentQuestion.id)?.answer === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleAIAnswer(currentQuestion, option)}
                    className={`p-4 min-h-[52px] rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md shadow-primary-100'
                        : 'border-slate-200 hover:border-primary-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        isSelected ? 'border-primary-500 bg-primary-500' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Yes/No */}
          {currentQuestion.type === 'yes_no' && (
            <div className="flex gap-4 justify-center">
              {['Ja', 'Nej'].map(option => {
                const isSelected = aiAnswers.find(a => a.questionId === currentQuestion.id)?.answer === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleAIAnswer(currentQuestion, option)}
                    className={`px-10 sm:px-12 py-4 min-h-[56px] min-w-[100px] rounded-xl border-2 font-medium text-lg transition-all duration-200 active:scale-[0.98] ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md shadow-primary-100'
                        : 'border-slate-200 hover:border-primary-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Multiple choice */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              {currentQuestion.options.map(option => {
                const currentAnswers = aiAnswers.find(a => a.questionId === currentQuestion.id)?.answer as string[] || [];
                const isSelected = currentAnswers.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => {
                      const newAnswers = isSelected
                        ? currentAnswers.filter(a => a !== option)
                        : [...currentAnswers, option];
                      handleAIAnswer(currentQuestion, newAnswers);
                    }}
                    className={`p-4 min-h-[52px] rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 active:scale-[0.98] ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 hover:border-primary-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      isSelected ? 'border-primary-500 bg-primary-500' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <span className="font-medium">{option}</span>
                  </button>
                );
              })}
              <p className="col-span-full text-center text-sm text-slate-400 mt-2">
                Välj ett eller flera alternativ
              </p>
            </div>
          )}

          {/* Text input */}
          {currentQuestion.type === 'text' && (
            <div className="max-w-md mx-auto">
              <textarea
                value={(aiAnswers.find(a => a.questionId === currentQuestion.id)?.answer as string) || ''}
                onChange={(e) => handleAIAnswer(currentQuestion, e.target.value)}
                placeholder="Skriv ditt svar här..."
                className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:ring-0 transition-colors resize-none text-lg"
                rows={4}
              />
            </div>
          )}

          {/* Slider */}
          {currentQuestion.type === 'slider' && currentQuestion.sliderConfig && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold text-primary-600">
                  {(aiAnswers.find(a => a.questionId === currentQuestion.id)?.answer as number) || currentQuestion.sliderConfig.min}
                </span>
              </div>
              <input
                type="range"
                min={currentQuestion.sliderConfig.min}
                max={currentQuestion.sliderConfig.max}
                step={currentQuestion.sliderConfig.step}
                value={(aiAnswers.find(a => a.questionId === currentQuestion.id)?.answer as number) || currentQuestion.sliderConfig.min}
                onChange={(e) => handleAIAnswer(currentQuestion, parseInt(e.target.value))}
                className="w-full h-3 accent-primary-600 cursor-pointer"
              />
              <div className="flex justify-between text-sm text-slate-500">
                <span>{currentQuestion.sliderConfig.labels?.min || currentQuestion.sliderConfig.min}</span>
                <span>{currentQuestion.sliderConfig.labels?.max || currentQuestion.sliderConfig.max}</span>
              </div>
            </div>
          )}
        </div>

        {/* Validation error message */}
        {validationError && (
          <div
            role="alert"
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fadeIn"
          >
            <AlertTriangle size={16} className="flex-shrink-0" aria-hidden="true" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Navigation buttons - sticky on mobile */}
        <div className="flex gap-3 pt-4 sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pb-2 -mb-4 sm:relative sm:bg-transparent sm:pb-0 sm:mb-0">
          <button
            onClick={handlePrevQuestion}
            disabled={safeIndex === 0}
            aria-label="Föregående fråga"
            className={`flex-1 py-4 px-4 min-h-[52px] rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
              safeIndex === 0
                ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ChevronLeft size={20} aria-hidden="true" />
            <span className="hidden sm:inline">Tillbaka</span>
          </button>
          <button
            onClick={handleNextQuestion}
            aria-label={safeIndex === aiQuestions.length - 1 ? 'Visa sammanfattning' : 'Nästa fråga'}
            className={`flex-[2] py-4 px-4 min-h-[52px] rounded-xl font-medium transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
              !isCurrentQuestionAnswered && currentQuestion.required
                ? 'bg-primary-400 text-white/80'
                : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25'
            }`}
          >
            {safeIndex === aiQuestions.length - 1 ? 'Visa sammanfattning' : 'Nästa'}
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Question dots indicator - larger touch targets */}
        <nav className="flex justify-center gap-1 pt-4 sm:pt-2" aria-label="Frågenavigation">
          {aiQuestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentAIQuestionIndex(idx)}
              aria-label={`Gå till fråga ${idx + 1}`}
              aria-current={idx === safeIndex ? 'step' : undefined}
              className="p-2 -m-1"
            >
              <div className={`rounded-full transition-all ${
                idx === safeIndex
                  ? 'bg-primary-500 w-6 h-3'
                  : idx < safeIndex
                    ? 'bg-primary-300 w-3 h-3'
                    : 'bg-slate-200 w-3 h-3'
              }`} />
            </button>
          ))}
        </nav>
      </div>
    );
  };

  // ============================================
  // NEW: SIMPLIFIED GOALS STEP (Step 5)
  // ============================================

  const renderGoalsStep = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
          <Target size={18} />
          Dina Mål
        </div>
        <h3 className="text-2xl font-bold text-slate-900">
          Vad vill du uppnå?
        </h3>
        <p className="text-slate-500">
          Beskriv kort vad du vill kunna göra när rehabiliteringen är klar.
        </p>
      </div>

      {/* Main goal input */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Mitt huvudmål:</span>
          <textarea
            value={data.smartGoal?.specific || data.goals || ''}
            onChange={(e) => {
              setData(prev => ({
                ...prev,
                goals: e.target.value,
                smartGoal: {
                  ...prev.smartGoal!,
                  specific: e.target.value
                }
              }));
            }}
            placeholder="T.ex. 'Kunna springa 5 km utan smärta' eller 'Sitta vid skrivbordet en hel arbetsdag'"
            className="mt-2 w-full p-4 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:ring-0 transition-colors resize-none"
            rows={3}
          />
        </label>
      </div>

      {/* Timeframe selection */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <span className="text-sm font-medium text-slate-700">När vill du uppnå detta?</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {TIMEFRAME_OPTIONS.map(tf => (
            <button
              key={tf.id}
              onClick={() => setData(prev => ({
                ...prev,
                smartGoal: { ...prev.smartGoal!, timeframe: tf.id }
              }))}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                data.smartGoal?.timeframe === tf.id
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`font-bold ${data.smartGoal?.timeframe === tf.id ? 'text-primary-700' : 'text-slate-700'}`}>
                {tf.label}
              </div>
              <div className="text-xs text-slate-500">{tf.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary before analysis */}
      {(data.smartGoal?.specific || data.goals) && data.smartGoal?.timeframe && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Award className="text-green-600" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-green-800 mb-2">Redo för din personliga plan!</h4>
              <p className="text-slate-700">
                <strong>Mål:</strong> "{data.smartGoal?.specific || data.goals}"
              </p>
              <p className="text-sm text-slate-600 mt-1">
                <strong>Tidsram:</strong> {TIMEFRAME_OPTIONS.find(t => t.id === data.smartGoal?.timeframe)?.label}
              </p>
              <p className="text-sm text-green-600 mt-3">
                Klicka på "Skapa Min Plan" för att få en AI-genererad rehabiliteringsplan baserad på dina svar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Step names for header (5 steps)
  const stepNames: Record<number, string> = {
    1: 'Profil',
    2: 'Skada',
    3: 'Säkerhet',
    4: 'AI-Bedömning',
    5: 'Mål'
  };

  return (
    <>
      {/* Inject animation styles */}
      <style>{onboardingStyles}</style>

      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white flex flex-col min-h-[750px] relative overflow-hidden">
        {/* Progress Header */}
        <div className="bg-white/50 border-b border-slate-100 p-8 z-10">
            <div className="flex justify-between items-end mb-4">
                 <div className="space-y-1">
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-md">Steg {step} av {TOTAL_STEPS}</span>
                    <h2 className="text-xl font-bold text-slate-900">
                        {stepNames[step] || 'Steg'}
                    </h2>
                 </div>
                 <div className="hidden sm:flex gap-1">
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${
                                getSkippedSteps.has(i)
                                    ? 'bg-slate-100 ring-1 ring-slate-200'  // Skipped steps
                                    : i <= step
                                        ? 'bg-primary-600'  // Completed steps
                                        : 'bg-slate-200'    // Future steps
                            }`}
                            title={getSkippedSteps.has(i) ? getSkipReason(i) || 'Hoppas över' : undefined}
                        ></div>
                    ))}
                 </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${(getCurrentPosition() / actualStepCount) * 100}%` }}
                ></div>
            </div>
            {/* Steg-räknare som visar faktiskt antal */}
            <div className="text-xs text-slate-400 mt-1 text-right">
                Steg {getCurrentPosition()} av {actualStepCount}
                {getSkippedSteps.size > 0 && (
                    <span className="ml-2 text-blue-500">({getSkippedSteps.size} steg hoppas över)</span>
                )}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar">
            {/* Feedback för skippade steg */}
            {lastSkippedStep && getSkipReason(lastSkippedStep) && (
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-500">
                    <p className="text-blue-700 text-sm flex items-center gap-2">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        {getSkipReason(lastSkippedStep)}
                    </p>
                </div>
            )}

            {/* Realtids-insikter */}
            {getStepInsight() && (
                <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-500">
                    <p className="text-amber-700 text-sm flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 flex-shrink-0" />
                        {getStepInsight()}
                    </p>
                </div>
            )}

            {/* Smärtmönster-analys (steg 6) */}
            {getPainPatternAnalysis() && (
                <div className={`mb-6 border-l-4 p-4 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-500 ${
                    getPainPatternAnalysis()?.color === 'blue' ? 'bg-blue-50 border-blue-400' :
                    getPainPatternAnalysis()?.color === 'green' ? 'bg-green-50 border-green-400' :
                    getPainPatternAnalysis()?.color === 'purple' ? 'bg-purple-50 border-purple-400' :
                    'bg-orange-50 border-orange-400'
                }`}>
                    <div className="flex items-start gap-3">
                        <Activity className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            getPainPatternAnalysis()?.color === 'blue' ? 'text-blue-600' :
                            getPainPatternAnalysis()?.color === 'green' ? 'text-green-600' :
                            getPainPatternAnalysis()?.color === 'purple' ? 'text-purple-600' :
                            'text-orange-600'
                        }`} />
                        <div>
                            <p className={`font-medium text-sm ${
                                getPainPatternAnalysis()?.color === 'blue' ? 'text-blue-800' :
                                getPainPatternAnalysis()?.color === 'green' ? 'text-green-800' :
                                getPainPatternAnalysis()?.color === 'purple' ? 'text-purple-800' :
                                'text-orange-800'
                            }`}>
                                {getPainPatternAnalysis()?.type}
                            </p>
                            <p className={`text-sm mt-1 ${
                                getPainPatternAnalysis()?.color === 'blue' ? 'text-blue-700' :
                                getPainPatternAnalysis()?.color === 'green' ? 'text-green-700' :
                                getPainPatternAnalysis()?.color === 'purple' ? 'text-purple-700' :
                                'text-orange-700'
                            }`}>
                                {getPainPatternAnalysis()?.recommendation}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderAIAssessment()}
            {step === 5 && renderGoalsStep()}
        </div>

        {/* Action Bar - Sticky on mobile */}
        <div className="p-4 sm:p-8 border-t border-slate-100 bg-white/95 backdrop-blur-sm flex justify-between items-center z-10 sticky bottom-0 sm:relative">
            <button
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 min-h-[48px] rounded-2xl font-bold text-sm transition-all active:scale-[0.97] ${step > 1 ? 'text-slate-600 hover:bg-slate-100' : 'opacity-0 cursor-default'}`}
            >
                <ChevronLeft size={18} /> <span className="hidden sm:inline">Tillbaka</span>
            </button>

            {step < TOTAL_STEPS ? (
                <button
                    onClick={handleNext}
                    disabled={step === 1 && !data.name}
                    className="flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-4 min-h-[48px] bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    Nästa <ChevronRight size={18} />
                </button>
            ) : (
                <button
                    onClick={() => {
                        // Show ROM offer if not already done or declined
                        if (!romBaseline && !romDeclined) {
                            setShowROMOffer(true);
                            return;
                        }
                        // Include AI assessment data in the submission
                        const updatedData: UserAssessment = {
                            ...data,
                            goals: data.smartGoal?.specific || data.goals,
                            baselineROM: romBaseline || undefined,
                            // Store AI assessment answers
                            aiAssessment: {
                                questions: aiAnswers.map(a => ({
                                  id: a.questionId,
                                  question: a.question,
                                  answer: a.answer
                                })),
                                completedAt: new Date().toISOString()
                            }
                        };
                        onSubmit(updatedData);
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-3 px-6 sm:px-10 py-3 sm:py-4 min-h-[48px] bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 transition-all active:scale-[0.97] group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <span className="tracking-wide">{isLoading ? 'Genererar...' : 'Skapa Min Plan'}</span>
                    <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors"><CheckCircle2 size={18} /></div>
                </button>
            )}
        </div>
      </div>

      {/* ROM Offer Modal - Optional camera-based measurement */}
      {showROMOffer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pulse className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Vill du mäta din rörlighet?
              </h3>
              <p className="text-slate-600 mb-6">
                Med kameran kan vi mäta din nuvarande rörlighet och följa dina framsteg över tid.
                Detta är helt valfritt och tar cirka 2-3 minuter.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowROMOffer(false);
                    setShowROMAssessment(true);
                  }}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Scan className="w-5 h-5" />
                  Ja, mät min rörlighet
                </button>
                <button
                  onClick={() => {
                    setShowROMOffer(false);
                    setRomDeclined(true);
                    // Proceed with submission
                    const updatedData: UserAssessment = {
                      ...data,
                      goals: data.smartGoal?.specific || data.goals,
                      aiAssessment: {
                        questions: aiAnswers.map(a => ({
                          id: a.questionId,
                          question: a.question,
                          answer: a.answer
                        })),
                        completedAt: new Date().toISOString()
                      }
                    };
                    onSubmit(updatedData);
                  }}
                  className="w-full py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                >
                  Nej tack, hoppa över
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-4">
                Du kan alltid göra detta senare i appen
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ROM Assessment Component */}
      {showROMAssessment && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Laddar rörlighetsmätning...</p>
            </div>
          </div>
        }>
          <ROMAssessment
            patientAge={data.age}
            injuryLocation={data.injuryLocation}
            onComplete={(baseline) => {
              setRomBaseline(baseline);
              setShowROMAssessment(false);
              // Proceed with submission including ROM data
              const updatedData: UserAssessment = {
                ...data,
                goals: data.smartGoal?.specific || data.goals,
                baselineROM: baseline,
                aiAssessment: {
                  questions: aiAnswers.map(a => ({
                    id: a.questionId,
                    question: a.question,
                    answer: a.answer
                  })),
                  completedAt: new Date().toISOString()
                }
              };
              onSubmit(updatedData);
            }}
            onSkip={() => {
              setShowROMAssessment(false);
              setRomDeclined(true);
              // Proceed with submission without ROM
              const updatedData: UserAssessment = {
                ...data,
                goals: data.smartGoal?.specific || data.goals,
                aiAssessment: {
                  questions: aiAnswers.map(a => ({
                    id: a.questionId,
                    question: a.question,
                    answer: a.answer
                  })),
                  completedAt: new Date().toISOString()
                }
              };
              onSubmit(updatedData);
            }}
          />
        </Suspense>
      )}
    </>
  );
};

export default Onboarding;