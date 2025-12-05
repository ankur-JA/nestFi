// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {GroupVault} from "../contracts/GroupVault.sol";
import {VaultFactory} from "../contracts/VaultFactory.sol";
import {VaultManager} from "../contracts/VaultManager.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MockUSDC, MockDAI} from "../contracts/mocks/MockERC20.sol";
import {MockPermit2} from "../contracts/mocks/MockPermit2.sol";
import {MockSwapRouter} from "../contracts/mocks/MockSwapRouter.sol";
import {MockStrategy} from "../contracts/mocks/MockStrategy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployLocal
 * @dev Deploy all NestFi contracts locally with mocks for testing
 * 
 * Usage:
 *   # Start local node
 *   anvil
 *   
 *   # In another terminal, deploy
 *   forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast
 */
contract DeployLocal is Script {
    // Deployed addresses (will be logged)
    MockUSDC public usdc;
    MockDAI public dai;
    MockPermit2 public permit2;
    MockSwapRouter public swapRouter;
    VaultManager public vaultManager;
    GroupVault public vaultImplementation;
    VaultFactory public factory;
    MockStrategy public aaveStrategy;
    MockStrategy public uniswapStrategy;
    
    // Test accounts
    address public deployer;
    address public curator;
    address public investor1;
    address public investor2;

    function run() external {
        // Use anvil's default accounts
        uint256 deployerKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        deployer = vm.addr(deployerKey);
        
        // Other test accounts (anvil default accounts)
        curator = address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
        investor1 = address(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC);
        investor2 = address(0x90F79bf6EB2c4f870365E785982E1f101E93b906);

        console.log("===========================================");
        console.log("    NESTFI LOCAL DEPLOYMENT");
        console.log("===========================================");
        console.log("");
        console.log("Deployer:", deployer);
        console.log("Curator:", curator);
        console.log("Investor1:", investor1);
        console.log("Investor2:", investor2);
        console.log("");

        vm.startBroadcast(deployerKey);

        // ============ DEPLOY MOCKS ============
        console.log("--- Deploying Mocks ---");
        
        // Deploy mock tokens
        usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));
        
        dai = new MockDAI();
        console.log("MockDAI deployed at:", address(dai));
        
        // Deploy mock Permit2
        permit2 = new MockPermit2();
        console.log("MockPermit2 deployed at:", address(permit2));
        
        // Deploy mock SwapRouter
        swapRouter = new MockSwapRouter();
        console.log("MockSwapRouter deployed at:", address(swapRouter));
        
        // Configure swap router
        swapRouter.setDecimals(address(usdc), 6);
        swapRouter.setDecimals(address(dai), 18);
        swapRouter.setPrice(address(usdc), address(dai), 10000); // 1 USDC = 1 DAI
        swapRouter.setPrice(address(dai), address(usdc), 10000); // 1 DAI = 1 USDC

        // ============ DEPLOY CORE CONTRACTS ============
        console.log("");
        console.log("--- Deploying Core Contracts ---");
        
        // Deploy VaultManager with UUPS proxy
        VaultManager managerImpl = new VaultManager();
        console.log("VaultManager implementation:", address(managerImpl));
        
        bytes memory initData = abi.encodeWithSelector(
            VaultManager.initialize.selector,
            deployer
        );
        ERC1967Proxy managerProxy = new ERC1967Proxy(
            address(managerImpl),
            initData
        );
        vaultManager = VaultManager(address(managerProxy));
        console.log("VaultManager proxy:", address(vaultManager));
        
        // Configure VaultManager
        vaultManager.setSwapRouter(address(swapRouter));
        vaultManager.setDefaultSwapFee(3000); // 0.3%
        
        // Deploy GroupVault implementation
        vaultImplementation = new GroupVault();
        console.log("GroupVault implementation:", address(vaultImplementation));
        
        // Deploy VaultFactory
        factory = new VaultFactory(
            vaultImplementation, 
            address(permit2), 
            address(vaultManager)
        );
        console.log("VaultFactory:", address(factory));

        // ============ DEPLOY MOCK STRATEGIES ============
        console.log("");
        console.log("--- Deploying Mock Strategies ---");
        
        aaveStrategy = new MockStrategy(IERC20(address(usdc)), "Mock Aave", 500); // 5% APY
        console.log("MockAaveStrategy:", address(aaveStrategy));
        
        uniswapStrategy = new MockStrategy(IERC20(address(usdc)), "Mock Uniswap LP", 1000); // 10% APY
        console.log("MockUniswapStrategy:", address(uniswapStrategy));

        // ============ MINT TEST TOKENS ============
        console.log("");
        console.log("--- Minting Test Tokens ---");
        
        // Mint USDC to test accounts
        uint256 mintAmount = 100_000 * 10**6; // 100k USDC
        usdc.mint(deployer, mintAmount);
        usdc.mint(curator, mintAmount);
        usdc.mint(investor1, mintAmount);
        usdc.mint(investor2, mintAmount);
        console.log("Minted 100k USDC to each test account");
        
        // Mint DAI to test accounts
        uint256 daiMintAmount = 100_000 * 10**18; // 100k DAI
        dai.mint(deployer, daiMintAmount);
        dai.mint(curator, daiMintAmount);
        dai.mint(investor1, daiMintAmount);
        dai.mint(investor2, daiMintAmount);
        console.log("Minted 100k DAI to each test account");
        
        // Fund swap router with tokens for swaps
        usdc.mint(address(swapRouter), 1_000_000 * 10**6);
        dai.mint(address(swapRouter), 1_000_000 * 10**18);
        console.log("Funded SwapRouter with 1M USDC and 1M DAI");

        vm.stopBroadcast();

        // ============ OUTPUT SUMMARY ============
        console.log("");
        console.log("===========================================");
        console.log("    DEPLOYMENT COMPLETE!");
        console.log("===========================================");
        console.log("");
        console.log("--- Contract Addresses ---");
        console.log("USDC:", address(usdc));
        console.log("DAI:", address(dai));
        console.log("Permit2:", address(permit2));
        console.log("SwapRouter:", address(swapRouter));
        console.log("VaultManager:", address(vaultManager));
        console.log("GroupVault Impl:", address(vaultImplementation));
        console.log("VaultFactory:", address(factory));
        console.log("AaveStrategy:", address(aaveStrategy));
        console.log("UniswapStrategy:", address(uniswapStrategy));
        console.log("");
        console.log("--- Test Accounts ---");
        console.log("Deployer:", deployer, "- 100k USDC, 100k DAI");
        console.log("Curator:", curator, "- 100k USDC, 100k DAI");
        console.log("Investor1:", investor1, "- 100k USDC, 100k DAI");
        console.log("Investor2:", investor2, "- 100k USDC, 100k DAI");
        console.log("");
        console.log("--- Environment Variables for Frontend ---");
        console.log("NEXT_PUBLIC_USDC_ADDRESS=", address(usdc));
        console.log("NEXT_PUBLIC_DAI_ADDRESS=", address(dai));
        console.log("NEXT_PUBLIC_VAULT_FACTORY=", address(factory));
        console.log("NEXT_PUBLIC_VAULT_MANAGER=", address(vaultManager));
        console.log("");
    }
}
