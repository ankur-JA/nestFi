"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  BeakerIcon,
  LanguageIcon,
  EyeIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useTheme } from "~~/contexts/ThemeContext";

type Language = "English" | "Spanish" | "French" | "German" | "Japanese" | "Chinese";

export const SettingsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [watchWalletInput, setWatchWalletInput] = useState("");
  const [showWatchWallet, setShowWatchWallet] = useState(false);
  
  const { theme, toggleTheme, testnetMode, setTestnetMode, language, setLanguage } = useTheme();
  const isDarkMode = theme === "dark";
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dropdownRef as React.RefObject<HTMLElement>, () => {
    setIsOpen(false);
    setShowLanguages(false);
    setShowWatchWallet(false);
  });

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLanguages(false);
  };

  const languages: Language[] = ["English", "Spanish", "French", "German", "Japanese", "Chinese"];

  return (
    <div ref={dropdownRef} className="relative">
      {/* Settings Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl border transition-all duration-200 ${
          isOpen 
            ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border-emerald-500/30 text-emerald-400" 
            : "bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(to bottom right, #0f1318, #0a0d10)' 
                : 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 border-b"
              style={{
                borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                background: isDarkMode ? 'rgba(20,184,166,0.03)' : 'rgba(20,184,166,0.05)',
              }}
            >
              <h3 className="text-sm font-medium" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                Global settings
              </h3>
            </div>

            {/* Settings List */}
            <div className="p-2">
              {/* Dark Mode Toggle */}
              <div 
                className="flex items-center justify-between px-3 py-3 rounded-xl transition-colors"
                style={{ 
                  background: 'transparent',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-1.5 rounded-lg"
                    style={{ background: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(251,191,36,0.2)' }}
                  >
                    {isDarkMode ? (
                      <MoonIcon className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <SunIcon className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <span style={{ color: isDarkMode ? '#ffffff' : '#0f172a', fontWeight: 500, fontSize: '0.875rem' }}>
                    {isDarkMode ? 'Dark mode' : 'Light mode'}
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative w-11 h-6 rounded-full transition-all duration-300"
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(to right, #14b8a6, #10b981)' 
                      : '#d1d5db',
                    boxShadow: isDarkMode ? '0 0 12px rgba(16,185,129,0.3)' : 'none',
                  }}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{ left: isDarkMode ? "calc(100% - 22px)" : "2px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Testnet Mode Toggle */}
              <div 
                className="flex items-center justify-between px-3 py-3 rounded-xl transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-1.5 rounded-lg"
                    style={{ background: testnetMode ? 'rgba(168,85,247,0.2)' : 'rgba(107,114,128,0.2)' }}
                  >
                    <BeakerIcon className={`h-4 w-4 ${testnetMode ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <span style={{ color: isDarkMode ? '#ffffff' : '#0f172a', fontWeight: 500, fontSize: '0.875rem' }}>
                    Testnet mode
                  </span>
                </div>
                <button
                  onClick={() => setTestnetMode(!testnetMode)}
                  className="relative w-11 h-6 rounded-full transition-all duration-300"
                  style={{
                    background: testnetMode 
                      ? 'linear-gradient(to right, #14b8a6, #10b981)' 
                      : isDarkMode ? '#374151' : '#d1d5db',
                    boxShadow: testnetMode ? '0 0 12px rgba(16,185,129,0.3)' : 'none',
                  }}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{ left: testnetMode ? "calc(100% - 22px)" : "2px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Language */}
              <button
                onClick={() => setShowLanguages(!showLanguages)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg" style={{ background: 'rgba(59,130,246,0.2)' }}>
                    <LanguageIcon className="h-4 w-4 text-blue-400" />
                  </div>
                  <span style={{ color: isDarkMode ? '#ffffff' : '#0f172a', fontWeight: 500, fontSize: '0.875rem' }}>
                    Language
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{language}</span>
                  <ChevronRightIcon className={`h-4 w-4 transition-transform ${showLanguages ? "rotate-90" : ""}`} style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }} />
                </div>
              </button>

              {/* Language Options */}
              <AnimatePresence>
                {showLanguages && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div 
                      className="ml-10 pl-3 space-y-0.5 py-2"
                      style={{ borderLeft: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => selectLanguage(lang)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                          style={{
                            background: language === lang 
                              ? (isDarkMode ? 'rgba(20,184,166,0.15)' : 'rgba(20,184,166,0.1)')
                              : 'transparent',
                            color: language === lang 
                              ? '#10b981'
                              : (isDarkMode ? '#9ca3af' : '#6b7280'),
                            border: language === lang ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                          }}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Watch Wallet */}
              <button
                onClick={() => setShowWatchWallet(!showWatchWallet)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg" style={{ background: 'rgba(6,182,212,0.2)' }}>
                    <EyeIcon className="h-4 w-4 text-cyan-400" />
                  </div>
                  <span style={{ color: isDarkMode ? '#ffffff' : '#0f172a', fontWeight: 500, fontSize: '0.875rem' }}>
                    Watch wallet
                  </span>
                </div>
                <ChevronRightIcon className={`h-4 w-4 transition-transform ${showWatchWallet ? "rotate-90" : ""}`} style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }} />
              </button>

              {/* Watch Wallet Input */}
              <AnimatePresence>
                {showWatchWallet && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 py-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Address or ENS name"
                          value={watchWalletInput}
                          onChange={(e) => setWatchWalletInput(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
                          style={{
                            background: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                            color: isDarkMode ? '#ffffff' : '#0f172a',
                          }}
                        />
                        {watchWalletInput && (
                          <button
                            onClick={() => setWatchWalletInput("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <button
                        disabled={!watchWalletInput}
                        className="w-full mt-2 px-4 py-2 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                        style={{
                          background: watchWalletInput 
                            ? 'linear-gradient(to right, #14b8a6, #10b981)'
                            : (isDarkMode ? '#374151' : '#d1d5db'),
                          boxShadow: watchWalletInput ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                        }}
                      >
                        Watch
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div 
              className="px-4 py-2.5 border-t"
              style={{
                borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <p className="text-[11px] text-center" style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}>
                Settings saved locally
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
