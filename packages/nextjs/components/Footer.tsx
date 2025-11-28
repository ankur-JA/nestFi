"use client";

import React from "react";
import Link from "next/link";
import NestFiLogo from "~~/components/NestFiLogo";
import { useTheme } from "~~/contexts/ThemeContext";

/**
 * Premium fintech footer - full width with theme support
 */
export const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer 
      className="relative transition-colors duration-300"
      style={{ 
        background: isDark ? '#050507' : '#f8fafc',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      {/* Subtle gradient accent */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark 
            ? 'linear-gradient(to bottom, rgba(20,184,166,0.02), transparent)'
            : 'linear-gradient(to bottom, rgba(16,185,129,0.03), transparent)',
        }}
      />
      
      <div className="relative">
        {/* Main Footer Content */}
        <div className="px-8 lg:px-16 xl:px-24 py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="col-span-2">
              <NestFiLogo size="md" animated={false} />
              <p 
                className="mt-4 text-sm max-w-xs leading-relaxed"
                style={{ color: isDark ? '#6b7280' : '#64748b' }}
              >
                The decentralized asset management protocol. Pool funds, deploy strategies, and grow together.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3 mt-6">
                {[
                  { href: "https://twitter.com", icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  )},
                  { href: "https://discord.com", icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  )},
                  { href: "https://github.com", icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                  )},
                  { href: "https://t.me", icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  )},
                ].map((social, i) => (
                  <a 
                    key={i}
                    href={social.href} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 rounded-lg transition-all"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                      color: isDark ? '#6b7280' : '#64748b',
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                Product
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "/investor", label: "Invest" },
                  { href: "/curator", label: "Create Vault" },
                  { href: "/about", label: "About" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-sm transition-colors"
                      style={{ color: isDark ? '#6b7280' : '#64748b' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                Resources
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "https://docs.nestfi.io", label: "Documentation", external: true },
                  { href: "https://github.com", label: "GitHub", external: true },
                  { href: "/blockexplorer", label: "Explorer" },
                  { href: "#", label: "Audit Reports" },
                ].map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a 
                        href={link.href} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-sm transition-colors"
                        style={{ color: isDark ? '#6b7280' : '#64748b' }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link 
                        href={link.href} 
                        className="text-sm transition-colors"
                        style={{ color: isDark ? '#6b7280' : '#64748b' }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                Legal
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/security", label: "Security" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-sm transition-colors"
                      style={{ color: isDark ? '#6b7280' : '#64748b' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                Stay Updated
              </h3>
              <p 
                className="text-sm mb-3"
                style={{ color: isDark ? '#6b7280' : '#64748b' }}
              >
                Get the latest updates
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                />
                <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-sm font-medium rounded-lg transition-all">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="px-8 lg:px-16 xl:px-24 py-6"
          style={{
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <p 
                className="text-sm"
                style={{ color: isDark ? '#6b7280' : '#64748b' }}
              >
                © 2025 NestFi Labs. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <span 
                className="flex items-center gap-2 text-sm"
                style={{ color: isDark ? '#6b7280' : '#64748b' }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                All systems operational
              </span>
              <span style={{ color: isDark ? '#374151' : '#cbd5e1' }}>|</span>
              <span 
                className="text-sm"
                style={{ color: isDark ? '#6b7280' : '#64748b' }}
              >
                Built on <span className="text-emerald-500">Ethereum</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
