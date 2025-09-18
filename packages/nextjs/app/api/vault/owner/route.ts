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

// ABI for reading vault owner
const vaultABI = parseAbi([
  "function owner() view returns (address)",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Vault address is required" }, { status: 400 });
    }

    console.log(`Fetching vault owner for: ${address}`);

    let owner = "0x0000000000000000000000000000000000000000";

    try {
      owner = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "owner",
      }) as string;
    } catch (e) {
      console.log("Could not read owner:", e);
    }

    return NextResponse.json({
      owner,
    });
  } catch (error) {
    console.error("Error in vault owner API:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault owner" },
      { status: 500 }
    );
  }
}