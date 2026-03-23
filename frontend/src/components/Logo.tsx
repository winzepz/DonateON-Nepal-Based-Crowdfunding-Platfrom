import React from 'react';

interface LogoProps {
  className?: string;
  textSize?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  textSize = "text-2xl"
}) => {
  return (
    <div className={`flex items-center group select-none ${className}`}>
      {/* Premium Typographic Logo */}
      <h1 className={`${textSize} font-black tracking-tighter sm:tracking-[-0.05em] font-display flex items-baseline leading-none py-2 relative`}>
        {/* The "Donate" Part */}
        <span className="text-white group-hover:text-primary transition-all duration-500 relative z-10">
          Donate
        </span>
        
        {/* The "ON" Part - Styled as a badge-like element or high-contrast text */}
        <div className="relative ml-0.5 flex items-baseline">
          <span className="text-primary group-hover:text-white transition-all duration-500 relative z-10">
            ON
          </span>
          
          {/* Signature Dot / Accent */}
          <div className="ml-1 h-2 w-2 rounded-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse group-hover:scale-150 transition-transform duration-500" />
          
          {/* Subtle underline for the ON part */}
          <div className="absolute -bottom-1 left-0 w-0 h-1 bg-primary rounded-full group-hover:w-full transition-all duration-500" />
        </div>

        {/* Floating background glow on hover */}
        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      </h1>
    </div>
  );
};

export default Logo;
