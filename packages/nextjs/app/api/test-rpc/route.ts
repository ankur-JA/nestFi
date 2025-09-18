import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/JfjuIv_X8UDcQcKmIwnsY", {
    timeout: 10000,
    retryCount: 2,
  }),
});

export async function GET() {
  try {
    console.log("🧪 Testing RPC connection...");
    console.log("🧪 RPC URL:", process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/JfjuIv_X8UDcQcKmIwnsY");
    
    // Test basic RPC connection
    const blockNumber = await publicClient.getBlockNumber();
    console.log("🧪 Current block number:", blockNumber.toString());
    
    // Test reading a simple contract (USDC on Sepolia)
    const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    try {
      const name = await publicClient.readContract({
        address: usdcAddress as `0x${string}`,
        abi: [
          {
            "inputs": [],
            "name": "name",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        functionName: "name",
      });
      console.log("🧪 USDC name:", name);
    } catch (err) {
      console.error("🧪 Error reading USDC name:", err);
    }
    
    // Test the specific vault address to see if it's a contract
    const specificVault = "0xba230e7c7E39D09443d8Da0a332DD787BD1352cb";
    try {
      console.log("🧪 Testing if specific vault is a contract...");
      const code = await publicClient.getBytecode({
        address: specificVault as `0x${string}`,
        blockTag: "latest",
      });
      
      if (code && code !== "0x") {
        console.log("🧪 Specific vault IS a contract (has bytecode)");
        console.log("🧪 Bytecode length:", code.length);
      } else {
        console.log("🧪 Specific vault is NOT a contract (no bytecode)");
        console.log("🧪 This is likely an EOA (Externally Owned Account)");
      }
    } catch (err) {
      console.error("🧪 Error checking if specific vault is a contract:", err);
    }
    
    return NextResponse.json({
      success: true,
      blockNumber: blockNumber.toString(),
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/JfjuIv_X8UDcQcKmIwnsY",
      message: "RPC connection successful"
    });
  } catch (error) {
    console.error("🧪 RPC test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/JfjuIv_X8UDcQcKmIwnsY",
      message: "RPC connection failed"
    }, { status: 500 });
  }
}
