
import React, { useState, useRef, useEffect } from 'react';
import { UserAssessment, InjuryType } from '../types';
import { 
  User, ShieldCheck, 
  Activity as Pulse, Zap, Target, 
  Smile, Meh, Frown,
  ChevronLeft, ChevronRight, CheckCircle2,
  ZoomIn, ZoomOut, Rotate3d, Scan, MousePointer2,
  Moon, Brain, Briefcase, AlertTriangle, Stethoscope,
  Flame, Activity, Siren, MessageSquare, Info, Move3d, Undo2
} from 'lucide-react';

interface OnboardingProps {
  onSubmit: (assessment: UserAssessment) => void;
  isLoading: boolean;
}

const INJURY_DESCRIPTIONS: Record<string, string> = {
  [InjuryType.ACUTE]: "Plötslig skada (t.ex. vrickning, sträckning)",
  [InjuryType.CHRONIC]: "Långvarig smärta (>3 mån) eller återkommande",
  [InjuryType.POST_OP]: "Rehabilitering efter operation",
  [InjuryType.PREHAB]: "Förebyggande träning"
};

const BODY_PART_SYMPTOMS: Record<string, string> = {
    'Nacke': 'Vanligt vid nackspärr, whiplash eller "gamnacke" (mobilanvändande).',
    'Axlar': 'Kan indikera impingement, rotatorcuff-skador eller frusen axel.',
    'Bröstrygg': 'Ofta kopplat till hållning, låsningar eller stress.',
    'Armbåge': 'T.ex. tennisarmbåge (utsida) eller golfarmbåge (insida).',
    'Handled': 'Kan vara karpaltunnelsyndrom eller överbelastning vid datorarbete.',
    'Ländrygg': 'Vanligt vid ryggskott, diskbråck eller ischias-känningar.',
    'Ljumskar': 'Ofta sträckningar vid idrott eller höftledsproblematik.',
    'Säte': 'Kan vara piriformis-syndrom eller smärta från höftleden.',
    'Lår (Bak)': 'Hamstringsbristningar är vanliga här vid löpning/sprint.',
    'Knä': 'Hopparknä, löparknä, menisk eller ledbandsskador.',
    'Underben': 'Benhinneproblem eller stressfrakturer.',
    'Vad': 'Gubbvad (bristning) eller kramp är vanligt här.',
    'Häl': 'Hälsporre (Plantar fasciit) eller hälseneinflammation.',
    'Fot': 'Stukningar eller nedsjunkna fotvalv.'
};

const RED_FLAGS: Record<string, string[]> = {
    'Ländrygg': [
        'Har du tappat känseln i underlivet/ljumskarna?',
        'Har du svårt att hålla tätt (urin/avföring)?',
        'Har du plötslig svaghet i båda benen?'
    ],
    'Nacke': [
        'Har du svårt att prata eller svälja?',
        'Har du domningar runt munnen?',
        'Har du svimmat i samband med huvudvridning?'
    ],
    'Generic': [
        'Har du feber eller allmän sjukdomskänsla?',
        'Har du oförklarlig viktnedgång?',
        'Är smärtan konstant och opåverkbar av läge?',
        'Har du haft cancer tidigare?'
    ]
};

