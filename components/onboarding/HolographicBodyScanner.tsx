/**
 * HolographicBodyScanner
 *
 * 3D interaktiv kroppsscanner för att välja smärtområde.
 * Del av FAS 6: Modularisering
 */

import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Rotate3d, Move3d, Info } from 'lucide-react';
import { BODY_POINTS, BODY_PART_SYMPTOMS } from './constants';

interface HolographicBodyScannerProps {
  selected: string;
  onSelect: (part: string) => void;
}

const HolographicBodyScanner: React.FC<HolographicBodyScannerProps> = ({ selected, onSelect }) => {
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
                    <path d="M-10,25 Q0,28 10,25" strokeWidth="0.5" />
                    {/* Orbits */}
                    <path d="M-12,2 A5,4 0 1,1 -4,2 A5,4 0 1,1 -12,2" />
                    <path d="M4,2 A5,4 0 1,1 12,2 A5,4 0 1,1 4,2" />
                    {/* Nose */}
                    <path d="M0,12 L-2,18 L2,18 Z" strokeWidth="0.8" />
                  </g>

                  {/* CERVICAL SPINE */}
                  <path d="M100,68 L100,85" strokeWidth="6" stroke="black" />
                  <path d="M96,72 H104 M96,76 H104 M96,80 H104" strokeWidth="1.5" />

                  {/* CLAVICLES */}
                  <path d="M100,85 C85,82 70,88 55,85" />
                  <path d="M100,85 C115,82 130,88 145,85" />

                  {/* THORAX / RIBCAGE */}
                  <g transform="translate(100, 110)">
                    <path d="M0,-25 L0,20" strokeWidth="3" />

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
                  <path d="M100,140 L100,170" strokeWidth="8" stroke="black" />
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
                    <circle cx="-25" cy="25" r="4" strokeWidth="0.8" />
                    <circle cx="25" cy="25" r="4" strokeWidth="0.8" />
                  </g>

                  {/* ARMS */}
                  <g>
                    {/* Left Humerus */}
                    <path d="M55,85 L45,145" strokeWidth="1.5" />
                    <path d="M57,87 L47,147" strokeWidth="0.5" strokeOpacity="0.5" />
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
                    <path d="M42,200 L35,215" />
                    <path d="M35,215 L30,225 M37,215 L35,225 M40,215 L40,225" strokeWidth="0.8" />

                    <path d="M158,200 L165,215" />
                    <path d="M165,215 L170,225 M163,215 L165,225 M160,215 L160,225" strokeWidth="0.8" />
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
                    <path d="M-5,40 L0,25 L5,40" strokeWidth="0.5" />
                  </g>

                  {/* SPINE COLUMN (Spinous Processes) */}
                  <path d="M100,45 L100,175" strokeWidth="4" stroke="black" />
                  {/* Vertebrae markers */}
                  {[...Array(18)].map((_, i) => (
                    <path key={i} d={`M97,${50 + i*7} L100,${53 + i*7} L103,${50 + i*7}`} strokeWidth="1" />
                  ))}

                  {/* SCAPULA */}
                  <path d="M70,90 L90,90 L85,120 Z" strokeWidth="1.5" />
                  <path d="M72,95 L88,95" strokeWidth="0.5" />

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
                    <path d="M0,0 L-8,30 L0,40 L8,30 L0,0" strokeWidth="1.5" />
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

export default HolographicBodyScanner;
