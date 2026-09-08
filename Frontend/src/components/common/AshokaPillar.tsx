import React, { useState } from 'react';

interface AshokaPillarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const AshokaPillar: React.FC<AshokaPillarProps> = ({ className = '', size = 'hero' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-24 h-32',
    md: 'w-48 h-64',
    lg: 'w-64 h-80',
    hero: 'w-72 h-96 md:w-96 md:h-[480px] lg:w-[420px] lg:h-[540px]',
  }[size];

  return (
    <div className={`relative flex items-center justify-center select-none ${sizeClasses} ${className}`}>
      {/* Background Indian Tricolor Aura & Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B00]/30 via-white/50 to-[#16A34A]/25 filter blur-3xl -z-10 transform scale-110" />

      {/* Decorative Radial Ashoka Chakra behind the capital */}
      <svg
        className="absolute inset-0 w-full h-full text-saffron-500/15 animate-spin-slow pointer-events-none"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animationDuration: '90s' }}
      >
        <circle cx="200" cy="200" r="170" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
        <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="1" />
        {[...Array(24)].map((_, i) => (
          <line
            key={i}
            x1="200"
            y1="200"
            x2={200 + 170 * Math.cos((i * 15 * Math.PI) / 180)}
            y2={200 + 170 * Math.sin((i * 15 * Math.PI) / 180)}
            stroke="currentColor"
            strokeWidth="1.2"
          />
        ))}
      </svg>

      {/* Official Ashoka Pillar / State Emblem of India */}
      {!imgError ? (
        <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
          <img
            src="/Emblem_of_India.svg.webp"
            alt="State Emblem of India - Lion Capital of Ashoka"
            onError={() => setImgError(true)}
            className="max-w-full max-h-full object-contain filter drop-shadow-[0_15px_30px_rgba(255,107,0,0.3)] hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        /* Fallback Graphic */
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-saffron-700">
          <img
            src="/ashoka-pillar.webp"
            alt="State Emblem of India"
            className="max-w-full max-h-full object-contain filter drop-shadow-xl"
          />
        </div>
      )}
    </div>
  );
};