const BODY_SPECIFIC_QUESTIONS: Record<string, { id: string, label: string, options: string[] }[]> = {
    'Knä': [
        { id: 'stairs', label: 'Hur känns det att gå i trappor?', options: ['Inga problem', 'Smärta nerför', 'Smärta uppför', 'Smärta både upp/ner'] },
        { id: 'locking', label: 'Upplever du låsningar eller att knät "viker sig"?', options: ['Nej', 'Ja, låsningar', 'Ja, viker sig', 'Båda'] },
        { id: 'swelling', label: 'Svullnar knät upp efter aktivitet?', options: ['Nej', 'Lite grann', 'Ja, tydligt'] }
    ],
    'Ländrygg': [
        { id: 'radiation', label: 'Strålar smärtan ner i benen?', options: ['Nej', 'Ja, till skinkan', 'Ja, nedanför knät'] },
        { id: 'movement', label: 'Vad förvärrar smärtan?', options: ['Sitta stilla', 'Stå/Gå', 'Framåtböjning', 'Bakåtböjning'] },
        { id: 'morning', label: 'Hur känns ryggen på morgonen?', options: ['Bra', 'Lite stel (<30 min)', 'Mycket stel (>60 min)'] }
    ],
    'Axlar': [
        { id: 'overhead', label: 'Kan du lyfta armen över huvudet?', options: ['Ja, smärtfritt', 'Ja, men det gör ont', 'Nej, det tar stopp'] },
        { id: 'night', label: 'Vaknar du av smärta om du ligger på axeln?', options: ['Nej', 'Ibland', 'Ja, ofta'] },
        { id: 'instability', label: 'Känns axeln "lös" eller instabil?', options: ['Nej', 'Lite', 'Ja, mycket'] }
    ],
    'Nacke': [
        { id: 'headache', label: 'Har du huvudvärk kopplat till nacken?', options: ['Nej', 'Ibland (Spänningshuvudvärk)', 'Ja, ofta'] },
        { id: 'driving', label: 'Gör det ont att vrida på huvudet (t.ex. vid bilkörning)?', options: ['Nej', 'Lite stelt', 'Ja, smärtsamt'] }
    ],
    'Fot': [
        { id: 'morning_steps', label: 'Gör de första stegen på morgonen ont?', options: ['Nej', 'Ja, under hälen', 'Ja, i senan'] },
        { id: 'load', label: 'När gör det mest ont?', options: ['Vid frånskjut', 'Vid landning', 'I vila'] }
    ],
    'Häl': [
        { id: 'morning_steps', label: 'Gör de första stegen på morgonen ont?', options: ['Nej', 'Ja, under hälen', 'Ja, i senan'] },
        { id: 'stiffness', label: 'Är hälsenan stel?', options: ['Nej', 'Ja, på morgonen', 'Ja, hela tiden'] }
    ],
    'Säte': [
        { id: 'sitting', label: 'Gör det ont att sitta länge?', options: ['Nej', 'Ja, djupt i sätet', 'Ja, strålar ner i benet'] },
        { id: 'crossing', label: 'Gör det ont att korsa benen?', options: ['Nej', 'Ja, stramar', 'Ja, smärta'] }
    ],
    'Ljumskar': [
        { id: 'kick', label: 'Gör det ont att föra benet inåt (t.ex. sparka boll)?', options: ['Nej', 'Ja'] },
        { id: 'stiffness', label: 'Känner du stelhet på morgonen?', options: ['Nej', 'Lite', 'Ja, mycket'] }
    ],
    'Armbåge': [
         { id: 'grip', label: 'Gör det ont att greppa saker hårt?', options: ['Nej', 'Ja, utsidan', 'Ja, insidan'] },
         { id: 'mouse', label: 'Gör det ont vid datorarbete?', options: ['Nej', 'Ja'] }
    ],
     'Handled': [
         { id: 'support', label: 'Gör det ont att stödja på handen (t.ex. armhävning)?', options: ['Nej', 'Ja', 'Omöjligt'] },
         { id: 'numbness', label: 'Domnar fingrarna?', options: ['Nej', 'Ja, tumme/pekfinger', 'Ja, lillfinger'] }
    ]
};

const GENERIC_QUESTIONS = [
    { id: 'load', label: 'När gör det mest ont?', options: ['I vila', 'Vid belastning', 'Efter aktivitet', 'Hela tiden'] },
    { id: 'stiffness', label: 'Upplever du stelhet?', options: ['Ingen', 'På morgonen', 'Efter stillasittande', 'Konstant'] }
];

