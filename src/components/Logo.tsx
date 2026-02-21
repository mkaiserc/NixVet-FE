import React from 'react';

interface LogoProps {
  className?: string;
  color?: string; // Main color for the lines
  accent?: string; // Accent color
  width?: number;
  height?: number;
}

export default function Logo({ 
  className = '', 
  color = '#13364F', // Default to Navy Blue
  accent = '#C29A5A', // Default to Gold
  width = 50,
  height = 50
}: LogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dog Head Outline */}
      <path 
        d="M350 180C350 180 320 150 280 150C240 150 220 180 200 220C180 260 180 300 200 340C220 380 260 400 260 400C260 400 300 380 320 340C340 300 350 260 350 220" 
        stroke={color} 
        strokeWidth="24" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Vet Symbol Staff */}
      <path 
        d="M260 400V220" 
        stroke={color} 
        strokeWidth="24" 
        strokeLinecap="round"
      />
      {/* V Shape */}
      <path 
        d="M260 220L350 180" 
        stroke={accent} 
        strokeWidth="24" 
        strokeLinecap="round"
      />
      {/* Snake */}
      <path 
        d="M220 250C220 250 240 240 260 250C280 260 280 280 260 290C240 300 240 320 260 330C280 340 300 330 300 330" 
        stroke={accent} 
        strokeWidth="24" 
        strokeLinecap="round"
      />
    </svg>
  );
}
