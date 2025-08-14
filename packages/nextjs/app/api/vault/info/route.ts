import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { anvil } from "viem/chains";

const publicClient = createPublicClient({
  chain: anvil,
  transport: http("http://127.0.0.1:8545"),
});

// Basic ABI for reading vault info
const vaultABI = parseAbi([
  "function asset() view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function allowlistEnabled() view returns (bool)",
  "function depositCap() view returns (uint256)",
  "function minDeposit() view returns (uint256)",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Vault address is required" }, { status: 400 });
    }

    // Read vault info from contract
    const [asset, name, symbol, allowlistEnabled, depositCap, minDeposit] = await Promise.all([
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "asset",
      }),
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "name",
      }),
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: vaultABI,
        functionName: "symbol",
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

    return NextResponse.json({
      asset,
      name,
      symbol,
      allowlistEnabled,
      depositCap: depositCap.toString(),
      minDeposit: minDeposit.toString(),
    });
  } catch (error) {
    console.error("Error fetching vault info:", error);
    return NextResponse.json({ error: "Failed to fetch vault info" }, { status: 500 });
  }
}
