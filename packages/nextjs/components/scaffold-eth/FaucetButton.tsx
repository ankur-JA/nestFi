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

  const isBalanceZero = (balance?.value ?? 0n) === 0n;

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
        className="btn btn-primary btn-sm px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl hover:shadow-yellow-500/25 transition-all duration-300 border-0"
        disabled={loading}
        onClick={sendETH}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <BanknotesIcon className="h-3.5 w-3.5" />
        {isBalanceZero && <span className="ml-1">Faucet</span>}
      </motion.button>
    </motion.div>
  );
};
