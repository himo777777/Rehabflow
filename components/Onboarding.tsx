import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { UserAssessment, InjuryType } from '../types';
import {
  User, ShieldCheck,
  Activity as Pulse, Zap, Target,
  Smile, Meh, Frown,
  ChevronLeft, ChevronRight, CheckCircle2,
  ZoomIn, ZoomOut, Rotate3d, Scan, MousePointer2,
  Moon, Brain, Briefcase, AlertTriangle, Stethoscope,
  Flame, Activity, Siren, MessageSquare, Info, Move3d, Undo2,
  Thermometer, Hammer, Wind, Cigarette
} from 'lucide-react';

// Lazy load the 3D skeleton component for better performance
const RealisticSkeleton3D = lazy(() => import('./RealisticSkeleton3D'));

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

const Onboarding: React.FC<OnboardingProps> = ({ onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<UserAssessment>({
    name: '', age: 30, injuryLocation: '', injuryType: InjuryType.ACUTE, symptoms: [], painLevel: 3, activityPainLevel: 5, goals: '', activityLevel: 'Måttlig',
    specificAnswers: {},
    redFlags: [],
    painCharacter: 'molande',
    functionalLimitations: [],
    lifestyle: { sleep: 'Okej', stress: 'Medel', fearAvoidance: false, workload: 'Stillasittande' },
    additionalInfo: ''
  });

  const [customBodyPart, setCustomBodyPart] = useState('');
  const [showCustomBodyInput, setShowCustomBodyInput] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
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
          <p className="text-lg text-slate-500">Använd 3D-scannern för att markera exakt område.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 items-center xl:items-start">
        <div className="w-full max-w-[450px] flex justify-center order-2 xl:order-1">
            <Suspense fallback={
              <div className="w-full h-[550px] bg-black rounded-[2rem] flex items-center justify-center">
                <div className="text-white/50 text-sm font-medium animate-pulse">Laddar 3D-modell...</div>
              </div>
            }>
              <RealisticSkeleton3D
                selected={data.injuryLocation}
                onSelect={(part) => { updateData('injuryLocation', part); setShowCustomBodyInput(false); }}
              />
            </Suspense>
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
                            className={`p-5 text-left rounded-2xl border transition-all relative overflow-hidden group ${data.injuryType === type ? 'bg-slate-900 border-slate-900 shadow-lg scale-[1.01]' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
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
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${active ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
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
                                className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all border ${isChecked ? 'bg-red-500 text-white border-red-600 shadow-md' : 'bg-white text-slate-700 border-red-100 hover:bg-red-50/50'}`}
                            >
                                <div className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${isChecked ? 'bg-white border-white text-red-500' : 'bg-white border-red-200'}`}>
                                    {isChecked && <CheckCircle2 size={16} />}
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
                                    className={`px-5 py-4 rounded-xl text-sm font-medium text-left transition-all border relative overflow-hidden group ${
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

  return (
    <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white flex flex-col min-h-[750px] relative overflow-hidden">
        {/* Progress Header */}
        <div className="bg-white/50 border-b border-slate-100 p-8 z-10">
            <div className="flex justify-between items-end mb-4">
                 <div className="space-y-1">
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-md">Steg {step} av 5</span>
                    <h2 className="text-xl font-bold text-slate-900">
                        {step === 1 ? 'Profil' : 
                         step === 2 ? 'Skada' : 
                         step === 3 ? 'Säkerhet' : 
                         step === 4 ? 'Klinik' : 
                         'Livsstil'}
                    </h2>
                 </div>
                 <div className="hidden sm:flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
                    ))}
                 </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${(step / 5) * 100}%` }}></div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
        </div>

        {/* Action Bar */}
        <div className="p-8 border-t border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-center z-10">
            <button 
                onClick={handleBack} 
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${step > 1 ? 'text-slate-600 hover:bg-slate-100' : 'opacity-0 cursor-default'}`}
            >
                <ChevronLeft size={18} /> Tillbaka
            </button>

            {step < 5 ? (
                <button 
                    onClick={handleNext} 
                    disabled={step === 1 && !data.name} 
                    className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    Nästa <ChevronRight size={18} />
                </button>
            ) : (
                <button 
                    onClick={() => onSubmit(data)} 
                    className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 transition-all group"
                >
                    <span className="tracking-wide">Generera Program</span> 
                    <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors"><CheckCircle2 size={18} /></div>
                </button>
            )}
        </div>
    </div>
  );
};

export default Onboarding;