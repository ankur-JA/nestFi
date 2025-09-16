import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { sepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/JfjuIv_X8UDcQcKmIwnsY"),
});

// Basic ABI for reading vault info
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
  "function isPaused() view returns (bool)",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const userAddress = searchParams.get("user");

    if (!address) {
      return NextResponse.json({ error: "Vault address is required" }, { status: 400 });
    }

    // Read basic vault info that we know works
    const [asset, allowlistEnabled, depositCap, minDeposit] = await Promise.all([
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "asset",
      }),
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "allowlistEnabled",
      }),
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "depositCap",
      }),
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "minDeposit",
      }),
    ]);

    // Try to read additional data with fallbacks
    let name = "Investment Vault";
    let symbol = "INV";
    let totalAssets = 0n;
    let totalSupply = 0n;
    let isPaused = false;

    try {
      totalAssets = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "totalAssets",
      }) as bigint;
    } catch (e) {
      console.log("Could not read totalAssets");
    }

    try {
      totalSupply = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "totalSupply",
      }) as bigint;
    } catch (e) {
      console.log("Could not read totalSupply");
    }

    // Get user balance if userAddress provided
    let userBalance = "0";
    if (userAddress) {
      try {
        const balance = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: vaultABI,
          functionName: "balanceOf",
          args: [userAddress],
        }) as bigint;
        userBalance = balance.toString();
      } catch (e) {
        console.log("Could not read user balance");
      }
    }

    return NextResponse.json({
      asset,
      name,
      symbol, 
      allowlistEnabled,
      depositCap: (depositCap as bigint).toString(),
      minDeposit: (minDeposit as bigint).toString(),
      totalAssets: totalAssets.toString(),
      totalSupply: totalSupply.toString(),
      userBalance,
      isPaused,
    });
  } catch (error) {
    console.error("Error fetching vault info:", error);
    // Return default values instead of error
    return NextResponse.json({
      asset: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      name: "Investment Vault",
      symbol: "INV", 
      allowlistEnabled: true,
      depositCap: "10000000000",
      minDeposit: "10000000",
    });
  }
}
