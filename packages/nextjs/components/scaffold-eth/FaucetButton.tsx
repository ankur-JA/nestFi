"use client";

import { useState } from "react";
import { createWalletClient, http, parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { motion } from "framer-motion";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "1";
const FAUCET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const localWalletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});

/**
 * FaucetButton button which lets you grab eth.
 */
export const FaucetButton = () => {
  const { address, chain: ConnectedChain } = useAccount();

  const { data: balance } = useWatchBalance({ address });

  const [loading, setLoading] = useState(false);

  const faucetTxn = useTransactor(localWalletClient);

  const sendETH = async () => {
    if (!address) return;
    try {
      setLoading(true);
      await faucetTxn({
        account: FAUCET_ADDRESS,
        to: address,
        value: parseEther(NUM_OF_ETH),
      });
      setLoading(false);
    } catch (error) {
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
      setLoading(false);
    }
  };

  // Render only on local chain
  if (ConnectedChain?.id !== hardhat.id) {
    return null;
  }

  const isBalanceZero = balance && balance.value === 0n;

  return (
    <motion.div
      className={
        !isBalanceZero
          ? "relative group"
          : "relative group tooltip tooltip-bottom tooltip-primary tooltip-open font-bold before:left-auto before:transform-none before:content-[attr(data-tip)] before:-translate-x-2/5"
      }
      data-tip="Grab funds from faucet"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.button 
        className={`relative px-3 py-2 rounded-lg font-semibold transition-all duration-300 overflow-hidden text-sm ${
          isBalanceZero 
            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40" 
            : "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 hover:text-white hover:from-gray-600 hover:to-gray-700"
        }`}
        onClick={sendETH} 
        disabled={loading}
      >
        <motion.div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isBalanceZero 
              ? "bg-gradient-to-r from-yellow-600 to-orange-600" 
              : "bg-gradient-to-r from-gray-600 to-gray-700"
          }`}
          style={{ zIndex: -1 }}
        />
        <span className="relative z-10 flex items-center gap-1.5">
          {!loading ? (
            <motion.div
              animate={{ rotate: isBalanceZero ? 360 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <BanknotesIcon className="h-3.5 w-3.5" />
            </motion.div>
          ) : (
            <span className="loading loading-spinner loading-xs"></span>
          )}
          {isBalanceZero && <span className="text-xs">Faucet</span>}
        </span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ zIndex: -1 }}
        />
      </motion.button>
    </motion.div>
  );
};
