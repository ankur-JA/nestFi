"use client";

import { motion } from "framer-motion";
import { useTheme } from "~~/contexts/ThemeContext";

interface NestFiLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

export default function NestFiLogo({ 
  size = "md", 
  showText = true, 
  animated = true,
  className = ""
}: NestFiLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sizeConfig = {
    sm: { icon: 28, fontSize: 18, gap: 8 },
    md: { icon: 32, fontSize: 22, gap: 10 },
    lg: { icon: 40, fontSize: 28, gap: 12 },
    xl: { icon: 48, fontSize: 34, gap: 14 }
  };

  const config = sizeConfig[size];
  
  const LogoWrapper = animated ? motion.div : "div";
  
  return (
    <LogoWrapper
      className={`flex items-center ${className}`}
      style={{ gap: config.gap }}
      {...(animated && {
        whileHover: { scale: 1.02 },
        transition: { duration: 0.2 }
      })}
    >
      {/* Logo Mark */}
      <svg 
        width={config.icon} 
        height={config.icon} 
        viewBox="0 0 40 40" 
        fill="none"
      >
        {/* Circle background */}
        <circle cx="20" cy="20" r="18" fill="#10B981" />
        
        {/* Stylized nest curves */}
        <path 
          d="M12 26C12 26 14 20 20 20C26 20 28 26 28 26" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          fill="none"
        />
        <path 
          d="M15 22C15 22 16.5 18 20 18C23.5 18 25 22 25 22" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="20" cy="15" r="3" fill="white" />
      </svg>

      {/* Logo Text */}
      {showText && (
        <div className="flex items-baseline">
          <span 
            style={{ 
              fontSize: config.fontSize,
              fontWeight: 700,
              color: isDark ? '#ffffff' : '#0f172a',
              letterSpacing: '-0.02em',
            }}
          >
            Nest
          </span>
          <span 
            style={{ 
              fontSize: config.fontSize,
              fontWeight: 700,
              color: '#10B981',
              letterSpacing: '-0.02em',
            }}
          >
            Fi
          </span>
        </div>
      )}
    </LogoWrapper>
  );
}

export function NestFiIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#10B981" />
      <path 
        d="M12 26C12 26 14 20 20 20C26 20 28 26 28 26" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M15 22C15 22 16.5 18 20 18C23.5 18 25 22 25 22" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="15" r="3" fill="white" />
    </svg>
  );
}
