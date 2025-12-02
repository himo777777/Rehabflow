
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="shieldGradient" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* The Shield / Hexagon Container */}
      <path 
        d="M16 2 L 26.5 8 V 20 L 16 30 L 5.5 20 V 8 L 16 2 Z" 
        stroke="url(#shieldGradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* The Pulse / Checkmark Core */}
      <path 
        d="M10 16 L 14 20 L 22 12" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Optional: Technical Dots for AI feel */}
      <circle cx="16" cy="2" r="1.5" fill="currentColor" />
      <circle cx="16" cy="30" r="1.5" fill="currentColor" />
    </svg>
  );
};

export default Logo;
