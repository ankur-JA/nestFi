"use client";

import { motion } from "framer-motion";

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
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  };

  const LogoContainer = animated ? motion.div : "div";
  
  return (
    <LogoContainer
      className={`flex items-center space-x-3 ${className}`}
      {...(animated && {
        whileHover: { scale: 1.05, rotate: 2 },
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5 }
      })}
    >
      {/* Logo Icon */}
      <div className="relative group">
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
        
        {/* Main icon container */}
        <div className={`relative ${sizeClasses[size]} bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden`}>
          {/* Animated background pattern */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          )}
          
          {/* Nest icon */}
          <div className="relative z-10">
            <svg className={`${size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : size === "lg" ? "w-8 h-8" : "w-10 h-10"} text-white`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          
          {/* Floating particles for larger sizes */}
          {size !== "sm" && animated && (
            <>
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute ${size === "md" ? "top-1 right-1 w-1 h-1" : size === "lg" ? "top-1.5 right-1.5 w-1.5 h-1.5" : "top-2 right-2 w-2 h-2"} bg-yellow-400 rounded-full`}
              />
              <motion.div
                animate={{ y: [2, -2, 2] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className={`absolute ${size === "md" ? "bottom-1 left-1 w-0.5 h-0.5" : size === "lg" ? "bottom-1.5 left-1.5 w-1 h-1" : "bottom-2 left-2 w-1.5 h-1.5"} bg-blue-400 rounded-full`}
              />
            </>
          )}
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 ${textSizes[size]}`}>
            NestFi
          </div>
          {size === "lg" || size === "xl" && (
            <div className="text-xs text-gray-400">DeFi Vaults</div>
          )}
        </div>
      )}
    </LogoContainer>
  );
}
