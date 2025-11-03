import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useTransaction } from "wagmi";
import { parseUnits } from "viem";
import deployedContracts from "../contracts/deployedContracts";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);

interface Permit2Data {
  owner: string;
  spender: string;
  value: string;
  deadline: number;
  v: number;
  r: string;
  s: string;
}

interface GaslessDepositParams {
  vaultAddress: string;
  assets: string;
  receiver: string;
  gasToken: string;
  gasAmount: string;
  permit2Data?: Permit2Data;
}

export const useGaslessVault = () => {
  const { address: userAddress } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract: executePermit2, data: permit2Data, isPending: permit2Loading } = useWriteContract();
  const { isLoading: permit2TxLoading, isSuccess: permit2Success } = useTransaction({
    hash: permit2Data,
  });

  /**
   * Complete gasless deposit flow using Permit2
   */
  const gaslessDeposit = useCallback(async (params: GaslessDepositParams) => {
    if (!userAddress) {
      setError("User address not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { vaultAddress, assets, receiver, permit2Data } = params;

      // Step 1: If Permit2 data is provided, execute permit first
      if (permit2Data) {
        // MockPermit2 has a different signature, so we'll skip this for now
        // In a real implementation, you would call the correct permit function
        console.log("Permit2 execution skipped - using mock implementation");
      }

      // Step 2: Execute regular deposit with Permit2
      executePermit2({
        address: vaultAddress as `0x${string}`,
        abi: ((deployedContracts as any)[CHAIN_ID]?.GroupVault?.abi) || [],
        functionName: "depositWithPermit2",
        args: [parseUnits(assets, 6), receiver, permit2Data],
      });

    } catch (err) {
      setError("Failed to execute gasless deposit");
      console.error("Gasless deposit error:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, executePermit2]);

  /**
   * Create Permit2 signature for token approval
   */
  const createPermit2Signature = useCallback(async (
    owner: string,
    spender: string,
    value: string,
    deadline: number
  ): Promise<Permit2Data> => {
    try {
      const domain = {
        name: "Permit2",
        version: "1",
        chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111),
        verifyingContract: (process.env.NEXT_PUBLIC_PERMIT2_ADDRESS || "0x000000000022D473030F116dDEE9F6B43aC78BA3") as `0x${string}`,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const message = {
        owner,
        spender,
        value,
        deadline,
        nonce: 0, // You would get this from the contract
      };

      if (!window.ethereum) {
        throw new Error("No wallet connected");
      }

      // Use viem for signing instead of ethers
      const { createWalletClient, custom } = await import('viem');
      const { mainnet } = await import('viem/chains');
      
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum)
      });

      const signature = await client.signTypedData({
        account: owner as `0x${string}`,
        domain,
        types,
        primaryType: 'Permit',
        message
      });

      // Split signature into v, r, s manually
      const sig = {
        v: parseInt(signature.slice(130, 132), 16),
        r: signature.slice(0, 66) as `0x${string}`,
        s: `0x${signature.slice(66, 130)}` as `0x${string}`,
      };

      return {
        owner,
        spender,
        value,
        deadline,
        v: sig.v,
        r: sig.r,
        s: sig.s,
      };
    } catch (err) {
      console.error("Error creating Permit2 signature:", err);
      throw err;
    }
  }, []);

  /**
   * Complete gasless deposit with automatic Permit2 signature
   */
  const gaslessDepositWithPermit = useCallback(async (
    vaultAddress: string,
    assets: string,
    receiver: string,
    assetToken: string
  ) => {
    if (!userAddress) {
      setError("User address not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create Permit2 signature for asset token approval
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      const permit2Data = await createPermit2Signature(
        userAddress,
        vaultAddress,
        parseUnits(assets, 6).toString(),
        deadline
      );

      // Execute complete gasless deposit
      await gaslessDeposit({
        vaultAddress,
        assets,
        receiver,
        gasToken: "",
        gasAmount: "",
        permit2Data,
      });

    } catch (err) {
      setError("Failed to execute gasless deposit with permit");
      console.error("Gasless deposit with permit error:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, createPermit2Signature, gaslessDeposit]);

  return {
    // Core functions
    gaslessDeposit,
    gaslessDepositWithPermit,
    
    // Helper functions
    createPermit2Signature,
    estimateGasCost,
    
    // State
    loading: loading || permit2Loading || permit2TxLoading,
    success: permit2Success,
    error,
    setError,
  };
};
