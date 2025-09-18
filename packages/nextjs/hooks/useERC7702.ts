import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useTransaction } from "wagmi";
import { parseUnits } from "viem";
import deployedContracts from "../contracts/deployedContracts";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);





export const useERC7702 = () => {
  const { address: userAddress } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract: executeERC7702, data: txData, isPending: isExecuting } = useWriteContract();
  const { isLoading: txLoading, isSuccess: txSuccess, data: txReceipt } = useTransaction({
    hash: txData,
  });

  /**
   * Create gas payment signature for ERC-7702
   */
  const createGasPaymentSignature = useCallback(async (
    user: string,
    token: string,
    amount: string,
    deadline: number,
    nonce: number
  ): Promise<string> => {
    try {
      const domain = {
        name: "ERC7702Relayer",
        version: "1",
        chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111),
        verifyingContract: (deployedContracts as any)[CHAIN_ID]?.ERC7702Relayer?.address,
      };

      const types = {
        GasPayment: [
          { name: "user", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const message = {
        user,
        token,
        amount,
        deadline,
        nonce,
      };

      // Get the signer from window.ethereum
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
        account: userAddress as `0x${string}`,
        domain,
        types,
        primaryType: 'GasPayment',
        message
      });
      return signature;
    } catch (err) {
      console.error("Error creating gas payment signature:", err);
      throw err;
    }
  }, []);

  /**
   * Execute a transaction with ERC-7702 gas payment
   */
  const executeWithGasPayment = useCallback(async (
    target: string,
    data: string,
    token: string,
    amount: string
  ) => {
    if (!userAddress) {
      setError("User address not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get current nonce
      const nonce = 0; // You would get this from the contract
      
      // Set deadline to 1 hour from now
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Create gas payment signature
      const signature = await createGasPaymentSignature(
        userAddress,
        token,
        amount,
        deadline,
        nonce
      );

      const gasPayment = {
        user: userAddress,
        token,
        amount: BigInt(amount),
        deadline: BigInt(deadline),
        signature,
      };

      // Execute the transaction
      executeERC7702({
        address: ((deployedContracts as any)[CHAIN_ID]?.ERC7702Relayer?.address) as `0x${string}`,
        abi: ((deployedContracts as any)[CHAIN_ID]?.ERC7702Relayer?.abi) || [],
        functionName: "executeWithGasPayment",
        args: [target, data, gasPayment],
      });

    } catch (err) {
      setError("Failed to execute ERC-7702 transaction");
      console.error("ERC-7702 execution error:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, createGasPaymentSignature, executeERC7702]);

  /**
   * Deposit to vault with ERC-7702 gas payment
   */
  const depositWithERC7702 = useCallback(async (
    vaultAddress: string,
    assets: string,
    receiver: string,
    token: string,
    gasAmount: string
  ) => {
    try {
      // Encode the deposit function call
      const depositData = {
        address: vaultAddress as `0x${string}`,
        abi: ((deployedContracts as any)[CHAIN_ID]?.GroupVault?.abi) || [],
        functionName: "depositWithERC7702",
        args: [parseUnits(assets, 6), receiver], // Assuming 6 decimals for USDC
      };

      // Execute with gas payment
      await executeWithGasPayment(
        vaultAddress,
        depositData as any,
        token,
        gasAmount
      );

    } catch (err) {
      setError("Failed to deposit with ERC-7702");
      console.error("ERC-7702 deposit error:", err);
    }
  }, [executeWithGasPayment]);

  /**
   * Withdraw from vault with ERC-7702 gas payment
   */
  const withdrawWithERC7702 = useCallback(async (
    vaultAddress: string,
    shares: string,
    receiver: string,
    owner: string,
    token: string,
    gasAmount: string
  ) => {
    try {
      // Encode the withdraw function call
      const withdrawData = {
        address: vaultAddress as `0x${string}`,
        abi: ((deployedContracts as any)[CHAIN_ID]?.GroupVault?.abi) || [],
        functionName: "withdrawWithERC7702",
        args: [parseUnits(shares, 18), receiver, owner], // Shares have 18 decimals
      };

      // Execute with gas payment
      await executeWithGasPayment(
        vaultAddress,
        withdrawData as any,
        token,
        gasAmount
      );

    } catch (err) {
      setError("Failed to withdraw with ERC-7702");
      console.error("ERC-7702 withdraw error:", err);
    }
  }, [executeWithGasPayment]);

  /**
   * Estimate gas cost in tokens
   */
  const estimateGasCost = useCallback(async (): Promise<string> => {
    try {
      // This would call the contract's estimateGasCostInToken function
      // For now, return a placeholder
      return "0.001"; // 0.001 USDC
    } catch (err) {
      console.error("Error estimating gas cost:", err);
      return "0";
    }
  }, []);

  return {
    executeWithGasPayment,
    depositWithERC7702,
    withdrawWithERC7702,
    estimateGasCost,
    createGasPaymentSignature,
    loading: loading || isExecuting || txLoading,
    success: txSuccess,
    error,
    setError,
    receipt: txReceipt,
  };
};