// --- HOLOGRAPHIC 3D BODY SCANNER ---
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
                className={`relative h-[550px] w-full max-w-[380px] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/40 border border-slate-700/50 group select-none ring-4 ring-slate-100 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                {/* Holographic Effects */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                <div className="absolute top-0 w-full h-1 bg-cyan-400/50 blur-md animate-[scan_4s_ease-in-out_infinite] z-20 pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-900/20 to-slate-900 pointer-events-none z-10"></div>
                
                {/* 3D Tools UI */}
                <div className="absolute top-6 right-6 z-30 flex flex-col gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.2, 2.5)); }} className="p-2.5 bg-slate-800/90 text-cyan-400 rounded-xl hover:bg-slate-700 border border-slate-600 backdrop-blur-md shadow-lg active:scale-95 transition-all" title="Zooma in"><ZoomIn size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.2, 0.6)); }} className="p-2.5 bg-slate-800/90 text-cyan-400 rounded-xl hover:bg-slate-700 border border-slate-600 backdrop-blur-md shadow-lg active:scale-95 transition-all" title="Zooma ut"><ZoomOut size={18} /></button>
                </div>
                
                <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
                     <button onClick={(e) => { e.stopPropagation(); snapToView('front'); }} className={`px-3 py-2 text-xs font-bold rounded-xl border backdrop-blur-md transition-all ${!isBackView ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800/90 text-slate-400 border-slate-600 hover:text-cyan-400'}`}>Framsida</button>
                     <button onClick={(e) => { e.stopPropagation(); snapToView('back'); }} className={`px-3 py-2 text-xs font-bold rounded-xl border backdrop-blur-md transition-all ${isBackView ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800/90 text-slate-400 border-slate-600 hover:text-cyan-400'}`}>Baksida</button>
                </div>

                {/* Info HUD */}
                {selected && infoText && (
                    <div className="absolute bottom-6 left-6 right-6 z-40 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 pointer-events-none">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-cyan-900/50 rounded-lg text-cyan-400 mt-1">
                                <Info size={16} />
                            </div>
                            <div>
                                <h4 className="text-cyan-50 font-bold text-sm mb-1 uppercase tracking-wide">{selected}</h4>
                                <p className="text-cyan-100/70 text-xs leading-relaxed">{infoText}</p>
                            </div>
                        </div>
                    </div>
                )}

                {!hasInteracted && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 text-cyan-300 pointer-events-none animate-pulse opacity-80">
                        <Move3d size={40} />
                        <span className="font-bold tracking-widest text-sm uppercase bg-slate-900/50 px-3 py-1 rounded-full backdrop-blur-sm">Dra för att rotera</span>
                    </div>
                )}

                {/* 3D Scene */}
                <div 
                    className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out will-change-transform cursor-grab active:cursor-grabbing"
                    style={{ perspective: '1000px', transform: `scale(${zoom})` }}
                >
                    <div className="relative w-[240px] h-[500px]" style={{ transformStyle: 'preserve-3d', transform: `rotateY(${rotation}deg)` }}>
                        
                        {/* FRONT SKELETON - ANATOMICAL VECTOR */}
                        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                             <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                <defs>
                                    <linearGradient id="boneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                                        <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <g fill="url(#boneGradient)" stroke="#0ea5e9" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)">
                                    {/* Skull */}
                                    <path d="M75,20 C75,5 125,5 125,20 C125,45 110,60 100,65 C90,60 75,45 75,20 Z" />
                                    <path d="M90,35 A5,5 0 1,1 90,45" fill="none" opacity="0.5"/>
                                    <path d="M110,35 A5,5 0 1,1 110,45" fill="none" opacity="0.5"/>
                                    
                                    {/* Spine Cervical */}
                                    <path d="M96,65 L96,80 L104,80 L104,65" strokeWidth="0.5"/>
                                    
                                    {/* Clavicles */}
                                    <path d="M100,80 C120,75 140,80 155,85" fill="none" strokeWidth="2" />
                                    <path d="M100,80 C80,75 60,80 45,85" fill="none" strokeWidth="2" />

                                    {/* Sternum & Ribs */}
                                    <path d="M95,85 L105,85 L102,120 L98,120 Z" />
                                    <path d="M98,90 C80,95 70,110 75,130" fill="none" />
                                    <path d="M102,90 C120,95 130,110 125,130" fill="none" />
                                    <path d="M98,100 C80,105 75,120 80,135" fill="none" />
                                    <path d="M102,100 C120,105 125,120 120,135" fill="none" />
                                    
                                    {/* Spine Lumbar */}
                                    <rect x="94" y="120" width="12" height="30" rx="3" />

                                    {/* Pelvis */}
                                    <path d="M70,150 C60,140 140,140 130,150 C140,165 120,175 100,180 C80,175 60,165 70,150" />

                                    {/* Arms */}
                                    {/* Humerus */}
                                    <path d="M45,85 C40,90 35,130 40,145" strokeWidth="4" fill="none"/> 
                                    <path d="M155,85 C160,90 165,130 160,145" strokeWidth="4" fill="none"/>
                                    {/* Radius/Ulna */}
                                    <path d="M40,145 C35,160 30,190 25,200" strokeWidth="3" fill="none"/>
                                    <path d="M160,145 C165,160 170,190 175,200" strokeWidth="3" fill="none"/>
                                    
                                    {/* Hands */}
                                    <path d="M25,200 L20,215" strokeWidth="2" />
                                    <path d="M175,200 L180,215" strokeWidth="2" />

                                    {/* Legs */}
                                    {/* Femur */}
                                    <path d="M80,170 C75,200 70,240 75,260" strokeWidth="5" fill="none"/>
                                    <path d="M120,170 C125,200 130,240 125,260" strokeWidth="5" fill="none"/>
                                    
                                    {/* Patella */}
                                    <circle cx="75" cy="260" r="6" fill="#0ea5e9" />
                                    <circle cx="125" cy="260" r="6" fill="#0ea5e9" />
                                    
                                    {/* Tibia/Fibula */}
                                    <path d="M75,260 C70,290 70,330 72,360" strokeWidth="4" fill="none"/>
                                    <path d="M125,260 C130,290 130,330 128,360" strokeWidth="4" fill="none"/>
                                    
                                    {/* Feet */}
                                    <path d="M72,360 L60,375" strokeWidth="3" />
                                    <path d="M128,360 L140,375" strokeWidth="3" />
                                </g>
                             </svg>
                        </div>
                        
                        {/* BACK SKELETON - ANATOMICAL VECTOR */}
                        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                <g fill="url(#boneGradient)" stroke="#64748b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)">
                                    {/* Skull Back */}
                                    <path d="M75,20 C75,5 125,5 125,20 C125,50 75,50 75,20 Z" />
                                    
                                    {/* Spine Complete */}
                                    <path d="M100,50 L100,150" strokeWidth="6" strokeDasharray="3,2" />

                                    {/* Scapula */}
                                    <path d="M60,85 L85,85 L80,115 Z" fill="rgba(100,116,139,0.3)" />
                                    <path d="M140,85 L115,85 L120,115 Z" fill="rgba(100,116,139,0.3)" />

                                    {/* Ribs Back */}
                                    <path d="M85,90 C70,95 60,110 65,125" fill="none" />
                                    <path d="M115,90 C130,95 140,110 135,125" fill="none" />

                                    {/* Pelvis Back */}
                                    <path d="M70,150 C60,140 140,140 130,150 C135,170 115,180 100,185 C85,180 65,170 70,150" />
                                    <path d="M100,150 L100,175" strokeWidth="2" /> {/* Sacrum */}

                                    {/* Arms */}
                                    <path d="M45,85 C40,90 35,130 40,145" strokeWidth="4" fill="none"/> 
                                    <path d="M155,85 C160,90 165,130 160,145" strokeWidth="4" fill="none"/>
                                    <path d="M40,145 C35,160 30,190 25,200" strokeWidth="3" fill="none"/>
                                    <path d="M160,145 C165,160 170,190 175,200" strokeWidth="3" fill="none"/>

                                    {/* Legs */}
                                    <path d="M80,170 C75,200 70,240 75,260" strokeWidth="5" fill="none"/>
                                    <path d="M120,170 C125,200 130,240 125,260" strokeWidth="5" fill="none"/>
                                    <path d="M75,260 C70,290 70,330 72,360" strokeWidth="4" fill="none"/>
                                    <path d="M125,260 C130,290 130,330 128,360" strokeWidth="4" fill="none"/>
                                    
                                    {/* Heels */}
                                    <path d="M72,360 L75,370" strokeWidth="4" />
                                    <path d="M128,360 L125,370" strokeWidth="4" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Hotspots */}
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
                                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900/90 text-cyan-50 text-[11px] font-bold rounded-lg border border-cyan-500/30 whitespace-nowrap opacity-0 group-hover/point:opacity-100 transition-all transform group-hover/point:translate-x-1 pointer-events-none z-50 shadow-xl backdrop-blur-sm">
                                    {point.label}
                                </span>

                                {!isSelected && (
                                    <span className="absolute w-full h-full rounded-full bg-cyan-400 opacity-10 animate-ping group-hover/point:opacity-30"></span>
                                )}

                                <span className={`absolute rounded-full transition-all duration-300 border-2 ${
                                    isSelected 
                                    ? 'w-6 h-6 border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_rgba(34,211,238,0.9)]' 
                                    : 'w-3 h-3 border-cyan-500/40 bg-slate-900/80 group-hover/point:w-5 group-hover/point:h-5 group-hover/point:border-cyan-400 group-hover/point:shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                                }`}></span>

                                <span className={`absolute rounded-full transition-all duration-300 ${
                                    isSelected 
                                    ? 'w-2 h-2 bg-white shadow-[0_0_8px_white]' 
                                    : 'w-1 h-1 bg-cyan-400'
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

  const renderStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="text-center md:text-left mb-4">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Var gör det ont?</h2>
          <p className="text-lg text-slate-500">Använd 3D-scannern för att markera exakt område.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 items-center xl:items-start">
        <div className="w-full max-w-[400px] flex justify-center order-2 xl:order-1">
            <HolographicBodyScanner selected={data.injuryLocation} onSelect={(part) => { updateData('injuryLocation', part); setShowCustomBodyInput(false); }} />
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
        </div>
      </div>
    </div>
  );

  // --- NEW MEDICAL SAFETY CHECK STEP ---
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

  const renderStep4 = () => {
    const questions = BODY_SPECIFIC_QUESTIONS[data.injuryLocation] || GENERIC_QUESTIONS;
    
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Klinisk Analys</h2>
                <p className="text-lg text-slate-500">Vi fördjupar oss i {data.injuryLocation ? `din ${data.injuryLocation.toLowerCase()}` : 'dina besvär'}.</p>
            </div>

            <div className="space-y-6">
                {questions.map((q) => (
                    <div key={q.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-3">
                            <div className="p-2 bg-primary-50 text-primary-600 rounded-xl"><Stethoscope size={20} /></div>
                            {q.label}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => updateSpecificAnswer(q.id, opt)}
                                    className={`px-5 py-4 rounded-xl text-sm font-medium text-left transition-all border ${
                                        data.specificAnswers[q.id] === opt
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-offset-2 ring-slate-900'
                                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-white hover:border-slate-300'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

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
