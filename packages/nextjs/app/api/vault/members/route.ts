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
  "event AllowlistUpdated(address indexed user, bool allowed)",
  "event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vaultAddress = searchParams.get("vaultAddress");

    if (!vaultAddress) {
      return NextResponse.json({ error: "Vault address is required" }, { status: 400 });
    }

    if (!isAddress(vaultAddress)) {
      return NextResponse.json({ error: "Invalid vault address format" }, { status: 400 });
    }

    console.log(`Fetching members for vault: ${vaultAddress}`);

    const memberMap = new Map<string, { isActive: boolean; source: string }>();
    
    // Get current block number
    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock = currentBlock > 10n ? currentBlock - 10n : 0n;
    
    console.log(`Scanning from block ${fromBlock} to ${currentBlock}`);

    // 1. Check vault owner
    try {
      const owner = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "owner",
      }) as string;
      
      if (owner && owner !== "0x0000000000000000000000000000000000000000") {
        memberMap.set(owner.toLowerCase(), { isActive: true, source: "owner" });
        console.log("Found vault owner:", owner);
      }
    } catch (err) {
      console.log("Error fetching vault owner:", err);
    }

    // 2. Check AllowlistUpdated events
    try {
      const logs = await publicClient.getLogs({
        address: vaultAddress as `0x${string}`,
        event: vaultABI[4] as any, // AllowlistUpdated event
        fromBlock,
        toBlock: currentBlock,
      });

      console.log(`Found ${logs.length} AllowlistUpdated events`);
      
      logs.forEach((log: any) => {
        const { user, allowed } = log.args;
        memberMap.set(user.toLowerCase(), { isActive: allowed, source: "allowlist" });
      });
    } catch (err) {
      console.log("Error fetching AllowlistUpdated events:", err);
      // If it's an RPC limit error, try with even smaller range
      if (err instanceof Error && err.message.includes("block range")) {
        console.log("RPC block range limit hit, trying with smaller range...");
        try {
          const smallerFromBlock = currentBlock > 5n ? currentBlock - 5n : 0n;
          const logs = await publicClient.getLogs({
            address: vaultAddress as `0x${string}`,
            event: vaultABI[4] as any,
            fromBlock: smallerFromBlock,
            toBlock: currentBlock,
          });
          console.log(`Found ${logs.length} AllowlistUpdated events with smaller range`);
          logs.forEach((log: any) => {
            const { user, allowed } = log.args;
            if (user) {
              memberMap.set(user.toLowerCase(), { isActive: allowed, source: "allowlist" });
            }
          });
        } catch (smallErr) {
          console.log("Even smaller range failed:", smallErr);
        }
      }
    }

    // 3. Check Deposit events
    try {
      const depositLogs = await publicClient.getLogs({
        address: vaultAddress as `0x${string}`,
        event: vaultABI[5] as any, // Deposit event
        fromBlock,
        toBlock: currentBlock,
      });

      console.log(`Found ${depositLogs.length} Deposit events`);
      
      const depositors = new Set<string>();
      depositLogs.forEach((log: any) => {
        if (log.args.owner) {
          depositors.add(log.args.owner.toLowerCase());
        }
      });

      // Check current balance for each depositor
      for (const depositor of depositors) {
        try {
          const balance = await publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: vaultABI,
            functionName: "balanceOf",
            args: [depositor as `0x${string}`],
          }) as bigint;
          
          if (balance > 0n) {
            memberMap.set(depositor, { isActive: true, source: "depositor" });
            console.log(`Found depositor with balance: ${depositor}, balance: ${balance.toString()}`);
          }
        } catch (err) {
          console.log(`Error checking balance for ${depositor}:`, err);
        }
      }
    } catch (err) {
      console.log("Error fetching Deposit events:", err);
      // If it's an RPC limit error, try with even smaller range
      if (err instanceof Error && err.message.includes("block range")) {
        console.log("RPC block range limit hit for deposits, trying with smaller range...");
        try {
          const smallerFromBlock = currentBlock > 5n ? currentBlock - 5n : 0n;
          const depositLogs = await publicClient.getLogs({
            address: vaultAddress as `0x${string}`,
            event: vaultABI[5] as any,
            fromBlock: smallerFromBlock,
            toBlock: currentBlock,
          });
          console.log(`Found ${depositLogs.length} Deposit events with smaller range`);
          const depositors = new Set<string>();
          depositLogs.forEach((log: any) => {
            const { caller } = log.args;
            if (caller) depositors.add(caller.toLowerCase());
          });
          depositors.forEach(depositor => {
            if (!memberMap.has(depositor)) {
              memberMap.set(depositor, { isActive: true, source: "deposit" });
            }
          });
        } catch (smallErr) {
          console.log("Even smaller range failed for deposits:", smallErr);
        }
      }
    }

    // Convert to array
    const members = Array.from(memberMap.entries()).map(([address, data]) => ({
      address,
      isActive: data.isActive,
      source: data.source,
    }));

    console.log(`Final member list: ${members.length} members`);
    members.forEach(member => {
      console.log(`- ${member.address} (${member.source}) - Active: ${member.isActive}`);
    });

    return NextResponse.json({
      vaultAddress,
      members,
      totalMembers: members.length,
      scanRange: {
        fromBlock: fromBlock.toString(),
        toBlock: currentBlock.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching vault members:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault members", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
