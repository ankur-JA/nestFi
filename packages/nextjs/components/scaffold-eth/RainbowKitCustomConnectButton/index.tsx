"use client";

// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { RevealBurnerPKModal } from "./RevealBurnerPKModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";
import { motion } from "framer-motion";
import { WalletIcon } from "@heroicons/react/24/outline";
import { SettingsDropdown } from "~~/components/SettingsDropdown";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();

  return (
    <div className="flex items-center gap-2">
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted }) => {
          const connected = mounted && account && chain;
          const blockExplorerAddressLink = account
            ? getBlockExplorerAddressLink(targetNetwork, account.address)
            : undefined;

          return (
            <>
              {(() => {
                if (!connected) {
                  return (
                    <motion.button
                      onClick={openConnectModal}
                      className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <WalletIcon className="w-4 h-4" />
                      Connect
                    </motion.button>
                  );
                }

                if (chain.unsupported || chain.id !== targetNetwork.id) {
                  return <WrongNetworkDropdown />;
                }

                return (
                  <div className="flex items-center gap-2">
                    {/* Balance & Network Pill */}
                    <motion.div 
                      className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-white/[0.08]"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Network indicator dot */}
                      <div 
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: networkColor }}
                      />
                      <Balance 
                        address={account.address as Address} 
                        className="min-h-0 h-auto text-white font-medium text-sm" 
                      />
                    </motion.div>
                    
                    {/* Address Dropdown */}
                    <AddressInfoDropdown
                      address={account.address as Address}
                      displayName={account.displayName}
                      ensAvatar={account.ensAvatar}
                      blockExplorerAddressLink={blockExplorerAddressLink}
                    />
                    <AddressQRCodeModal address={account.address as Address} modalId="qrcode-modal" />
                    <RevealBurnerPKModal />
                  </div>
                );
              })()}
            </>
          );
        }}
      </ConnectButton.Custom>
      
      {/* Settings Button */}
      <SettingsDropdown />
    </div>
  );
};
