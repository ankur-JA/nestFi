import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { sepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/JfjuIv_X8UDcQcKmIwnsY", {
    timeout: 10000, // 10 second timeout
    retryCount: 2,  // Retry twice
  }),
});

// Minimal ABI for reading vault info
const vaultABI = parseAbi([
  "function asset() view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function allowlistEnabled() view returns (bool)",
  "function depositCap() view returns (uint256)",
  "function minDeposit() view returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowlist(address) view returns (bool)",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const userAddress = searchParams.get("user");

    if (!address) {
      return NextResponse.json({ error: "Vault address is required" }, { status: 400 });
    }

    console.log(`Fetching vault info for: ${address}`);
    
    // Debug: Check if this is the specific vault we're debugging
    if (address.toLowerCase() === "0xba230e7c7E39D09443d8Da0a332DD787BD1352cb".toLowerCase()) {
      console.log("🔍 API Debug: Processing specific vault:", address);
      console.log("🔍 API Debug: User address:", userAddress);
      console.log("🔍 API Debug: RPC URL:", process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/JfjuIv_X8UDcQcKmIwnsY");
      
      // Check if this address is actually a contract
      try {
        const code = await publicClient.getBytecode({
          address: address as `0x${string}`,
          blockTag: "latest",
        });
        
        if (code && code !== "0x") {
          console.log("🔍 API Debug: Address IS a contract (has bytecode)");
        } else {
          console.log("🔍 API Debug: Address is NOT a contract (no bytecode) - this is likely an EOA");
          return NextResponse.json({
            error: "Address is not a contract. This appears to be an EOA (Externally Owned Account), not a vault contract.",
            address,
            isContract: false,
          }, { status: 400 });
        }
      } catch (err) {
        console.error("🔍 API Debug: Error checking if address is contract:", err);
      }
    }

    // Read vault info with individual try-catch blocks
    let asset = "0x0000000000000000000000000000000000000000";
    let name = "Investment Vault";
    let symbol = "INV";
    let allowlistEnabled = false;
    let depositCap = "0";
    let minDeposit = "0";
    let totalAssets = "0";
    let totalSupply = "0";
    let userBalance = "0";
    let isAllowed = false;

    // Try to read each property individually
    try {
      asset = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "asset",
      }) as string;
    } catch (e) {
      console.log("Could not read asset:", e);
    }

    try {
      name = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "name",
      }) as string;
      console.log(`Successfully read name for ${address}:`, name);
    } catch (e) {
      console.log("Could not read name:", e);
    }

    try {
      symbol = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "symbol",
      }) as string;
      console.log(`Successfully read symbol for ${address}:`, symbol);
    } catch (e) {
      console.log("Could not read symbol:", e);
    }

    try {
      allowlistEnabled = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "allowlistEnabled",
      }) as boolean;
    } catch (e) {
      console.log("Could not read allowlistEnabled:", e);
    }

    try {
      const depositCapBigInt = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "depositCap",
      }) as bigint;
      depositCap = depositCapBigInt.toString();
    } catch (e) {
      console.log("Could not read depositCap:", e);
    }

    try {
      const minDepositBigInt = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "minDeposit",
      }) as bigint;
      minDeposit = minDepositBigInt.toString();
    } catch (e) {
      console.log("Could not read minDeposit:", e);
    }

    try {
      const totalAssetsBigInt = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "totalAssets",
      }) as bigint;
      totalAssets = totalAssetsBigInt.toString();
    } catch (e) {
      console.log("Could not read totalAssets:", e);
    }

    try {
      const totalSupplyBigInt = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "totalSupply",
      }) as bigint;
      totalSupply = totalSupplyBigInt.toString();
    } catch (e) {
      console.log("Could not read totalSupply:", e);
    }

    // Read user-specific data if user address is provided
    if (userAddress) {
      try {
        const userBalanceBigInt = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: vaultABI,
          functionName: "balanceOf",
          args: [userAddress as `0x${string}`],
        }) as bigint;
        userBalance = userBalanceBigInt.toString();
        
        // Debug: Log user balance for specific vault
        if (address.toLowerCase() === "0xba230e7c7E39D09443d8Da0a332DD787BD1352cb".toLowerCase()) {
          console.log("🔍 API Debug: User balance:", userBalance);
        }
      } catch (e) {
        console.log("Could not read user balance:", e);
        
        // Debug: Log error for specific vault
        if (address.toLowerCase() === "0xba230e7c7E39D09443d8Da0a332DD787BD1352cb".toLowerCase()) {
          console.log("🔍 API Debug: Error reading user balance:", e);
        }
      }

      // Check allowlist status if allowlist is enabled
      if (allowlistEnabled) {
        try {
          isAllowed = await publicClient.readContract({
            address: address as `0x${string}`,
            abi: vaultABI,
            functionName: "allowlist",
            args: [userAddress as `0x${string}`],
          }) as boolean;
          
          // Debug: Log allowlist status for specific vault
          if (address.toLowerCase() === "0xba230e7c7E39D09443d8Da0a332DD787BD1352cb".toLowerCase()) {
            console.log("🔍 API Debug: User allowlist status:", isAllowed);
          }
        } catch (e) {
          console.log("Could not read allowlist status:", e);
          
          // Debug: Log error for specific vault
          if (address.toLowerCase() === "0xba230e7c7E39D09443d8Da0a332DD787BD1352cb".toLowerCase()) {
            console.log("🔍 API Debug: Error reading allowlist status:", e);
          }
        }
      } else {
        // Debug: Log that allowlist is not enabled for specific vault
        if (address.toLowerCase() === "0xba230e7c7E39D09443d8Da0a332DD787BD1352cb".toLowerCase()) {
          console.log("🔍 API Debug: Allowlist is not enabled for this vault");
        }
      }
    }

    const response = {
      asset,
      name,
      symbol,
      allowlistEnabled,
      depositCap,
      minDeposit,
      totalAssets,
      totalSupply,
      userBalance,
      isAllowed,
    };
    
    console.log(`Final API response for ${address}:`, response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in vault info API:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault information" },
      { status: 500 }
    );
  }
}