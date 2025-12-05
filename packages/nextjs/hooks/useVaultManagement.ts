"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, usePublicClient } from "wagmi";
import { parseUnits, formatUnits, parseAbi } from "viem";

// GroupVault ABI - the functions we need for curator management
const VAULT_ABI = [
  // View functions
  {
    name: "totalAssets",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "asset",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    name: "paused",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    name: "strategy",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    name: "getVaultTokenBalances",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "tokens", type: "address[]" },
      { name: "balances", type: "uint256[]" },
    ],
  },
  {
    name: "getStrategyNames",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string[]" }],
  },
  {
    name: "getStrategy",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "name", type: "string" }],
    outputs: [{ type: "address" }],
  },
  {
    name: "getStrategyAssets",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "name", type: "string" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getVaultState",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "totalAssetsAmount", type: "uint256" },
      { name: "assetsInVault", type: "uint256" },
      { name: "assetsInStrategies", type: "uint256" },
      { name: "isPaused", type: "bool" },
      { name: "currentDepositCap", type: "uint256" },
      { name: "currentMinDeposit", type: "uint256" },
      { name: "isAllowlistEnabled", type: "bool" },
      { name: "manager", type: "address" },
    ],
  },
  {
    name: "getTokenBalance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "swapRouter",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  // Write functions
  {
    name: "swapTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "fee", type: "uint24" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "setSwapRouter",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_router", type: "address" }],
    outputs: [],
  },
  {
    name: "setDefaultSwapFee",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_fee", type: "uint24" }],
    outputs: [],
  },
  {
    name: "addStrategy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "_strategy", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "invest",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [],
  },
  {
    name: "investInStrategy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "divest",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [],
  },
  {
    name: "divestFromStrategy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "setStrategy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_strategy", type: "address" }],
    outputs: [],
  },
  {
    name: "addSupportedToken",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_token", type: "address" }],
    outputs: [],
  },
  {
    name: "pause",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "unpause",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;

// ERC20 ABI for token info
const ERC20_ABI = [
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export interface TokenBalance {
  address: string;
  symbol: string;
  balance: string;
  balanceRaw: bigint;
  decimals: number;
  source?: "vault" | "strategy";
  strategyName?: string;
}

// Known base tokens that should always be shown (even with 0 balance)
// These addresses should match the deployed token addresses
// Note: USDC address might vary, so we'll use the vault's asset as the primary USDC
const KNOWN_BASE_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  "0x68194a729C2450ad26072b3D33ADaCbcef39D574": { symbol: "DAI", decimals: 18 },
};

export interface StrategyInfo {
  name: string;
  address: string;
  assets: string;
  assetsRaw: bigint;
}

export interface VaultState {
  totalAssets: string;
  assetsInVault: string;
  assetsInStrategy: string;
  isPaused: boolean;
  currentStrategy: string;
  depositCap: string;
  minDeposit: string;
  allowlistEnabled: boolean;
  swapRouter: string;
}

export const useVaultManagement = (vaultAddress: string) => {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [strategies, setStrategies] = useState<StrategyInfo[]>([]);
  const [vaultState, setVaultState] = useState<VaultState | null>(null);

  const { writeContract, isPending: isWritePending } = useWriteContract();

  // Check if user is owner
  const checkOwnership = useCallback(async () => {
    if (!publicClient || !vaultAddress || !userAddress) return;

    try {
      const owner = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "owner",
      });
      setIsOwner(owner.toLowerCase() === userAddress.toLowerCase());
    } catch (err) {
      console.error("Error checking ownership:", err);
    }
  }, [publicClient, vaultAddress, userAddress]);

  // Fetch vault state
  const fetchVaultState = useCallback(async () => {
    if (!publicClient || !vaultAddress) return;

    try {
      // First check if contract exists and is initialized
      const code = await publicClient.getBytecode({
        address: vaultAddress as `0x${string}`,
      });
      
      if (!code || code === "0x") {
        console.error("Vault contract does not exist at address:", vaultAddress);
        setVaultState({
          totalAssets: "0",
          assetsInVault: "0",
          assetsInStrategy: "0",
          isPaused: false,
          depositCap: "0",
          minDeposit: "0",
          allowlistEnabled: false,
          swapRouter: "0x0000000000000000000000000000000000000000",
          currentStrategy: "0x0000000000000000000000000000000000000000",
        });
        return;
      }

      // Get vault state from GroupVault with better error handling
      const state = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "getVaultState",
      }).catch((err) => {
        console.error("Error calling getVaultState:", err);
        // Return null to indicate failure
        return null;
      });

      if (!state) {
        // If getVaultState failed, set default state
        setVaultState({
          totalAssets: "0",
          assetsInVault: "0",
          assetsInStrategy: "0",
          isPaused: false,
          depositCap: "0",
          minDeposit: "0",
          allowlistEnabled: false,
          swapRouter: "0x0000000000000000000000000000000000000000",
          currentStrategy: "0x0000000000000000000000000000000000000000",
        });
        return;
      }

      // getVaultState returns: (totalAssetsAmount, assetsInVault, assetsInStrategies, isPaused, currentDepositCap, currentMinDeposit, isAllowlistEnabled, manager)
      // viem returns tuples as arrays when using readContract
      const stateArray = Array.isArray(state) ? state : [
        (state as any).totalAssetsAmount,
        (state as any).assetsInVault,
        (state as any).assetsInStrategies,
        (state as any).isPaused,
        (state as any).currentDepositCap,
        (state as any).currentMinDeposit,
        (state as any).isAllowlistEnabled,
        (state as any).manager,
      ];
      
      const managerAddress = stateArray[7] as string;
        
        // Fetch swapRouter from VaultManager
        let swapRouterAddr = "0x0000000000000000000000000000000000000000";
        if (managerAddress && managerAddress !== "0x0000000000000000000000000000000000000000") {
          try {
            swapRouterAddr = await publicClient.readContract({
              address: managerAddress as `0x${string}`,
              abi: [
                {
                  name: "swapRouter",
                  type: "function",
                  stateMutability: "view",
                  inputs: [],
                  outputs: [{ type: "address" }],
                },
              ],
              functionName: "swapRouter",
            }) as string;
          } catch (err) {
            console.log("Could not fetch swapRouter from manager:", err);
          }
        }
        
        // Get first strategy if any
        let currentStrategy = "0x0000000000000000000000000000000000000000";
        try {
          const strategyNames = await publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: VAULT_ABI,
            functionName: "getStrategyNames",
          }) as string[];
          
          if (strategyNames && strategyNames.length > 0) {
            const firstStrategyAddr = await publicClient.readContract({
              address: vaultAddress as `0x${string}`,
              abi: VAULT_ABI,
              functionName: "getStrategy",
              args: [strategyNames[0]],
            }) as string;
            currentStrategy = firstStrategyAddr || "0x0000000000000000000000000000000000000000";
          }
        } catch (err) {
          console.log("Could not fetch strategies:", err);
        }
        
        setVaultState({
          totalAssets: formatUnits(stateArray[0] as bigint, 6),
          assetsInVault: formatUnits(stateArray[1] as bigint, 6),
          assetsInStrategy: formatUnits(stateArray[2] as bigint, 6),
          isPaused: Boolean(stateArray[3]),
          currentStrategy: currentStrategy,
          depositCap: formatUnits(stateArray[4] as bigint, 6),
          minDeposit: formatUnits(stateArray[5] as bigint, 6),
          allowlistEnabled: Boolean(stateArray[6]),
          swapRouter: swapRouterAddr,
        });
    } catch (err) {
      console.error("Error fetching vault state:", err);
    }
  }, [publicClient, vaultAddress]);

  // Fetch token balances - always show all possible tokens even with zero balance
  const fetchTokenBalances = useCallback(async () => {
    if (!publicClient || !vaultAddress) return;

    try {
      const allTokensMap = new Map<string, {
        address: string;
        symbol: string;
        balance: string;
        balanceRaw: bigint;
        decimals: number;
        source: "vault" | "strategy";
        strategyName?: string;
      }>();

      // Helper function to get or create token entry
      const getOrCreateToken = (address: string, symbol: string, decimals: number, source: "vault" | "strategy", strategyName?: string) => {
        const key = address.toLowerCase();
        if (!allTokensMap.has(key)) {
          allTokensMap.set(key, {
            address,
            symbol,
            balance: "0",
            balanceRaw: 0n,
            decimals,
            source,
            strategyName,
          });
        }
        return allTokensMap.get(key)!;
      };

      // Helper function to update token balance
      const updateTokenBalance = (address: string, amount: bigint, decimals: number) => {
        const key = address.toLowerCase();
        const token = allTokensMap.get(key);
        if (token) {
          const currentBalance = parseUnits(token.balance || "0", token.decimals);
          token.balance = formatUnits(currentBalance + amount, token.decimals);
          token.balanceRaw = currentBalance + amount;
        }
      };

      // 1. Get the vault's asset (primary token, usually USDC)
      let vaultAsset: { address: string; symbol: string; decimals: number } | null = null;
      try {
        const assetAddr = await publicClient.readContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "asset",
        });

        const [symbol, decimals] = await Promise.all([
          publicClient.readContract({
            address: assetAddr as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "symbol",
          }).catch(() => "???"),
          publicClient.readContract({
            address: assetAddr as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "decimals",
          }).catch(() => 18),
        ]);

        vaultAsset = {
          address: assetAddr,
          symbol,
          decimals,
        };

        // Add vault asset token (always show, even with 0 balance)
        const assetBalance = await publicClient.readContract({
          address: assetAddr as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [vaultAddress as `0x${string}`],
        }).catch(() => 0n);

        getOrCreateToken(assetAddr, symbol, decimals, "vault");
        if (assetBalance > 0n) {
          updateTokenBalance(assetAddr, assetBalance, decimals);
        }
      } catch (err) {
        console.log("Error fetching vault asset:", err);
      }

      // 2. Always include other known base tokens (DAI, etc.) - but skip if same as vault asset
      for (const [address, info] of Object.entries(KNOWN_BASE_TOKENS)) {
        // Skip if this is the same as vault asset (already added)
        if (vaultAsset && address.toLowerCase() === vaultAsset.address.toLowerCase()) {
          continue;
        }

        try {
          const balance = await publicClient.readContract({
            address: address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [vaultAddress as `0x${string}`],
          }).catch(() => 0n);

          getOrCreateToken(address, info.symbol, info.decimals, "vault");
          if (balance > 0n) {
            updateTokenBalance(address, balance, info.decimals);
          }
        } catch (err) {
          // Still add token even if we can't get balance
          getOrCreateToken(address, info.symbol, info.decimals, "vault");
        }
      }

      // 3. Get tokens directly held by the vault (from getVaultTokenBalances)
      const vaultResult = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "getVaultTokenBalances",
      }).catch(() => null);

      if (vaultResult) {
        const [tokens, balances] = vaultResult;
        for (let i = 0; i < tokens.length; i++) {
          const tokenAddr = tokens[i];
          const tokenKey = tokenAddr.toLowerCase();
          
          // Skip if this token already exists in our map (from vault asset or known tokens)
          if (allTokensMap.has(tokenKey)) {
            // Just update the balance if needed
            if (balances[i] > 0n) {
              const existingToken = allTokensMap.get(tokenKey)!;
              updateTokenBalance(tokenAddr, balances[i], existingToken.decimals);
            }
            continue;
          }

          // Skip if this is the same as vault asset (already added)
          if (vaultAsset && tokenKey === vaultAsset.address.toLowerCase()) {
            // Update balance if needed
            if (balances[i] > 0n) {
              updateTokenBalance(tokenAddr, balances[i], vaultAsset.decimals);
            }
            continue;
          }

          // Only fetch token info if it's a new token
          try {
            const [symbol, decimals] = await Promise.all([
              publicClient.readContract({
                address: tokenAddr as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "symbol",
              }).catch(() => "???"),
              publicClient.readContract({
                address: tokenAddr as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
              }).catch(() => 18),
            ]);

            // Double-check: if symbol is USDC and we already have a USDC (vault asset), skip it
            if (vaultAsset && symbol.toUpperCase() === "USDC" && vaultAsset.symbol.toUpperCase() === "USDC") {
              // This is a duplicate USDC, skip it
              continue;
            }

            const token = getOrCreateToken(tokenAddr, symbol, decimals, "vault");
            if (balances[i] > 0n) {
              updateTokenBalance(tokenAddr, balances[i], decimals);
            }
          } catch {
            // Skip if we can't get token info
          }
        }
      }

      // 4. Get tokens from strategies (LP tokens, aTokens, etc.) - always show even with 0 balance
      try {
        const strategyNames = await publicClient.readContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "getStrategyNames",
        }).catch(() => [] as string[]);

        for (const strategyName of strategyNames) {
          try {
            const strategyAddr = await publicClient.readContract({
              address: vaultAddress as `0x${string}`,
              abi: VAULT_ABI,
              functionName: "getStrategy",
              args: [strategyName],
            }).catch(() => "0x0000000000000000000000000000000000000000" as `0x${string}`);

            if (strategyAddr && strategyAddr !== "0x0000000000000000000000000000000000000000") {
              // Get the strategy's asset token (this could be LP token, aToken, etc.)
              try {
                const strategyAssetAddr = await publicClient.readContract({
                  address: strategyAddr as `0x${string}`,
                  abi: [
                    {
                      name: "asset",
                      type: "function",
                      stateMutability: "view",
                      inputs: [],
                      outputs: [{ type: "address" }],
                    },
                  ],
                  functionName: "asset",
                });

                // Get strategy assets (even if 0)
                const strategyAssets = await publicClient.readContract({
                  address: vaultAddress as `0x${string}`,
                  abi: VAULT_ABI,
                  functionName: "getStrategyAssets",
                  args: [strategyName],
                }).catch(() => 0n);

                // Get token info
                try {
                  const [symbol, decimals] = await Promise.all([
                    publicClient.readContract({
                      address: strategyAssetAddr as `0x${string}`,
                      abi: ERC20_ABI,
                      functionName: "symbol",
                    }),
                    publicClient.readContract({
                      address: strategyAssetAddr as `0x${string}`,
                      abi: ERC20_ABI,
                      functionName: "decimals",
                    }),
                  ]);

                  // Always add strategy token, even with 0 balance
                  const token = getOrCreateToken(strategyAssetAddr, symbol, decimals, "strategy", strategyName);
                  if (strategyAssets > 0n) {
                    updateTokenBalance(strategyAssetAddr, strategyAssets, decimals);
                  }
                } catch {
                  // If we can't get symbol/decimals, skip
                }
              } catch {
                // If strategy doesn't have asset() function, skip
              }
            }
          } catch (err) {
            console.log(`Error fetching tokens from strategy ${strategyName}:`, err);
          }
        }
      } catch (err) {
        console.log("Error fetching strategy tokens:", err);
      }

      // Convert map to array and sort: vault tokens first, then strategy tokens
      const allTokens = Array.from(allTokensMap.values()).sort((a, b) => {
        if (a.source !== b.source) {
          return a.source === "vault" ? -1 : 1;
        }
        return a.symbol.localeCompare(b.symbol);
      });

      setTokenBalances(allTokens);
    } catch (err) {
      console.error("Error fetching token balances:", err);
    }
  }, [publicClient, vaultAddress]);

  // Fetch strategies
  const fetchStrategies = useCallback(async () => {
    if (!publicClient || !vaultAddress) return;

    try {
      const names = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "getStrategyNames",
      }).catch(() => [] as string[]);

      const strategyPromises = names.map(async (name) => {
        try {
          const [addr, assets] = await Promise.all([
            publicClient.readContract({
              address: vaultAddress as `0x${string}`,
              abi: VAULT_ABI,
              functionName: "getStrategy",
              args: [name],
            }),
            publicClient.readContract({
              address: vaultAddress as `0x${string}`,
              abi: VAULT_ABI,
              functionName: "getStrategyAssets",
              args: [name],
            }),
          ]);

          return {
            name,
            address: addr,
            assets: formatUnits(assets, 6),
            assetsRaw: assets,
          };
        } catch {
          return {
            name,
            address: "0x0000000000000000000000000000000000000000",
            assets: "0",
            assetsRaw: 0n,
          };
        }
      });

      const strategyInfos = await Promise.all(strategyPromises);
      setStrategies(strategyInfos.filter((s) => s.address !== "0x0000000000000000000000000000000000000000"));
    } catch (err) {
      console.error("Error fetching strategies:", err);
    }
  }, [publicClient, vaultAddress]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([checkOwnership(), fetchVaultState(), fetchTokenBalances(), fetchStrategies()]);
    } finally {
      setLoading(false);
    }
  }, [checkOwnership, fetchVaultState, fetchTokenBalances, fetchStrategies]);

  // Initial load
  useEffect(() => {
    if (vaultAddress && publicClient) {
      refreshData();
    }
  }, [vaultAddress, publicClient, refreshData]);

  // ============ WRITE FUNCTIONS ============

  // Swap tokens
  const swapTokens = useCallback(
    async (tokenIn: string, tokenOut: string, amountIn: string, amountOutMin: string, fee: number = 3000) => {
      if (!vaultAddress) return;
      setError(null);

      try {
        // Get decimals for input token
        const decimals = tokenBalances.find((t) => t.address.toLowerCase() === tokenIn.toLowerCase())?.decimals || 6;

        writeContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "swapTokens",
          args: [
            tokenIn as `0x${string}`,
            tokenOut as `0x${string}`,
            parseUnits(amountIn, decimals),
            parseUnits(amountOutMin, decimals),
            fee,
          ],
        });
      } catch (err) {
        console.error("Swap error:", err);
        setError("Failed to swap tokens");
      }
    },
    [vaultAddress, writeContract, tokenBalances]
  );

  // Set swap router
  const setSwapRouter = useCallback(
    async (routerAddress: string) => {
      if (!vaultAddress) return;
      setError(null);

      try {
        writeContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "setSwapRouter",
          args: [routerAddress as `0x${string}`],
        });
      } catch (err) {
        console.error("Set router error:", err);
        setError("Failed to set swap router");
      }
    },
    [vaultAddress, writeContract]
  );

  // Set default swap fee
  const setSwapFee = useCallback(
    async (fee: number) => {
      if (!vaultAddress) return;
      setError(null);

      try {
        writeContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "setDefaultSwapFee",
          args: [fee],
        });
      } catch (err) {
        console.error("Set fee error:", err);
        setError("Failed to set swap fee");
      }
    },
    [vaultAddress, writeContract]
  );

  // Add strategy
  const addStrategy = useCallback(
    async (name: string, strategyAddress: string) => {
      if (!vaultAddress) return;
      setError(null);

      try {
        writeContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "addStrategy",
          args: [name, strategyAddress as `0x${string}`],
        });
      } catch (err) {
        console.error("Add strategy error:", err);
        setError("Failed to add strategy");
      }
    },
    [vaultAddress, writeContract]
  );

  // Invest in primary strategy
  const invest = useCallback(
    async (amount: string) => {
      if (!vaultAddress) return;
      setError(null);

      try {
        writeContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "invest",
          args: [parseUnits(amount, 6)],
        });
      } catch (err) {
        console.error("Invest error:", err);
        setError("Failed to invest");
      }
    },
    [vaultAddress, writeContract]
  );

  // Invest in named strategy
  const investInStrategy = useCallback(
    async (strategyName: string, token: string, amount: string) => {
      if (!vaultAddress) return;
      setError(null);

      try {
        const decimals = tokenBalances.find((t) => t.address.toLowerCase() === token.toLowerCase())?.decimals || 6;

        writeContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "investInStrategy",
          args: [strategyName, token as `0x${string}`, parseUnits(amount, decimals)],
        });
      } catch (err) {
        console.error("Invest in strategy error:", err);
        setError("Failed to invest in strategy");
      }
    },
    [vaultAddress, writeContract, tokenBalances]
  );

  // Divest from primary strategy
  const divest = useCallback(
    async (amount: string) => {
      if (!vaultAddress) return;
      setError(null);

      try {
        writeContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "divest",
          args: [parseUnits(amount, 6)],
        });
      } catch (err) {
        console.error("Divest error:", err);
        setError("Failed to divest");
      }
    },
    [vaultAddress, writeContract]
  );

  // Divest from named strategy
  const divestFromStrategy = useCallback(
    async (strategyName: string, amount: string) => {
      if (!vaultAddress) return;
      setError(null);

      try {
        writeContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "divestFromStrategy",
          args: [strategyName, parseUnits(amount, 6)],
        });
      } catch (err) {
        console.error("Divest from strategy error:", err);
        setError("Failed to divest from strategy");
      }
    },
    [vaultAddress, writeContract]
  );

  // Pause/unpause vault
  const togglePause = useCallback(async () => {
    if (!vaultAddress || !vaultState) return;
    setError(null);

    try {
      writeContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: vaultState.isPaused ? "unpause" : "pause",
      });
    } catch (err) {
      console.error("Toggle pause error:", err);
      setError("Failed to toggle pause state");
    }
  }, [vaultAddress, writeContract, vaultState]);

  // Add supported token
  const addSupportedToken = useCallback(
    async (tokenAddress: string) => {
      if (!vaultAddress) return;
      setError(null);

      try {
        writeContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "addSupportedToken",
          args: [tokenAddress as `0x${string}`],
        });
      } catch (err) {
        console.error("Add token error:", err);
        setError("Failed to add token");
      }
    },
    [vaultAddress, writeContract]
  );

  return {
    // State
    isOwner,
    loading: loading || isWritePending,
    error,
    tokenBalances,
    strategies,
    vaultState,
    // Actions
    refreshData,
    swapTokens,
    setSwapRouter,
    setSwapFee,
    addStrategy,
    invest,
    investInStrategy,
    divest,
    divestFromStrategy,
    togglePause,
    addSupportedToken,
  };
};

