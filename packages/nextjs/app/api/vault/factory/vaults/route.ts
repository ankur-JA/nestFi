import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { sepolia } from "viem/chains";
import deployedContracts from "../../../../../contracts/deployedContracts";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/JfjuIv_X8UDcQcKmIwnsY", {
    timeout: 10000,
    retryCount: 2,
  }),
});

const factoryABI = parseAbi([
  "event VaultCreated(address indexed vault, address indexed admin, address indexed asset, string name, string symbol)",
  "function getVaultsByUser(address user) view returns (address[])",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("user");

    const factoryAddress = (deployedContracts as any)[CHAIN_ID]?.VaultFactory?.address;
    
    if (!factoryAddress) {
      return NextResponse.json({ error: "Vault factory not deployed on this network" }, { status: 400 });
    }

    console.log(`Fetching vaults from factory: ${factoryAddress}`);

    let vaults: string[] = [];

    if (userAddress) {
      // Get vaults created by specific user
      try {
        const userVaults = await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: factoryABI,
          functionName: "getVaultsByUser",
          args: [userAddress as `0x${string}`],
        }) as string[];
        
        vaults = userVaults;
        console.log(`Found ${vaults.length} vaults created by user ${userAddress}`);
      } catch (error) {
        console.error("Error fetching user vaults:", error);
        // Fall back to event-based discovery
      }
    }

    // If no user-specific vaults found or no user specified, discover all vaults via events
    if (vaults.length === 0) {
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > 10n ? currentBlock - 10n : 0n;
        
        console.log(`Scanning VaultCreated events from block ${fromBlock} to ${currentBlock}`);

        const logs = await publicClient.getLogs({
          address: factoryAddress as `0x${string}`,
          event: factoryABI[0] as any, // VaultCreated event
          fromBlock,
          toBlock: currentBlock,
        });

        vaults = logs.map((log: any) => log.args?.vault as string).filter(Boolean);
        console.log(`Found ${vaults.length} vaults via event scanning`);
      } catch (error) {
        console.error("Error scanning vault creation events:", error);
        return NextResponse.json(
          { error: "Failed to fetch vaults from factory" },
          { status: 500 }
        );
      }
    }

    // Remove duplicates and filter out zero addresses
    const uniqueVaults = Array.from(new Set(vaults)).filter(
      address => address && address !== "0x0000000000000000000000000000000000000000"
    );

    return NextResponse.json({
      factoryAddress,
      vaults: uniqueVaults,
      totalVaults: uniqueVaults.length,
      chainId: CHAIN_ID,
    });
  } catch (error) {
    console.error("Error in factory vaults API:", error);
    return NextResponse.json(
      { error: "Failed to fetch vaults from factory", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
