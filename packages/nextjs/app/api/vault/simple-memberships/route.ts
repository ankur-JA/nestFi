import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi, isAddress } from "viem";
import { sepolia } from "viem/chains";
import deployedContracts from "../../../../contracts/deployedContracts";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);

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

const factoryABI = parseAbi([
  "function getVaultsByUser(address user) view returns (address[])",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 });
    }

    if (!isAddress(userAddress)) {
      return NextResponse.json({ error: "Invalid user address format" }, { status: 400 });
    }

    console.log(`Simple membership check for user: ${userAddress}`);

    const factoryAddress = (deployedContracts as any)[CHAIN_ID]?.VaultFactory?.address;
    
    if (!factoryAddress) {
      return NextResponse.json({ error: "Vault factory not deployed on this network" }, { status: 400 });
    }

    // Get vaults created by the user
    let userVaults: string[] = [];
    
    try {
      const vaults = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: factoryABI,
        functionName: "getVaultsByUser",
        args: [userAddress as `0x${string}`],
      }) as string[];
      
      userVaults = vaults.filter(address => address && address !== "0x0000000000000000000000000000000000000000");
      console.log(`Found ${userVaults.length} vaults created by user`);
    } catch (error) {
      console.error("Error fetching user vaults:", error);
      // Return empty result if we can't fetch vaults
      return NextResponse.json({
        userAddress,
        memberships: [],
        summary: {
          totalVaults: 0,
          adminVaults: 0,
          memberVaults: 0,
          totalValueLocked: "0.00",
        },
        factoryAddress,
        chainId: CHAIN_ID,
        error: "Could not fetch user vaults",
      });
    }

    // Check membership for each vault
    const membershipPromises = userVaults.map(async (vaultAddress) => {
      try {
        const [owner, userBalance, allowlistEnabled, isOnAllowlist, vaultName, vaultSymbol, totalAssets, totalSupply, isPaused] = await Promise.all([
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "owner",
          }).catch(() => "0x0000000000000000000000000000000000000000"),
          
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "balanceOf",
            args: [userAddress as `0x${string}`],
          }).catch(() => 0n),
          
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "allowlistEnabled",
          }).catch(() => false),
          
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "allowlist",
            args: [userAddress as `0x${string}`],
          }).catch(() => false),
          
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "name",
          }).catch(() => "Unknown Vault"),
          
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "symbol",
          }).catch(() => "UNK"),
          
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "totalAssets",
          }).catch(() => 0n),
          
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "totalSupply",
          }).catch(() => 0n),
          
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "isPaused",
          }).catch(() => false),
        ]);

        const isOwner = (owner as string).toLowerCase() === userAddress.toLowerCase();
        const hasBalance = (userBalance as bigint) > 0n;
        const isMember = isOwner || hasBalance || (isOnAllowlist as boolean);

        if (isMember) {
          return {
            vaultAddress,
            vaultName: vaultName as string,
            vaultSymbol: vaultSymbol as string,
            role: isOwner ? "admin" : "member",
            userBalance: (userBalance as bigint).toString(),
            totalAssets: (totalAssets as bigint).toString(),
            totalSupply: (totalSupply as bigint).toString(),
            isPaused: isPaused as boolean,
            allowlistEnabled: allowlistEnabled as boolean,
            isOnAllowlist: isOnAllowlist as boolean,
          };
        }

        return null;
      } catch (error) {
        console.error(`Error checking membership for vault ${vaultAddress}:`, error);
        return null;
      }
    });

    const results = await Promise.all(membershipPromises);
    const memberships = results.filter((m): m is NonNullable<typeof m> => m !== null);

    console.log(`Found ${memberships.length} vault memberships for user ${userAddress}`);

    // Calculate summary statistics
    const adminVaults = memberships.filter(m => m.role === "admin");
    const memberVaults = memberships.filter(m => m.role === "member");
    const totalValueLocked = memberships.reduce((total, membership) => {
      const assets = BigInt(membership.totalAssets || "0");
      return total + Number(assets) / 1e6; // Convert from USDC units (6 decimals)
    }, 0);

    return NextResponse.json({
      userAddress,
      memberships,
      summary: {
        totalVaults: memberships.length,
        adminVaults: adminVaults.length,
        memberVaults: memberVaults.length,
        totalValueLocked: totalValueLocked.toFixed(2),
      },
      factoryAddress,
      chainId: CHAIN_ID,
    });
  } catch (error) {
    console.error("Error in simple memberships API:", error);
    return NextResponse.json(
      { error: "Failed to fetch user vault memberships", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
