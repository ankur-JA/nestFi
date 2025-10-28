import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { 
  CurrencyDollarIcon, 
  MagnifyingGlassIcon,
  HeartIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  BookOpenIcon,
  UserGroupIcon,
  CodeBracketIcon
} from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";
import NestFiLogo from "~~/components/NestFiLogo";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer with comprehensive sections
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <>
      {/* Development Tools Bar */}
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div>
                <div className="btn btn-primary btn-sm font-normal gap-1 cursor-auto">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span>{nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link href="/blockexplorer" passHref className="btn btn-primary btn-sm font-normal gap-1">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div>
          <SwitchTheme className={`pointer-events-auto ${isLocalNetwork ? "self-end md:self-auto" : ""}`} />
        </div>
      </div>
      </div>

      {/* Main Footer */}
      <footer className="bg-base-200 border-t border-base-300">
        <div className="max-w-6xl mx-auto px-6 py-16">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            
            {/* Product Section */}
            <div>
              <h3 className="text-sm font-semibold text-base-content uppercase tracking-wider mb-6">
                Product
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/createvault" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    Create Vault
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    DeFi Strategies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Section */}
            <div>
              <h3 className="text-sm font-semibold text-base-content uppercase tracking-wider mb-6">
                Company
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/about" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    About
                  </Link>
                </li>
                <li>
                  <a href="https://nestfi.io/team" target="_blank" rel="noreferrer" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    Team
                  </a>
                </li>
                <li>
                  <a href="https://nestfi.io/careers" target="_blank" rel="noreferrer" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Section */}
            <div>
              <h3 className="text-sm font-semibold text-base-content uppercase tracking-wider mb-6">
                Resources
              </h3>
              <ul className="space-y-4">
                <li>
                  <a href="https://docs.nestfi.io" target="_blank" rel="noreferrer" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/your-org/nestfi" target="_blank" rel="noreferrer" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    GitHub
                  </a>
                </li>
                <li>
                  <Link href="/blockexplorer" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    Block Explorer
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div>
              <h3 className="text-sm font-semibold text-base-content uppercase tracking-wider mb-6">
                Legal
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/privacy" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-base-300">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              
              {/* Logo and Copyright */}
              <div className="flex items-center gap-4">
                <NestFiLogo className="h-10 w-10 flex-shrink-0" />
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-base-content leading-tight">NestFi Protocol</p>
                  <p className="text-xs text-base-content/60 mt-1">© 2024 NestFi Labs, Inc. All Rights Reserved.</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a 
                  href="https://github.com/your-org/nestfi" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-base-content/60 hover:text-primary transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>

                <a 
                  href="https://twitter.com/nestfi" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-base-content/60 hover:text-primary transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                <a 
                  href="https://discord.gg/nestfi" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-base-content/60 hover:text-primary transition-colors duration-200"
                  aria-label="Discord"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                </a>

                <a 
                  href="mailto:contact@nestfi.io"
                  className="text-sm text-base-content/60 hover:text-primary transition-colors duration-200"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
      </div>
      </footer>
    </>
  );
};
