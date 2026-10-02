"use client";

import { useCallback, useState } from "react";

/**
 * Permit2-based gasless deposit flow (stub for local dev).
 * In production this would construct a Permit2 PermitSingle, request an EIP-712
 * signature from the wallet, then call GroupVault.depositWithPermit2.
 * For the demo build we keep the API shape but mark it unsupported.
 */
export const useGaslessVault = () => {
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const depositWithPermit2 = useCallback(async () => {
    setError("Gasless deposits are not yet wired on this build. Use the standard deposit flow.");
    return null;
  }, []);

  return {
    loading,
    error,
    isSupported: false,
    depositWithPermit2,
  };
};
