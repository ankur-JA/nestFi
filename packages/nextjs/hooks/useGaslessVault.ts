import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useTransaction } from "wagmi";
import { parseUnits } from "viem";
import deployedContracts from "../contracts/deployedContracts";
import { useERC7702 } from "./useERC7702";

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
  
  const { executeWithGasPayment, estimateGasCost } = useERC7702();

  const { writeContract: executePermit2, data: permit2Data, isPending: permit2Loading } = useWriteContract();
  const { isLoading: permit2TxLoading, isSuccess: permit2Success } = useTransaction({
    hash: permit2Data,
  });

  /**
   * Complete gasless deposit flow using both Permit2 and ERC-7702
   */
  const gaslessDeposit = useCallback(async (params: GaslessDepositParams) => {
    if (!userAddress) {
      setError("User address not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { vaultAddress, assets, receiver, gasToken, gasAmount, permit2Data } = params;

      // Step 1: If Permit2 data is provided, execute permit first
      if (permit2Data) {
        await executePermit2({
          address: deployedContracts[31337]?.Permit2?.address as `0x${string}`,
          abi: deployedContracts[31337]?.Permit2?.abi || [],
          functionName: "permit",
          args: [
            permit2Data.owner,
            permit2Data.spender,
            permit2Data.value,
            permit2Data.deadline,
            permit2Data.v,
            permit2Data.r,
            permit2Data.s,
          ],
        });
      }

      // Step 2: Execute deposit with ERC-7702 gas payment
      await executeWithGasPayment(
        vaultAddress,
        {
          functionName: "depositWithERC7702",
          args: [parseUnits(assets, 6), receiver],
        } as any,
        gasToken,
        gasAmount
      );

    } catch (err) {
      setError("Failed to execute gasless deposit");
      console.error("Gasless deposit error:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, executeWithGasPayment, executePermit2]);

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
        chainId: 31337,
        verifyingContract: deployedContracts[31337]?.Permit2?.address,
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

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer._signTypedData(domain, types, message);

      // Split signature into v, r, s
      const sig = ethers.Signature.from(signature);

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
    assetToken: string,
    gasToken: string,
    gasAmount: string
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
        gasToken,
        gasAmount,
        permit2Data,
      });

    } catch (err) {
      setError("Failed to execute gasless deposit with permit");
      console.error("Gasless deposit with permit error:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, createPermit2Signature, gaslessDeposit]);

  /**
   * Gasless withdraw using ERC-7702
   */
  const gaslessWithdraw = useCallback(async (
    vaultAddress: string,
    shares: string,
    receiver: string,
    owner: string,
    gasToken: string,
    gasAmount: string
  ) => {
    if (!userAddress) {
      setError("User address not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await executeWithGasPayment(
        vaultAddress,
        {
          functionName: "withdrawWithERC7702",
          args: [parseUnits(shares, 18), receiver, owner],
        } as any,
        gasToken,
        gasAmount
      );

    } catch (err) {
      setError("Failed to execute gasless withdraw");
      console.error("Gasless withdraw error:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, executeWithGasPayment]);

  return {
    // Core functions
    gaslessDeposit,
    gaslessDepositWithPermit,
    gaslessWithdraw,
    
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
