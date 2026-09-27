import React from 'react';

export interface GeorecruitLogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon' | 'mark-only';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero' | 'custom';
  showTagline?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'white'; // white for dark backgrounds
  onClick?: () => void;
}

export const GeorecruitLogo: React.FC<GeorecruitLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = true,
  className = '',
  theme = 'light',
  onClick,
}) => {
  // Emblem Icon Only (The Stylized "G" with Pin & Avatars)
  const renderEmblem = (emblemSize: number = 44) => (
    <svg
      width={emblemSize}
      height={emblemSize}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 hover:scale-105"
    >
      <defs>
        {/* Outer Ribbon "G" Gradient 1 (Deep Blue to Royal) */}
        <linearGradient id="grOuterGrad" x1="100" y1="40" x2="320" y2="350" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B3C9B" />
          <stop offset="35%" stopColor="#0066FF" />
          <stop offset="70%" stopColor="#00B4D8" />
          <stop offset="100%" stopColor="#00D2D3" />
        </linearGradient>

        {/* Outer Ribbon Return Wing (Cyan to Electric Blue) */}
        <linearGradient id="grReturnGrad" x1="130" y1="310" x2="350" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00D2D3" />
          <stop offset="45%" stopColor="#0096C7" />
          <stop offset="100%" stopColor="#0066FF" />
        </linearGradient>

        {/* Upper Right Team Icons Gradient (Violet / Purple) */}
        <linearGradient id="grTeamGrad" x1="260" y1="90" x2="340" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="60%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Center Map Pin Gradient */}
        <linearGradient id="grPinGrad" x1="150" y1="110" x2="250" y2="295" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F4C81" />
          <stop offset="40%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#082846" />
        </linearGradient>

        {/* Pin Inner Shadow Filter */}
        <filter id="grGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#00D2D3" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* 1. Base Ground Glow / Shadow Ellipse underneath the pin */}
      <ellipse
        cx="200"
        cy="338"
        rx="40"
        ry="8"
        fill="none"
        stroke="#00C4D8"
        strokeWidth="6"
        strokeDasharray="9 3"
        opacity="0.95"
      />
      <ellipse
        cx="200"
        cy="338"
        rx="22"
        ry="4"
        fill="#00C4D8"
        opacity="0.4"
      />

      {/* 2. Main Outer "G" Swirl (The large sweeping ribbon) */}
      {/* Top and left arc forming the outer "G" */}
      <path
        d="M 235 48 
           C 150 45, 70 115, 62 205 
           C 54 290, 120 355, 202 355 
           C 255 355, 305 320, 332 272 
           L 302 248 
           C 280 290, 240 318, 196 318 
           C 142 318, 102 272, 106 210 
           C 110 148, 160 92, 230 92 
           C 260 92, 290 105, 312 126 
           L 344 98 
           C 314 70, 276 50, 235 48 Z"
        fill="url(#grOuterGrad)"
      />

      {/* Right cross-bar of "G" swooping towards center */}
      <path
        d="M 205 285 
           C 240 285, 290 260, 320 220 
           L 358 220 
           C 340 270, 280 325, 205 325 
           C 165 325, 130 305, 110 275 
           L 138 250 
           C 152 272, 178 285, 205 285 Z"
        fill="url(#grReturnGrad)"
      />

      {/* 3. Small Group of Team / Candidate Figures (3 members on upper right) */}
      {/* Center Figure */}
      <circle cx="304" cy="118" r="13" fill="url(#grTeamGrad)" />
      <path
        d="M 286 150 C 286 138, 294 133, 304 133 C 314 133, 322 138, 322 150 Z"
        fill="url(#grTeamGrad)"
      />

      {/* Left Figure */}
      <circle cx="276" cy="130" r="10" fill="url(#grTeamGrad)" />
      <path
        d="M 262 154 C 262 144, 268 141, 276 141 C 284 141, 290 144, 290 154 Z"
        fill="url(#grTeamGrad)"
      />

      {/* Right Figure */}
      <circle cx="332" cy="130" r="10" fill="url(#grTeamGrad)" />
      <path
        d="M 318 154 C 318 144, 324 141, 332 141 C 340 141, 346 144, 346 154 Z"
        fill="url(#grTeamGrad)"
      />

      {/* 4. Center Location Pin (Teardrop pointing to bottom center) */}
      <g filter="url(#grGlow)">
        {/* Pin Body */}
        <path
          d="M 200 115 
             C 162 115, 138 146, 138 184 
             C 138 224, 185 280, 200 326 
             C 215 280, 262 224, 262 184 
             C 262 146, 238 115, 200 115 Z"
          fill="url(#grPinGrad)"
        />

        {/* Pin Inner White Circle */}
        <circle cx="200" cy="180" r="38" fill="#FFFFFF" />

        {/* Candidate Profile Avatar inside white circle (Head & Torso with Tie) */}
        {/* Head */}
        <circle cx="200" cy="168" r="13.5" fill="#0A2540" />

        {/* Shoulders / Torso with tie cut-out */}
        <path
          d="M 178 206 
             C 180 190, 190 184, 200 184 
             C 210 184, 220 190, 222 206 
             Z"
          fill="#0A2540"
        />
        {/* White Tie Collar Cutout */}
        <path
          d="M 197 184 L 203 184 L 201.5 197 L 200 203 L 198.5 197 Z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );

  // Styled Wordmark: "Georecruit" with the stylized map-pin "o" containing cyan center dot
  const renderWordmark = (fontSizeClass: string = 'text-2xl') => {
    const isDarkText = theme === 'light';
    const geoColor = isDarkText ? 'text-[#082846]' : 'text-white';
    const recruitColor = isDarkText ? 'text-[#0066FF]' : 'text-[#38BDF8]';
    const pinBodyColor = isDarkText ? '#082846' : '#FFFFFF';

    return (
      <div className={`font-extrabold tracking-tight font-sans flex items-center leading-none select-none ${fontSizeClass}`}>
        {/* "Ge" */}
        <span className={geoColor}>Ge</span>

        {/* The stylized "o" shaped as a Map Pin with vibrant cyan dot in center */}
        <span className="inline-flex items-center justify-center mx-[0.5px] relative" style={{ top: '-1px' }}>
          <svg
            className="w-[1.08em] h-[1.08em] inline-block"
            viewBox="0 0 32 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Map Pin Teardrop Body */}
            <path
              d="M 16 2 
                 C 8.5 2, 3.5 7.8, 3.5 15.2 
                 C 3.5 22.4, 12 28.5, 16 34.5 
                 C 20 28.5, 28.5 22.4, 28.5 15.2 
                 C 28.5 7.8, 23.5 2, 16 2 Z"
              fill={pinBodyColor}
            />
            {/* Glowing Cyan Inner Dot */}
            <circle cx="16" cy="15" r="5.5" fill="#00D2D3" />
          </svg>
        </span>

        {/* "recruit" */}
        <span className={recruitColor}>recruit</span>
      </div>
    );
  };

  // Tagline: "Find  •  Hire  •  Grow"
  const renderTagline = (taglineClass: string = 'text-[11px]') => {
    const isDark = theme === 'light';
    const textColor = isDark ? 'text-[#475569]' : 'text-white/80';
    const bulletColor = isDark ? 'text-[#0066FF]' : 'text-[#38BDF8]';

    return (
      <div className={`font-semibold tracking-[0.16em] uppercase flex items-center justify-center gap-2 select-none ${taglineClass} ${textColor}`}>
        <span>Find</span>
        <span className={`${bulletColor} font-black`}>•</span>
        <span>Hire</span>
        <span className={`${bulletColor} font-black`}>•</span>
        <span>Grow</span>
      </div>
    );
  };

  // Determine size classes
  const sizeConfig = {
    xs: { emblem: 26, wordmark: 'text-sm', tagline: 'text-[8px]', gap: 'gap-1.5' },
    sm: { emblem: 32, wordmark: 'text-base', tagline: 'text-[9px]', gap: 'gap-2' },
    md: { emblem: 42, wordmark: 'text-xl', tagline: 'text-[10px]', gap: 'gap-2.5' },
    lg: { emblem: 56, wordmark: 'text-2xl', tagline: 'text-xs', gap: 'gap-3' },
    xl: { emblem: 72, wordmark: 'text-3xl sm:text-4xl', tagline: 'text-sm', gap: 'gap-3.5' },
    '2xl': { emblem: 96, wordmark: 'text-4xl sm:text-5xl', tagline: 'text-base', gap: 'gap-4' },
    hero: { emblem: 120, wordmark: 'text-4xl sm:text-6xl', tagline: 'text-base sm:text-lg', gap: 'gap-4' },
    custom: { emblem: 42, wordmark: 'text-xl', tagline: 'text-xs', gap: 'gap-2.5' },
  }[size];

  // VARIANTS
  if (variant === 'icon') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 cursor-pointer ${className}`}
        onClick={onClick}
        title="Georecruit"
      >
        {renderEmblem(sizeConfig.emblem)}
      </div>
    );
  }

  if (variant === 'mark-only') {
    return (
      <div
        className={`inline-flex flex-col items-start cursor-pointer ${className}`}
        onClick={onClick}
        title="Georecruit - Find • Hire • Grow"
      >
        {renderWordmark(sizeConfig.wordmark)}
        {showTagline && <div className="mt-1">{renderTagline(sizeConfig.tagline)}</div>}
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={`inline-flex flex-col items-center justify-center text-center cursor-pointer ${className}`}
        onClick={onClick}
        title="Georecruit - Find • Hire • Grow"
      >
        {renderEmblem(sizeConfig.emblem)}
        <div className="mt-2.5 space-y-1">
          {renderWordmark(sizeConfig.wordmark)}
          {showTagline && renderTagline(sizeConfig.tagline)}
        </div>
      </div>
    );
  }

  // Default: Horizontal
  return (
    <div
      className={`inline-flex items-center ${sizeConfig.gap} cursor-pointer shrink-0 ${className}`}
      onClick={onClick}
      title="Georecruit - Find • Hire • Grow"
    >
      {renderEmblem(sizeConfig.emblem)}
      <div className="flex flex-col items-start justify-center">
        {renderWordmark(sizeConfig.wordmark)}
        {showTagline && (
          <div className="mt-0.5">
            {renderTagline(sizeConfig.tagline)}
          </div>
        )}
      </div>
    </div>
  );
};
