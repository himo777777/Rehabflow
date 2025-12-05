/**
 * SkeletonSVG - Clean line-art anatomical skeleton
 *
 * Professional medical illustration style:
 * - Clean stroke-based outlines with 3D depth gradients
 * - Minimalist but anatomically accurate
 * - 8 head heights proportions
 * - Optimized for dark backgrounds
 * - Enhanced with filters and gradients for professional appearance
 */

import React from 'react';

interface SkeletonSVGProps {
  view: 'front' | 'back' | 'side';
  className?: string;
}

const SkeletonSVG: React.FC<SkeletonSVGProps> = ({ view, className = '' }) => {
  // Enhanced color palette with depth
  const stroke = '#E8E4DC'; // Warm bone white (base)
  const strokeLight = '#F5F2EB'; // Highlight
  const strokeMid = '#D4D0C8'; // Mid-tone
  const strokeDark = '#B8B4AC'; // Shadow
  const fill = 'none';
  const fillSubtle = 'rgba(232, 228, 220, 0.08)';
  const fillGradient = 'url(#boneGradient)';

  // SVG Definitions for gradients and filters
  const renderDefs = () => (
    <defs>
      {/* Bone gradient for 3D depth effect */}
      <linearGradient id="boneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#D4D0C8" />
        <stop offset="35%" stopColor="#F5F2EB" />
        <stop offset="65%" stopColor="#F5F2EB" />
        <stop offset="100%" stopColor="#D4D0C8" />
      </linearGradient>

      {/* Vertical bone gradient for long bones */}
      <linearGradient id="boneGradientVertical" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#E8E4DC" />
        <stop offset="50%" stopColor="#F5F2EB" />
        <stop offset="100%" stopColor="#D4D0C8" />
      </linearGradient>

      {/* Joint glow effect for interactive regions */}
      <radialGradient id="jointGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(34, 211, 238, 0.5)" />
        <stop offset="70%" stopColor="rgba(34, 211, 238, 0.15)" />
        <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
      </radialGradient>

      {/* Selection glow for selected regions */}
      <radialGradient id="selectionGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(56, 189, 248, 0.6)" />
        <stop offset="60%" stopColor="rgba(56, 189, 248, 0.2)" />
        <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
      </radialGradient>

      {/* Drop shadow filter for bone depth */}
      <filter id="boneShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0.5" dy="1" stdDeviation="0.8" floodColor="#1e293b" floodOpacity="0.25"/>
      </filter>

      {/* Stronger shadow for major bones */}
      <filter id="majorBoneShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.2" floodColor="#1e293b" floodOpacity="0.3"/>
      </filter>

      {/* Inner glow for subtle highlighting */}
      <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/>
        <feFlood floodColor="#F5F2EB" floodOpacity="0.4" result="color"/>
        <feComposite in="color" in2="blur" operator="in" result="glow"/>
        <feComposite in="SourceGraphic" in2="glow" operator="over"/>
      </filter>

      {/* Soft edge filter for organic bone look */}
      <filter id="softEdge" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.3"/>
      </filter>

      {/* Pain intensity gradients */}
      <radialGradient id="painMild" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(252, 211, 77, 0.6)" />
        <stop offset="100%" stopColor="rgba(252, 211, 77, 0)" />
      </radialGradient>

      <radialGradient id="painModerate" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(251, 146, 60, 0.6)" />
        <stop offset="100%" stopColor="rgba(251, 146, 60, 0)" />
      </radialGradient>

      <radialGradient id="painSevere" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(239, 68, 68, 0.6)" />
        <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
      </radialGradient>
    </defs>
  );

  const renderFrontView = () => (
    <g id="skeleton-front" strokeLinecap="round" strokeLinejoin="round">
      {/* ==================== SKULL ==================== */}
      <g id="skull" filter="url(#boneShadow)">
        {/* Cranium outline */}
        <path
          d="M100,12
             C72,12 56,32 56,58
             C56,75 62,88 72,96
             L72,102
             C72,108 82,115 100,115
             C118,115 128,108 128,102
             L128,96
             C138,88 144,75 144,58
             C144,32 128,12 100,12 Z"
          fill="url(#boneGradient)"
          stroke={stroke}
          strokeWidth="1.8"
        />

        {/* Eye sockets */}
        <ellipse cx="82" cy="60" rx="10" ry="8" fill={fillSubtle} stroke={stroke} strokeWidth="1.2" />
        <ellipse cx="118" cy="60" rx="10" ry="8" fill={fillSubtle} stroke={stroke} strokeWidth="1.2" />

        {/* Nasal cavity */}
        <path
          d="M96,68 L100,82 L104,68"
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
        />
        <path
          d="M97,82 L100,88 L103,82"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1"
        />

        {/* Cheekbones (zygomatic) */}
        <path d="M72,65 Q62,68 60,76 Q64,82 72,78" fill="none" stroke={stroke} strokeWidth="1" />
        <path d="M128,65 Q138,68 140,76 Q136,82 128,78" fill="none" stroke={stroke} strokeWidth="1" />

        {/* Upper jaw (maxilla) teeth line */}
        <path d="M78,90 Q100,96 122,90" fill="none" stroke={strokeLight} strokeWidth="0.8" />

        {/* Mandible (jaw) */}
        <path
          d="M72,98
             C68,105 68,115 74,122
             L86,128
             Q100,132 114,128
             L126,122
             C132,115 132,105 128,98"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1.5"
        />
        {/* Teeth line */}
        <path d="M82,108 Q100,112 118,108" fill="none" stroke={strokeLight} strokeWidth="0.8" />
      </g>

      {/* ==================== CERVICAL SPINE (NECK) ==================== */}
      <g id="neck">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={`c${i}`}>
            <ellipse
              cx={100}
              cy={138 + i * 7}
              rx={7 + i * 0.4}
              ry={2.5}
              fill={fillSubtle}
              stroke={stroke}
              strokeWidth="0.8"
            />
          </g>
        ))}
      </g>

      {/* ==================== CLAVICLES ==================== */}
      <g id="clavicles" filter="url(#boneShadow)">
        <path
          d="M100,188 Q80,182 55,190"
          fill="none"
          stroke={stroke}
          strokeWidth="3.5"
        />
        <path
          d="M100,188 Q120,182 145,190"
          fill="none"
          stroke={stroke}
          strokeWidth="3.5"
        />
      </g>

      {/* ==================== RIBCAGE ==================== */}
      <g id="ribcage">
        {/* Sternum */}
        <path
          d="M94,192 L106,192 L107,200 L93,200 Z"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1"
        />
        <path
          d="M93,200 L107,200 L106,280 L94,280 Z"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1"
        />
        <path
          d="M96,280 L104,280 L100,292 Z"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="0.8"
        />

        {/* Ribs - 12 pairs */}
        {[...Array(12)].map((_, i) => {
          const y = 198 + i * 7;
          const curveDepth = 8 + i * 1.5;
          const ribWidth = i < 7 ? 42 - i * 1 : 35 - (i - 7) * 3;

          return (
            <g key={`rib-${i}`}>
              {/* Left rib */}
              <path
                d={`M93,${y} Q${93 - ribWidth * 0.6},${y + curveDepth * 0.4} ${93 - ribWidth},${y + curveDepth}`}
                fill="none"
                stroke={stroke}
                strokeWidth={i < 2 ? 2 : 1.5}
              />
              {/* Right rib */}
              <path
                d={`M107,${y} Q${107 + ribWidth * 0.6},${y + curveDepth * 0.4} ${107 + ribWidth},${y + curveDepth}`}
                fill="none"
                stroke={stroke}
                strokeWidth={i < 2 ? 2 : 1.5}
              />
            </g>
          );
        })}
      </g>

      {/* ==================== SPINE (THORACIC & LUMBAR) ==================== */}
      <g id="spine">
        {/* Thoracic T1-T12 */}
        {[...Array(12)].map((_, i) => (
          <ellipse
            key={`t${i}`}
            cx={100}
            cy={195 + i * 7}
            rx={8}
            ry={3}
            fill={fillSubtle}
            stroke={stroke}
            strokeWidth="0.6"
          />
        ))}

        {/* Lumbar L1-L5 */}
        {[...Array(5)].map((_, i) => (
          <g key={`l${i}`}>
            <ellipse
              cx={100}
              cy={292 + i * 11}
              rx={10 + i * 0.5}
              ry={4}
              fill={fillSubtle}
              stroke={stroke}
              strokeWidth="0.8"
            />
            {/* Transverse processes */}
            <line x1={90} y1={292 + i * 11} x2={78} y2={290 + i * 11} stroke={stroke} strokeWidth="1.5" />
            <line x1={110} y1={292 + i * 11} x2={122} y2={290 + i * 11} stroke={stroke} strokeWidth="1.5" />
          </g>
        ))}
      </g>

      {/* ==================== PELVIS ==================== */}
      <g id="pelvis" filter="url(#majorBoneShadow)">
        {/* Sacrum */}
        <path
          d="M90,348 L110,348 L107,390 Q100,398 93,390 Z"
          fill="url(#boneGradientVertical)"
          stroke={stroke}
          strokeWidth="1.2"
        />

        {/* Left ilium (hip bone) */}
        <path
          d="M90,352
             C75,345 50,350 48,375
             C46,400 52,420 65,432
             L80,425
             Q82,410 85,390
             L90,365"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1.5"
        />

        {/* Right ilium */}
        <path
          d="M110,352
             C125,345 150,350 152,375
             C154,400 148,420 135,432
             L120,425
             Q118,410 115,390
             L110,365"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1.5"
        />

        {/* Hip sockets (acetabulum) */}
        <circle cx="68" cy="415" r="14" fill={fillSubtle} stroke={stroke} strokeWidth="1.5" />
        <circle cx="132" cy="415" r="14" fill={fillSubtle} stroke={stroke} strokeWidth="1.5" />

        {/* Pubic symphysis */}
        <path
          d="M80,428 Q100,442 120,428"
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
        />
        <path
          d="M85,428 L85,440 Q100,450 115,440 L115,428"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1"
        />

        {/* Obturator foramen */}
        <ellipse cx="78" cy="432" rx="6" ry="10" fill={fillSubtle} stroke={strokeLight} strokeWidth="0.8" />
        <ellipse cx="122" cy="432" rx="6" ry="10" fill={fillSubtle} stroke={strokeLight} strokeWidth="0.8" />
      </g>

      {/* ==================== LEFT ARM ==================== */}
      <g id="left-arm" filter="url(#boneShadow)">
        {/* Shoulder joint */}
        <circle cx="152" cy="195" r="10" fill="url(#jointGlow)" stroke={stroke} strokeWidth="1.5" />

        {/* Humerus (upper arm) */}
        <path
          d="M152,205
             C154,240 156,270 158,295
             L162,295
             C161,270 159,240 157,205"
          fill="url(#boneGradientVertical)"
          stroke={stroke}
          strokeWidth="1.3"
        />
        <line x1="155" y1="215" x2="159" y2="285" stroke={strokeLight} strokeWidth="1" />

        {/* Elbow */}
        <ellipse cx="160" cy="300" rx="8" ry="10" fill={fillSubtle} stroke={stroke} strokeWidth="1.2" />

        {/* Radius */}
        <path
          d="M156,312 C158,340 160,365 162,388"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
        />

        {/* Ulna */}
        <path
          d="M164,312 C166,340 168,365 170,388"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
        />

        {/* Wrist */}
        <rect x="158" y="390" width="16" height="10" rx="3" fill={fillSubtle} stroke={stroke} strokeWidth="1" />

        {/* Hand */}
        <g transform="translate(160, 402)">
          {/* Metacarpals */}
          {[0, 1, 2, 3, 4].map((i) => {
            const x = i * 4;
            const angle = (i - 2) * 4;
            const length = i === 0 ? 18 : 28 - Math.abs(i - 2) * 2;
            return (
              <g key={`lf${i}`} transform={`rotate(${angle}, ${x}, 0)`}>
                <line x1={x} y1="0" x2={x + 1} y2={length * 0.5} stroke={stroke} strokeWidth="2" />
                <line x1={x + 1} y1={length * 0.5} x2={x + 2} y2={length * 0.75} stroke={stroke} strokeWidth="1.8" />
                <line x1={x + 2} y1={length * 0.75} x2={x + 2.5} y2={length} stroke={stroke} strokeWidth="1.5" />
              </g>
            );
          })}
        </g>
      </g>

      {/* ==================== RIGHT ARM ==================== */}
      <g id="right-arm" filter="url(#boneShadow)">
        {/* Shoulder joint */}
        <circle cx="48" cy="195" r="10" fill="url(#jointGlow)" stroke={stroke} strokeWidth="1.5" />

        {/* Humerus */}
        <path
          d="M48,205
             C46,240 44,270 42,295
             L38,295
             C39,270 41,240 43,205"
          fill="url(#boneGradientVertical)"
          stroke={stroke}
          strokeWidth="1.3"
        />
        <line x1="45" y1="215" x2="41" y2="285" stroke={strokeLight} strokeWidth="1" />

        {/* Elbow */}
        <ellipse cx="40" cy="300" rx="8" ry="10" fill={fillSubtle} stroke={stroke} strokeWidth="1.2" />

        {/* Radius */}
        <path
          d="M44,312 C42,340 40,365 38,388"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
        />

        {/* Ulna */}
        <path
          d="M36,312 C34,340 32,365 30,388"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
        />

        {/* Wrist */}
        <rect x="26" y="390" width="16" height="10" rx="3" fill={fillSubtle} stroke={stroke} strokeWidth="1" />

        {/* Hand */}
        <g transform="translate(26, 402)">
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 16 - i * 4;
            const angle = -(i - 2) * 4;
            const length = i === 4 ? 18 : 28 - Math.abs(i - 2) * 2;
            return (
              <g key={`rf${i}`} transform={`rotate(${angle}, ${x}, 0)`}>
                <line x1={x} y1="0" x2={x - 1} y2={length * 0.5} stroke={stroke} strokeWidth="2" />
                <line x1={x - 1} y1={length * 0.5} x2={x - 2} y2={length * 0.75} stroke={stroke} strokeWidth="1.8" />
                <line x1={x - 2} y1={length * 0.75} x2={x - 2.5} y2={length} stroke={stroke} strokeWidth="1.5" />
              </g>
            );
          })}
        </g>
      </g>

      {/* ==================== LEFT LEG ==================== */}
      <g id="left-leg" filter="url(#majorBoneShadow)">
        {/* Femoral head */}
        <circle cx="132" cy="415" r="9" fill="url(#jointGlow)" stroke={stroke} strokeWidth="1" />

        {/* Femoral neck */}
        <path d="M132,424 L128,445" stroke={stroke} strokeWidth="6" />

        {/* Femur shaft */}
        <path
          d="M124,445
             C123,490 122,545 122,595
             L130,597
             C130,545 130,490 130,445"
          fill="url(#boneGradientVertical)"
          stroke={stroke}
          strokeWidth="1.3"
        />
        <line x1="126" y1="460" x2="125" y2="585" stroke={strokeLight} strokeWidth="1.5" />

        {/* Knee / Patella */}
        <ellipse cx="126" cy="605" rx="12" ry="10" fill={fillSubtle} stroke={stroke} strokeWidth="1.2" />
        <ellipse cx="126" cy="608" rx="8" ry="10" fill={fillSubtle} stroke={stroke} strokeWidth="1" />

        {/* Tibia */}
        <path
          d="M120,620
             C120,670 120,720 120,770
             L128,772
             C128,720 128,670 128,620"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1.2"
        />

        {/* Fibula */}
        <line x1="134" y1="622" x2="135" y2="768" stroke={stroke} strokeWidth="2" />
        <circle cx="134" cy="620" r="4" fill={fillSubtle} stroke={stroke} strokeWidth="0.8" />

        {/* Ankle */}
        <ellipse cx="126" cy="778" rx="10" ry="5" fill={fillSubtle} stroke={stroke} strokeWidth="1" />
        <circle cx="136" cy="774" r="3" fill={fillSubtle} stroke={stroke} strokeWidth="0.8" />

        {/* Foot */}
        <path
          d="M116,783 L114,798 Q120,806 140,806 L142,798 L142,788"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1"
        />
        {/* Toes */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`lt${i}`}
            x1={118 + i * 5}
            y1="800"
            x2={116 + i * 6}
            y2="816"
            stroke={stroke}
            strokeWidth="1.8"
          />
        ))}
      </g>

      {/* ==================== RIGHT LEG ==================== */}
      <g id="right-leg" filter="url(#majorBoneShadow)">
        {/* Femoral head */}
        <circle cx="68" cy="415" r="9" fill="url(#jointGlow)" stroke={stroke} strokeWidth="1" />

        {/* Femoral neck */}
        <path d="M68,424 L72,445" stroke={stroke} strokeWidth="6" />

        {/* Femur shaft */}
        <path
          d="M76,445
             C77,490 78,545 78,595
             L70,597
             C70,545 70,490 70,445"
          fill="url(#boneGradientVertical)"
          stroke={stroke}
          strokeWidth="1.3"
        />
        <line x1="74" y1="460" x2="75" y2="585" stroke={strokeLight} strokeWidth="1.5" />

        {/* Knee / Patella */}
        <ellipse cx="74" cy="605" rx="12" ry="10" fill={fillSubtle} stroke={stroke} strokeWidth="1.2" />
        <ellipse cx="74" cy="608" rx="8" ry="10" fill={fillSubtle} stroke={stroke} strokeWidth="1" />

        {/* Tibia */}
        <path
          d="M80,620
             C80,670 80,720 80,770
             L72,772
             C72,720 72,670 72,620"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1.2"
        />

        {/* Fibula */}
        <line x1="66" y1="622" x2="65" y2="768" stroke={stroke} strokeWidth="2" />
        <circle cx="66" cy="620" r="4" fill={fillSubtle} stroke={stroke} strokeWidth="0.8" />

        {/* Ankle */}
        <ellipse cx="74" cy="778" rx="10" ry="5" fill={fillSubtle} stroke={stroke} strokeWidth="1" />
        <circle cx="64" cy="774" r="3" fill={fillSubtle} stroke={stroke} strokeWidth="0.8" />

        {/* Foot */}
        <path
          d="M84,783 L86,798 Q80,806 60,806 L58,798 L58,788"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1"
        />
        {/* Toes */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`rt${i}`}
            x1={82 - i * 5}
            y1="800"
            x2={84 - i * 6}
            y2="816"
            stroke={stroke}
            strokeWidth="1.8"
          />
        ))}
      </g>
    </g>
  );

  const renderBackView = () => (
    <g id="skeleton-back" strokeLinecap="round" strokeLinejoin="round">
      {/* ==================== SKULL BACK ==================== */}
      <g id="skull-back" filter="url(#boneShadow)">
        <path
          d="M100,12
             C72,12 56,32 56,58
             C56,82 68,102 100,108
             C132,102 144,82 144,58
             C144,32 128,12 100,12 Z"
          fill="url(#boneGradient)"
          stroke={stroke}
          strokeWidth="1.8"
        />
        {/* Occipital ridge */}
        <path d="M70,60 Q100,78 130,60" fill="none" stroke={strokeLight} strokeWidth="0.8" />
        {/* Mastoid processes */}
        <ellipse cx="68" cy="95" rx="5" ry="8" fill={fillSubtle} stroke={stroke} strokeWidth="0.8" />
        <ellipse cx="132" cy="95" rx="5" ry="8" fill={fillSubtle} stroke={stroke} strokeWidth="0.8" />
      </g>

      {/* ==================== CERVICAL SPINE BACK ==================== */}
      <g id="neck-back">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={`cb${i}`}>
            <ellipse
              cx={100}
              cy={118 + i * 9}
              rx={8 + i * 0.5}
              ry={3}
              fill={fillSubtle}
              stroke={stroke}
              strokeWidth="0.8"
            />
            {/* Spinous process */}
            <line x1={100} y1={118 + i * 9 - 3} x2={100} y2={108 + i * 9} stroke={stroke} strokeWidth="2" />
            {/* Transverse processes */}
            <line x1={92 - i * 0.5} y1={118 + i * 9} x2={82 - i} y2={116 + i * 9} stroke={stroke} strokeWidth="1.5" />
            <line x1={108 + i * 0.5} y1={118 + i * 9} x2={118 + i} y2={116 + i * 9} stroke={stroke} strokeWidth="1.5" />
          </g>
        ))}
      </g>

      {/* ==================== SCAPULAE ==================== */}
      <g id="scapulae" filter="url(#boneShadow)">
        {/* Left scapula */}
        <path
          d="M115,185
             L148,180
             L158,200
             L152,265
             L128,285
             L112,255
             L115,205
             Z"
          fill="url(#boneGradient)"
          stroke={stroke}
          strokeWidth="1.5"
        />
        {/* Spine of scapula */}
        <path d="M118,200 L152,188" stroke={stroke} strokeWidth="3" />
        {/* Medial border */}
        <path d="M115,205 L112,255 L128,283" fill="none" stroke={strokeLight} strokeWidth="0.8" />

        {/* Right scapula */}
        <path
          d="M85,185
             L52,180
             L42,200
             L48,265
             L72,285
             L88,255
             L85,205
             Z"
          fill="url(#boneGradient)"
          stroke={stroke}
          strokeWidth="1.5"
        />
        <path d="M82,200 L48,188" stroke={stroke} strokeWidth="3" />
        <path d="M85,205 L88,255 L72,283" fill="none" stroke={strokeLight} strokeWidth="0.8" />
      </g>

      {/* ==================== THORACIC SPINE BACK ==================== */}
      <g id="thoracic-back">
        {[...Array(12)].map((_, i) => (
          <g key={`tb${i}`}>
            <ellipse
              cx={100}
              cy={185 + i * 8}
              rx={9}
              ry={3.5}
              fill={fillSubtle}
              stroke={stroke}
              strokeWidth="0.6"
            />
            {/* Spinous process */}
            <line
              x1={100}
              y1={185 + i * 8 - 3.5}
              x2={100}
              y2={175 + i * 8}
              stroke={stroke}
              strokeWidth="2.5"
            />
          </g>
        ))}
      </g>

      {/* ==================== RIBS BACK ==================== */}
      <g id="ribs-back">
        {[...Array(12)].map((_, i) => {
          const y = 188 + i * 8;
          const ribLen = 40 - i * 1.2;
          return (
            <g key={`rb${i}`}>
              <path
                d={`M95,${y} Q${95 - ribLen * 0.5},${y + 6} ${95 - ribLen},${y + 4}`}
                fill="none"
                stroke={stroke}
                strokeWidth="1.5"
              />
              <path
                d={`M105,${y} Q${105 + ribLen * 0.5},${y + 6} ${105 + ribLen},${y + 4}`}
                fill="none"
                stroke={stroke}
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </g>

      {/* ==================== LUMBAR SPINE BACK ==================== */}
      <g id="lumbar-back">
        {[...Array(5)].map((_, i) => (
          <g key={`lb${i}`}>
            <ellipse
              cx={100}
              cy={295 + i * 12}
              rx={11}
              ry={4.5}
              fill={fillSubtle}
              stroke={stroke}
              strokeWidth="0.8"
            />
            {/* Spinous process */}
            <line x1={100} y1={295 + i * 12 - 4.5} x2={100} y2={283 + i * 12} stroke={stroke} strokeWidth="3" />
            {/* Transverse processes */}
            <line x1={89} y1={295 + i * 12} x2={75} y2={293 + i * 12} stroke={stroke} strokeWidth="2" />
            <line x1={111} y1={295 + i * 12} x2={125} y2={293 + i * 12} stroke={stroke} strokeWidth="2" />
          </g>
        ))}
      </g>

      {/* ==================== PELVIS BACK ==================== */}
      <g id="pelvis-back" filter="url(#majorBoneShadow)">
        {/* Sacrum */}
        <path
          d="M88,358 L112,358 L108,405 Q100,415 92,405 Z"
          fill="url(#boneGradientVertical)"
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Sacral crest */}
        <line x1={100} y1={360} x2={100} y2={400} stroke={strokeLight} strokeWidth="1.5" />

        {/* Left posterior ilium */}
        <path
          d="M112,362
             C130,352 155,360 158,388
             C160,415 152,440 138,450
             L122,442
             Q125,420 122,395
             L112,372"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1.5"
        />

        {/* Right posterior ilium */}
        <path
          d="M88,362
             C70,352 45,360 42,388
             C40,415 48,440 62,450
             L78,442
             Q75,420 78,395
             L88,372"
          fill={fillSubtle}
          stroke={stroke}
          strokeWidth="1.5"
        />

        {/* Ischial tuberosities */}
        <ellipse cx="128" cy="450" rx="7" ry="5" fill={fillSubtle} stroke={stroke} strokeWidth="1" />
        <ellipse cx="72" cy="450" rx="7" ry="5" fill={fillSubtle} stroke={stroke} strokeWidth="1" />
      </g>

      {/* ==================== ARMS BACK ==================== */}
      <g id="arms-back" filter="url(#boneShadow)">
        {/* Left arm */}
        <circle cx="160" cy="192" r="10" fill="url(#jointGlow)" stroke={stroke} strokeWidth="1.5" />
        <path d="M160,202 C162,235 164,270 167,298" stroke={stroke} strokeWidth="6" />
        <ellipse cx="168" cy="305" rx="7" ry="10" fill={fillSubtle} stroke={stroke} strokeWidth="1" />
        <line x1="166" y1="318" x2="170" y2="388" stroke={stroke} strokeWidth="2.5" />
        <line x1="170" y1="318" x2="175" y2="386" stroke={stroke} strokeWidth="2" />
        <rect x="166" y="390" width="14" height="8" rx="2" fill={fillSubtle} stroke={stroke} strokeWidth="0.8" />
        {[0,1,2,3,4].map(i => (
          <line key={`lhb${i}`} x1={168 + i*3} y1="400" x2={167 + i*4} y2="428" stroke={stroke} strokeWidth="1.8" />
        ))}

        {/* Right arm */}
        <circle cx="40" cy="192" r="10" fill="url(#jointGlow)" stroke={stroke} strokeWidth="1.5" />
        <path d="M40,202 C38,235 36,270 33,298" stroke={stroke} strokeWidth="6" />
        <ellipse cx="32" cy="305" rx="7" ry="10" fill={fillSubtle} stroke={stroke} strokeWidth="1" />
        <line x1="34" y1="318" x2="30" y2="388" stroke={stroke} strokeWidth="2.5" />
        <line x1="30" y1="318" x2="25" y2="386" stroke={stroke} strokeWidth="2" />
        <rect x="20" y="390" width="14" height="8" rx="2" fill={fillSubtle} stroke={stroke} strokeWidth="0.8" />
        {[0,1,2,3,4].map(i => (
          <line key={`rhb${i}`} x1={32 - i*3} y1="400" x2={33 - i*4} y2="428" stroke={stroke} strokeWidth="1.8" />
        ))}
      </g>

      {/* ==================== LEGS BACK ==================== */}
      <g id="legs-back" filter="url(#majorBoneShadow)">
        {/* Left leg */}
        <circle cx="132" cy="445" r="8" fill="url(#jointGlow)" stroke={stroke} strokeWidth="1" />
        <path d="M130,453 C129,500 128,560 127,608" stroke={stroke} strokeWidth="8" />
        <ellipse cx="127" cy="618" rx="10" ry="8" fill={fillSubtle} stroke={stroke} strokeWidth="1" />
        <line x1="126" y1="628" x2="125" y2="772" stroke={stroke} strokeWidth="5" />
        <line x1="133" y1="630" x2="134" y2="768" stroke={stroke} strokeWidth="2.5" />
        <ellipse cx="128" cy="778" rx="9" ry="5" fill={fillSubtle} stroke={stroke} strokeWidth="1" />
        {/* Heel */}
        <ellipse cx="128" cy="795" rx="8" ry="12" fill={fillSubtle} stroke={stroke} strokeWidth="1.2" />

        {/* Right leg */}
        <circle cx="68" cy="445" r="8" fill="url(#jointGlow)" stroke={stroke} strokeWidth="1" />
        <path d="M70,453 C71,500 72,560 73,608" stroke={stroke} strokeWidth="8" />
        <ellipse cx="73" cy="618" rx="10" ry="8" fill={fillSubtle} stroke={stroke} strokeWidth="1" />
        <line x1="74" y1="628" x2="75" y2="772" stroke={stroke} strokeWidth="5" />
        <line x1="67" y1="630" x2="66" y2="768" stroke={stroke} strokeWidth="2.5" />
        <ellipse cx="72" cy="778" rx="9" ry="5" fill={fillSubtle} stroke={stroke} strokeWidth="1" />
        {/* Heel */}
        <ellipse cx="72" cy="795" rx="8" ry="12" fill={fillSubtle} stroke={stroke} strokeWidth="1.2" />
      </g>
    </g>
  );

  return (
    <g className={className}>
      {renderDefs()}
      {view === 'front' && renderFrontView()}
      {view === 'back' && renderBackView()}
      {view === 'side' && renderFrontView()}
    </g>
  );
};

export default SkeletonSVG;
