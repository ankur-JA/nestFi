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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            
            {/* Product Section */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-sm font-semibold text-base-content uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link href="/createvault" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <span>Create Vault</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <span>DeFi Strategies</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Section */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-sm font-semibold text-base-content uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <InformationCircleIcon className="h-4 w-4" />
                    <span>About</span>
                  </Link>
                </li>
                <li>
                  <a href="https://github.com/your-org/nestfi" target="_blank" rel="noreferrer" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4" />
                    <span>Team</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/your-org/nestfi/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <CodeBracketIcon className="h-4 w-4" />
                    <span>Careers</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Section */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-sm font-semibold text-base-content uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://docs.nestfi.io" target="_blank" rel="noreferrer" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>Documentation</span>
                  </a>
                </li>
                <li>
                  <a href="https://blog.nestfi.io" target="_blank" rel="noreferrer" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <BookOpenIcon className="h-4 w-4" />
                    <span>Blog</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/your-org/nestfi" target="_blank" rel="noreferrer" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <CodeBracketIcon className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                </li>
                <li>
                  <Link href="/blockexplorer" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    <span>Block Explorer</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-sm font-semibold text-base-content uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>Terms of Service</span>
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span>Security</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-base-300">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              
              {/* Logo and Copyright */}
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <NestFiLogo className="h-8 w-8" />
                <div>
                  <p className="text-sm text-base-content/70">
                    © 2024 NestFi. All Rights Reserved.
                  </p>
                </div>
              </div>

              {/* Social Links and Contact */}
              <div className="flex items-center space-x-6">
                {/* GitHub */}
                <a 
                  href="https://github.com/your-org/nestfi" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-base-content/70 hover:text-base-content transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>

                {/* Twitter/X */}
                <a 
                  href="https://twitter.com/nestfi" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-base-content/70 hover:text-base-content transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* Discord */}
                <a 
                  href="https://discord.gg/nestfi" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-base-content/70 hover:text-base-content transition-colors duration-200"
                  aria-label="Discord"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                </a>

                {/* Contact */}
                <a 
                  href="mailto:contact@nestfi.io"
                  className="text-base-content/70 hover:text-base-content transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="text-sm">Contact</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Built with Love Section */}
            <div className="mt-6 pt-6 border-t border-base-300">
              <div className="flex justify-center items-center gap-2 text-sm text-base-content/70">
                <span>Built with</span>
                <HeartIcon className="inline-block h-4 w-4 text-red-500" />
                <span>using</span>
                <a
                  className="flex justify-center items-center gap-1 hover:text-base-content transition-colors duration-200"
                  href="https://scaffoldeth.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="link">Scaffold-ETH 2</span>
                </a>
                <span>&</span>
                <a
                  className="flex justify-center items-center gap-1 hover:text-base-content transition-colors duration-200"
                href="https://buidlguidl.com/"
                target="_blank"
                rel="noreferrer"
              >
                <BuidlGuidlLogo className="w-3 h-5 pb-1" />
                <span className="link">BuidlGuidl</span>
              </a>
            </div>
            </div>
          </div>
      </div>
      </footer>
    </>
  );
};
