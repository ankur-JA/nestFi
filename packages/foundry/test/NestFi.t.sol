// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {GroupVault} from "../contracts/GroupVault.sol";
import {VaultFactory} from "../contracts/VaultFactory.sol";
import {VaultManager} from "../contracts/VaultManager.sol";
import {IVaultManager} from "../contracts/interfaces/IVaultManager.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MockUSDC, MockDAI} from "../contracts/mocks/MockERC20.sol";
import {MockPermit2} from "../contracts/mocks/MockPermit2.sol";
import {MockSwapRouter} from "../contracts/mocks/MockSwapRouter.sol";
import {MockStrategy} from "../contracts/mocks/MockStrategy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NestFiTest
 * @dev Comprehensive test suite for NestFi contracts
 */
contract NestFiTest is Test {
    // Contracts
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
    address public deployer = address(1);
    address public curator = address(2);
    address public investor1 = address(3);
    address public investor2 = address(4);

    // Test vault
    address public testVault;

    function setUp() public {
        vm.startPrank(deployer);

        // Deploy mock tokens
        usdc = new MockUSDC();
        dai = new MockDAI();

        // Deploy mock Permit2
        permit2 = new MockPermit2();

        // Deploy mock SwapRouter
        swapRouter = new MockSwapRouter();
        swapRouter.setDecimals(address(usdc), 6);
        swapRouter.setDecimals(address(dai), 18);
        swapRouter.setPrice(address(usdc), address(dai), 10000);
        swapRouter.setPrice(address(dai), address(usdc), 10000);

        // Deploy VaultManager with UUPS proxy
        VaultManager managerImpl = new VaultManager();
        bytes memory initData = abi.encodeWithSelector(
            VaultManager.initialize.selector,
            deployer
        );
        ERC1967Proxy managerProxy = new ERC1967Proxy(
            address(managerImpl),
            initData
        );
        vaultManager = VaultManager(address(managerProxy));
        vaultManager.setSwapRouter(address(swapRouter));
        vaultManager.setDefaultSwapFee(3000);

        // Deploy GroupVault implementation
        vaultImplementation = new GroupVault();

        // Deploy VaultFactory
        factory = new VaultFactory(
            vaultImplementation,
            address(permit2),
            address(vaultManager)
        );

        // Deploy mock strategies
        aaveStrategy = new MockStrategy(IERC20(address(usdc)), "Mock Aave", 500);
        uniswapStrategy = new MockStrategy(IERC20(address(usdc)), "Mock Uniswap LP", 1000);

        // Mint tokens
        usdc.mint(deployer, 1_000_000 * 10**6);
        usdc.mint(curator, 1_000_000 * 10**6);
        usdc.mint(investor1, 1_000_000 * 10**6);
        usdc.mint(investor2, 1_000_000 * 10**6);
        usdc.mint(address(swapRouter), 10_000_000 * 10**6);
        
        dai.mint(deployer, 1_000_000 * 10**18);
        dai.mint(address(swapRouter), 10_000_000 * 10**18);

        vm.stopPrank();
    }

    // ============ VAULT CREATION TESTS ============

    function test_CreateVault_Instant() public {
        vm.startPrank(curator);

        testVault = factory.createVault(
            address(usdc),
            curator,
            "Test Vault",
            "TV",
            false, // no allowlist
            100_000 * 10**6, // 100k cap
            100 * 10**6, // 100 min deposit
            0, // INSTANT model
            10 // 10% buffer
        );

        assertTrue(testVault != address(0), "Vault should be created");
        
        GroupVault vault = GroupVault(testVault);
        assertEq(vault.name(), "Test Vault");
        assertEq(vault.symbol(), "TV");
        assertEq(vault.depositCap(), 100_000 * 10**6);
        assertEq(vault.minDeposit(), 100 * 10**6);
        
        // Check withdrawal model
        assertEq(vault.getWithdrawModelName(), "Instant");

        vm.stopPrank();
    }

    function test_CreateVault_Epoch() public {
        vm.startPrank(curator);

        testVault = factory.createVault(
            address(usdc),
            curator,
            "Epoch Vault",
            "EV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            2, // EPOCH model
            604800 // 7 days
        );

        GroupVault vault = GroupVault(testVault);
        assertEq(vault.getWithdrawModelName(), "Epoch");

        vm.stopPrank();
    }

    function test_CreateVault_Scheduled() public {
        vm.startPrank(curator);

        testVault = factory.createVault(
            address(usdc),
            curator,
            "Scheduled Vault",
            "SV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            1, // SCHEDULED model
            0
        );

        GroupVault vault = GroupVault(testVault);
        assertEq(vault.getWithdrawModelName(), "Scheduled");

        vm.stopPrank();
    }

    // ============ DEPOSIT TESTS ============

    function test_Deposit() public {
        // Create vault first
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Test Vault",
            "TV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            0,
            10
        );

        GroupVault vault = GroupVault(testVault);

        // Investor deposits
        vm.startPrank(investor1);
        usdc.approve(testVault, 10_000 * 10**6);
        uint256 shares = vault.deposit(10_000 * 10**6, investor1);
        vm.stopPrank();

        assertGt(shares, 0, "Should receive shares");
        assertEq(vault.balanceOf(investor1), shares);
        assertEq(vault.totalAssets(), 10_000 * 10**6);
        
        console.log("Deposited 10,000 USDC, received", shares, "shares");
    }

    function test_Deposit_BelowMin_Reverts() public {
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Test Vault",
            "TV",
            false,
            100_000 * 10**6,
            100 * 10**6, // 100 USDC minimum
            0,
            10
        );

        GroupVault vault = GroupVault(testVault);

        vm.startPrank(investor1);
        usdc.approve(testVault, 50 * 10**6);
        
        vm.expectRevert(GroupVault.MinDepositNotMet.selector);
        vault.deposit(50 * 10**6, investor1); // Below minimum
        vm.stopPrank();
    }

    // ============ WITHDRAWAL TESTS ============

    function test_Withdraw_Instant() public {
        // Create vault and deposit
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Test Vault",
            "TV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            0, // INSTANT
            10 // 10% buffer - but since we're not investing, all is idle
        );

        GroupVault vault = GroupVault(testVault);

        vm.startPrank(investor1);
        usdc.approve(testVault, 10_000 * 10**6);
        vault.deposit(10_000 * 10**6, investor1);

        // Withdraw - since nothing is invested, all assets are idle
        // so withdrawal should succeed
        uint256 balanceBefore = usdc.balanceOf(investor1);
        vault.withdraw(5_000 * 10**6, investor1, investor1);
        uint256 balanceAfter = usdc.balanceOf(investor1);
        vm.stopPrank();

        assertEq(balanceAfter - balanceBefore, 5_000 * 10**6);
        console.log("Withdrew 5,000 USDC successfully");
    }
    
    function test_Withdraw_Instant_WithInvestment() public {
        // Create vault with INSTANT model
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Test Vault",
            "TV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            0, // INSTANT
            10 // 10% buffer
        );

        GroupVault vault = GroupVault(testVault);

        // Deposit 10k
        vm.startPrank(investor1);
        usdc.approve(testVault, 10_000 * 10**6);
        vault.deposit(10_000 * 10**6, investor1);
        vm.stopPrank();

        // Curator invests 5k, leaving 5k idle (50% buffer)
        vm.startPrank(curator);
        vault.addStrategy("aave", address(aaveStrategy));
        vault.approveManagerMax(address(usdc));
        vault.invest("aave", 5_000 * 10**6);
        vm.stopPrank();

        // Now try to withdraw - should work because 5k idle > withdrawal amount
        vm.startPrank(investor1);
        uint256 balanceBefore = usdc.balanceOf(investor1);
        vault.withdraw(3_000 * 10**6, investor1, investor1); // Withdraw less than idle
        uint256 balanceAfter = usdc.balanceOf(investor1);
        vm.stopPrank();

        assertEq(balanceAfter - balanceBefore, 3_000 * 10**6);
        console.log("Withdrew 3,000 USDC with investment active");
    }
    
    function test_Withdraw_Instant_ExceedsBuffer_Reverts() public {
        // Create vault with INSTANT model
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Test Vault",
            "TV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            0, // INSTANT
            10 // 10% buffer
        );

        GroupVault vault = GroupVault(testVault);

        // Deposit 10k
        vm.startPrank(investor1);
        usdc.approve(testVault, 10_000 * 10**6);
        vault.deposit(10_000 * 10**6, investor1);
        vm.stopPrank();

        // Curator invests 9k, leaving only 1k idle
        vm.startPrank(curator);
        vault.addStrategy("aave", address(aaveStrategy));
        vault.approveManagerMax(address(usdc));
        vault.invest("aave", 9_000 * 10**6);
        vm.stopPrank();

        // Try to withdraw more than idle buffer - should fail
        vm.startPrank(investor1);
        vm.expectRevert();
        vault.withdraw(5_000 * 10**6, investor1, investor1);
        vm.stopPrank();
    }

    function test_Withdraw_Epoch_BeforeEnd_Reverts() public {
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Epoch Vault",
            "EV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            2, // EPOCH
            604800 // 7 days
        );

        GroupVault vault = GroupVault(testVault);

        // Deposit
        vm.startPrank(investor1);
        usdc.approve(testVault, 10_000 * 10**6);
        vault.deposit(10_000 * 10**6, investor1);

        // Try to withdraw before epoch ends
        vm.expectRevert();
        vault.withdraw(5_000 * 10**6, investor1, investor1);
        vm.stopPrank();
    }

    function test_Withdraw_Epoch_AfterEnd() public {
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Epoch Vault",
            "EV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            2, // EPOCH
            604800 // 7 days
        );

        GroupVault vault = GroupVault(testVault);

        // Deposit
        vm.startPrank(investor1);
        usdc.approve(testVault, 10_000 * 10**6);
        vault.deposit(10_000 * 10**6, investor1);
        vm.stopPrank();

        // Fast forward past epoch
        vm.warp(block.timestamp + 8 days);

        // Now withdraw should work
        vm.prank(investor1);
        vault.withdraw(5_000 * 10**6, investor1, investor1);

        console.log("Withdrew after epoch ended successfully");
    }

    // ============ SWAP TESTS ============

    function test_SwapTokens() public {
        // Create vault and deposit
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Test Vault",
            "TV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            0,
            10
        );

        GroupVault vault = GroupVault(testVault);

        // Deposit
        vm.startPrank(investor1);
        usdc.approve(testVault, 10_000 * 10**6);
        vault.deposit(10_000 * 10**6, investor1);
        vm.stopPrank();

        // Curator approves manager and swaps
        vm.startPrank(curator);
        vault.approveManagerMax(address(usdc));
        
        uint256 usdcBefore = usdc.balanceOf(testVault);
        uint256 daiBefore = dai.balanceOf(testVault);
        
        uint256 amountOut = vault.swapTokens(
            address(usdc),
            address(dai),
            5_000 * 10**6, // 5k USDC
            4_900 * 10**18, // min 4.9k DAI
            3000 // 0.3% fee
        );
        
        uint256 usdcAfter = usdc.balanceOf(testVault);
        uint256 daiAfter = dai.balanceOf(testVault);
        vm.stopPrank();

        assertEq(usdcBefore - usdcAfter, 5_000 * 10**6, "Should spend 5k USDC");
        assertGt(daiAfter, daiBefore, "Should receive DAI");
        
        console.log("Swapped 5,000 USDC for", amountOut / 10**18, "DAI");
    }

    // ============ STRATEGY TESTS ============

    function test_InvestInStrategy() public {
        // Create vault and deposit
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Test Vault",
            "TV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            0,
            10
        );

        GroupVault vault = GroupVault(testVault);

        // Deposit
        vm.startPrank(investor1);
        usdc.approve(testVault, 10_000 * 10**6);
        vault.deposit(10_000 * 10**6, investor1);
        vm.stopPrank();

        // Curator adds strategy and invests
        vm.startPrank(curator);
        vault.addStrategy("aave", address(aaveStrategy));
        vault.approveManagerMax(address(usdc));
        
        uint256 vaultBalanceBefore = usdc.balanceOf(testVault);
        vault.invest("aave", 5_000 * 10**6);
        uint256 vaultBalanceAfter = usdc.balanceOf(testVault);
        vm.stopPrank();

        assertEq(vaultBalanceBefore - vaultBalanceAfter, 5_000 * 10**6);
        assertEq(aaveStrategy.totalAssets(), 5_000 * 10**6);
        
        // Total assets should still be the same
        assertEq(vault.totalAssets(), 10_000 * 10**6);
        
        console.log("Invested 5,000 USDC in Aave strategy");
    }

    function test_DivestFromStrategy() public {
        // Setup: create, deposit, invest
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Test Vault",
            "TV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            0,
            10
        );

        GroupVault vault = GroupVault(testVault);

        vm.startPrank(investor1);
        usdc.approve(testVault, 10_000 * 10**6);
        vault.deposit(10_000 * 10**6, investor1);
        vm.stopPrank();

        vm.startPrank(curator);
        vault.addStrategy("aave", address(aaveStrategy));
        vault.approveManagerMax(address(usdc));
        vault.invest("aave", 5_000 * 10**6);

        // Now divest
        uint256 vaultBalanceBefore = usdc.balanceOf(testVault);
        vault.divest("aave", 3_000 * 10**6);
        uint256 vaultBalanceAfter = usdc.balanceOf(testVault);
        vm.stopPrank();

        assertEq(vaultBalanceAfter - vaultBalanceBefore, 3_000 * 10**6);
        assertEq(aaveStrategy.totalAssets(), 2_000 * 10**6);
        
        console.log("Divested 3,000 USDC from Aave strategy");
    }

    // ============ WITHDRAW QUEUE TESTS ============

    function test_RequestWithdraw_Scheduled() public {
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Scheduled Vault",
            "SV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            1, // SCHEDULED
            0
        );

        GroupVault vault = GroupVault(testVault);

        // Deposit
        vm.startPrank(investor1);
        usdc.approve(testVault, 10_000 * 10**6);
        vault.deposit(10_000 * 10**6, investor1);

        // Request withdrawal
        uint256 sharesBefore = vault.balanceOf(investor1);
        uint256 requestId = vault.requestWithdraw(5_000 * 10**6);
        uint256 sharesAfter = vault.balanceOf(investor1);
        vm.stopPrank();

        // Shares should be locked in vault
        assertEq(sharesBefore - sharesAfter, 5_000 * 10**6);
        assertEq(vault.balanceOf(testVault), 5_000 * 10**6);
        
        console.log("Requested withdrawal, request ID:", requestId);
    }

    // ============ VIEW FUNCTION TESTS ============

    function test_GetVaultState() public {
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "Test Vault",
            "TV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            0,
            10
        );

        GroupVault vault = GroupVault(testVault);

        // Deposit
        vm.startPrank(investor1);
        usdc.approve(testVault, 10_000 * 10**6);
        vault.deposit(10_000 * 10**6, investor1);
        vm.stopPrank();

        (
            uint256 totalAssetsAmount,
            uint256 assetsInVault,
            uint256 assetsInStrategies,
            bool isPaused,
            uint256 currentDepositCap,
            uint256 currentMinDeposit,
            bool isAllowlistEnabled,
            address manager
        ) = vault.getVaultState();

        assertEq(totalAssetsAmount, 10_000 * 10**6);
        assertEq(assetsInVault, 10_000 * 10**6);
        assertEq(assetsInStrategies, 0);
        assertFalse(isPaused);
        assertEq(currentDepositCap, 100_000 * 10**6);
        assertEq(currentMinDeposit, 100 * 10**6);
        assertFalse(isAllowlistEnabled);
        assertEq(manager, address(vaultManager));
    }

    // ============ END TO END TEST ============

    function test_EndToEnd_FullFlow() public {
        console.log("");
        console.log("=== END TO END TEST ===");
        console.log("");

        // 1. Curator creates vault
        console.log("1. Creating vault...");
        vm.prank(curator);
        testVault = factory.createVault(
            address(usdc),
            curator,
            "NestFi Test Vault",
            "NFTV",
            false,
            100_000 * 10**6,
            100 * 10**6,
            0, // INSTANT
            10 // 10% buffer
        );
        console.log("   Vault created at:", testVault);

        GroupVault vault = GroupVault(testVault);

        // 2. Multiple investors deposit
        console.log("2. Investors depositing...");
        
        vm.startPrank(investor1);
        usdc.approve(testVault, 20_000 * 10**6);
        vault.deposit(20_000 * 10**6, investor1);
        vm.stopPrank();
        console.log("   Investor1 deposited 20,000 USDC");

        vm.startPrank(investor2);
        usdc.approve(testVault, 30_000 * 10**6);
        vault.deposit(30_000 * 10**6, investor2);
        vm.stopPrank();
        console.log("   Investor2 deposited 30,000 USDC");

        console.log("   Total assets:", vault.totalAssets() / 10**6, "USDC");
        // Total = 50k USDC

        // 3. Curator swaps some USDC to DAI (swap less to maintain buffer)
        console.log("3. Curator swapping tokens...");
        vm.startPrank(curator);
        vault.approveManagerMax(address(usdc));
        vault.swapTokens(address(usdc), address(dai), 10_000 * 10**6, 9_000 * 10**18, 3000);
        vm.stopPrank();
        console.log("   Swapped 10,000 USDC to DAI");
        console.log("   USDC balance:", usdc.balanceOf(testVault) / 10**6);
        console.log("   DAI balance:", dai.balanceOf(testVault) / 10**18);
        // Now: 40k USDC + 10k DAI worth

        // 4. Curator invests in strategy (invest less to maintain buffer)
        console.log("4. Curator investing in strategy...");
        vm.startPrank(curator);
        vault.addStrategy("aave", address(aaveStrategy));
        vault.invest("aave", 20_000 * 10**6); // Invest 20k, leaves 20k USDC idle
        vm.stopPrank();
        console.log("   Invested 20,000 USDC in Aave");
        console.log("   Idle USDC:", vault.idleAssets() / 10**6);
        console.log("   Invested:", vault.investedAssets() / 10**6);
        // Now: 20k USDC idle + 20k in Aave + ~10k DAI

        // 5. Investor withdraws (withdraw from idle buffer)
        console.log("5. Investor1 withdrawing...");
        uint256 withdrawAmount = 5_000 * 10**6; // Withdraw 5k from 20k idle
        vm.prank(investor1);
        vault.withdraw(withdrawAmount, investor1, investor1);
        console.log("   Investor1 withdrew 5,000 USDC");
        console.log("   Remaining idle:", vault.idleAssets() / 10**6);

        // 6. Curator divests for more liquidity
        console.log("6. Curator divesting for liquidity...");
        vm.prank(curator);
        vault.divest("aave", 10_000 * 10**6);
        console.log("   Divested 10,000 USDC from Aave");

        // Final state
        console.log("");
        console.log("=== FINAL STATE ===");
        console.log("Total Assets:", vault.totalAssets() / 10**6, "USDC");
        console.log("Idle Assets:", vault.idleAssets() / 10**6, "USDC");
        console.log("Invested:", vault.investedAssets() / 10**6, "USDC");
        console.log("Investor1 shares:", vault.balanceOf(investor1) / 10**6);
        console.log("Investor2 shares:", vault.balanceOf(investor2) / 10**6);
        console.log("");
    }
}
