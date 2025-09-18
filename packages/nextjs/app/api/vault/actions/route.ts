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

// Extended ABI for vault actions
const vaultABI = parseAbi([
  "function asset() view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function allowlistEnabled() view returns (bool)",
  "function allowlist(address) view returns (bool)",
  "function depositCap() view returns (uint256)",
  "function minDeposit() view returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function isPaused() view returns (bool)",
  "function convertToAssets(uint256) view returns (uint256)",
  "function convertToShares(uint256) view returns (uint256)",
  "function maxDeposit(address) view returns (uint256)",
  "function maxMint(address) view returns (uint256)",
  "function maxRedeem(address) view returns (uint256)",
  "function maxWithdraw(address) view returns (uint256)",
  "function previewDeposit(uint256) view returns (uint256)",
  "function previewMint(uint256) view returns (uint256)",
  "function previewRedeem(uint256) view returns (uint256)",
  "function previewWithdraw(uint256) view returns (uint256)",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vaultAddress = searchParams.get("address");
    const userAddress = searchParams.get("user");
    const action = searchParams.get("action");
    const amount = searchParams.get("amount");

    if (!vaultAddress) {
      return NextResponse.json({ error: "Vault address is required" }, { status: 400 });
    }

    if (!userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 });
    }

    console.log(`Fetching vault actions for: ${vaultAddress}, user: ${userAddress}`);

    // Get vault limits and previews with individual error handling
    let maxDeposit = "0";
    let maxMint = "0";
    let maxRedeem = "0";
    let maxWithdraw = "0";
    let minDeposit = "0";
    let userBalance = "0";
    let userShares = "0";

    // Try to read each property individually with error handling
    try {
      const maxDepositBigInt = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "maxDeposit",
        args: [userAddress],
      }) as bigint;
      maxDeposit = maxDepositBigInt.toString();
    } catch (e) {
      console.log("Could not read maxDeposit:", e);
      // Set a reasonable default instead of the huge number
      maxDeposit = "1000000000000"; // 1M USDC max
    }

    try {
      const maxMintBigInt = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "maxMint",
        args: [userAddress],
      }) as bigint;
      maxMint = maxMintBigInt.toString();
    } catch (e) {
      console.log("Could not read maxMint:", e);
      maxMint = "1000000000000";
    }

    try {
      const maxRedeemBigInt = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "maxRedeem",
        args: [userAddress],
      }) as bigint;
      maxRedeem = maxRedeemBigInt.toString();
    } catch (e) {
      console.log("Could not read maxRedeem:", e);
      maxRedeem = "0";
    }

    try {
      const maxWithdrawBigInt = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "maxWithdraw",
        args: [userAddress],
      }) as bigint;
      maxWithdraw = maxWithdrawBigInt.toString();
    } catch (e) {
      console.log("Could not read maxWithdraw:", e);
      maxWithdraw = "0";
    }

    try {
      const minDepositBigInt = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "minDeposit",
      }) as bigint;
      minDeposit = minDepositBigInt.toString();
    } catch (e) {
      console.log("Could not read minDeposit:", e);
      minDeposit = "10000000"; // 10 USDC default
    }

    try {
      const userBalanceBigInt = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "balanceOf",
        args: [userAddress],
      }) as bigint;
      userBalance = userBalanceBigInt.toString();
    } catch (e) {
      console.log("Could not read userBalance:", e);
      userBalance = "0";
    }

    try {
      const userSharesBigInt = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "totalSupply",
      }) as bigint;
      userShares = userSharesBigInt.toString();
    } catch (e) {
      console.log("Could not read userShares:", e);
      userShares = "0";
    }

    // Get previews if amount and action are provided
    let previewShares = "0";
    let previewAssets = "0";

    if (amount && action) {
      try {
        const parsedAmount = BigInt(amount);
        
        if (action === "deposit") {
          const shares = await publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "previewDeposit",
            args: [parsedAmount],
          }) as bigint;
          previewShares = shares.toString();
        } else if (action === "withdraw") {
          const assets = await publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "previewWithdraw",
            args: [parsedAmount],
          }) as bigint;
          previewAssets = assets.toString();
        }
      } catch (e) {
        console.log("Could not read preview:", e);
      }
    }

    return NextResponse.json({
      maxDeposit,
      maxMint,
      maxRedeem,
      maxWithdraw,
      minDeposit,
      userBalance,
      userShares,
      previewShares,
      previewAssets,
    });
  } catch (error) {
    console.error("Error in vault actions API:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault actions data" },
      { status: 500 }
    );
  }
}