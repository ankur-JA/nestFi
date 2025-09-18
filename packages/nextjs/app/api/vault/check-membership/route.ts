import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi, isAddress } from "viem";
import { sepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/JfjuIv_X8UDcQcKmIwnsY", {
    timeout: 10000,
    retryCount: 2,
  }),
});

const vaultABI = parseAbi([
  "function owner() view returns (address)",
  "function balanceOf(address) view returns (uint256)",
  "function allowlistEnabled() view returns (bool)",
  "function allowlist(address) view returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function isPaused() view returns (bool)",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vaultAddress = searchParams.get("vaultAddress");
    const userAddress = searchParams.get("userAddress");

    if (!vaultAddress || !userAddress) {
      return NextResponse.json({ error: "Vault address and user address are required" }, { status: 400 });
    }

    if (!isAddress(vaultAddress)) {
      return NextResponse.json({ error: "Invalid vault address format" }, { status: 400 });
    }

    if (!isAddress(userAddress)) {
      return NextResponse.json({ error: "Invalid user address format" }, { status: 400 });
    }

    console.log(`Checking membership for vault: ${vaultAddress}, user: ${userAddress}`);

    let isOwner = false;
    let userBalance = "0";
    let isOnAllowlist = false;
    let allowlistEnabled = false;
    let vaultName = "Unknown Vault";
    let vaultSymbol = "UNK";
    let totalAssets = "0";
    let totalSupply = "0";
    let isPaused = false;

    try {
      const owner = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "owner",
      }) as string;
      isOwner = owner.toLowerCase() === userAddress.toLowerCase();
    } catch (e) {
      console.log("Could not read owner:", e);
    }

    try {
      const balance = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "balanceOf",
        args: [userAddress as `0x${string}`],
      }) as bigint;
      userBalance = balance.toString();
    } catch (e) {
      console.log("Could not read user balance:", e);
    }

    try {
      allowlistEnabled = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "allowlistEnabled",
      }) as boolean;
    } catch (e) {
      console.log("Could not read allowlist enabled:", e);
    }

    if (allowlistEnabled) {
      try {
        isOnAllowlist = await publicClient.readContract({
          address: vaultAddress as `0x${string}`,
          abi: vaultABI,
          functionName: "allowlist",
          args: [userAddress as `0x${string}`],
        }) as boolean;
      } catch (e) {
        console.log("Could not read allowlist status:", e);
      }
    }

    try {
      vaultName = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "name",
      }) as string;
    } catch (e) {
      console.log("Could not read vault name:", e);
    }

    try {
      vaultSymbol = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "symbol",
      }) as string;
    } catch (e) {
      console.log("Could not read vault symbol:", e);
    }

    try {
      const assets = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "totalAssets",
      }) as bigint;
      totalAssets = assets.toString();
    } catch (e) {
      console.log("Could not read total assets:", e);
    }

    try {
      const supply = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "totalSupply",
      }) as bigint;
      totalSupply = supply.toString();
    } catch (e) {
      console.log("Could not read total supply:", e);
    }

    try {
      isPaused = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "isPaused",
      }) as boolean;
    } catch (e) {
      console.log("Could not read paused status:", e);
    }

    // Determine if user is a member
    const isMember = isOwner || BigInt(userBalance) > 0n || isOnAllowlist;

    return NextResponse.json({
      vaultAddress,
      userAddress,
      isOwner,
      isMember,
      userBalance,
      isOnAllowlist,
      allowlistEnabled,
      vaultName,
      vaultSymbol,
      totalAssets,
      totalSupply,
      isPaused,
    });
  } catch (error) {
    console.error("Error checking vault membership:", error);
    return NextResponse.json(
      { error: "Failed to check vault membership" },
      { status: 500 }
    );
  }
}
