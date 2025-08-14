import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { anvil } from "viem/chains";

const publicClient = createPublicClient({
  chain: anvil,
  transport: http("http://127.0.0.1:8545"),
});

// Basic ABI for reading vault owner
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

    // Read vault owner from contract
    const owner = await publicClient.readContract({
      address: address as `0x${string}`,
      abi: vaultABI,
      functionName: "owner",
    });

    return NextResponse.json({ owner });
  } catch (error) {
    console.error("Error fetching vault owner:", error);
    return NextResponse.json({ error: "Failed to fetch vault owner" }, { status: 500 });
  }
}
