// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import {GroupVault} from "../contracts/GroupVault.sol";
import {VaultFactory} from "../contracts/VaultFactory.sol";
import {CuratorStaking} from "../contracts/CuratorStaking.sol";
import {MockUSDC} from "../contracts/mocks/MockERC20.sol";
import {MockPermit2} from "../contracts/mocks/MockPermit2.sol";
import {MockStrategy} from "../contracts/mocks/MockStrategy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NestFi smoke test
 * @dev End-to-end: curator stakes, creates vault, investor deposits,
 *      curator invests + divests, investor withdraws. Also exercises
 *      idle buffer enforcement.
 */
contract NestFiTest is Test {
    MockUSDC usdc;
    MockPermit2 permit2;
    CuratorStaking staking;
    GroupVault impl;
    VaultFactory factory;

    address deployer = address(0xD1);
    address curator = address(0xC1);
    address investor = address(0x11);
    address investor2 = address(0x12);

    GroupVault vault;
    MockStrategy strat;

    uint256 constant DEPOSIT_CAP = 100_000e6;
    uint256 constant MIN_DEPOSIT = 10e6;
    uint256 constant IDLE_BPS = 1000; // 10%

    function setUp() public {
        vm.startPrank(deployer);
        usdc = new MockUSDC();
        permit2 = new MockPermit2();
        staking = new CuratorStaking(address(usdc));
        impl = new GroupVault();
        factory = new VaultFactory(impl, staking, address(usdc), address(permit2));
        staking.setFactory(address(factory));
        vm.stopPrank();

        // seed
        usdc.mint(curator, 100_000e6);
        usdc.mint(investor, 10_000e6);
        usdc.mint(investor2, 10_000e6);

        // curator creates vault
        vm.startPrank(curator);
        uint256 stakeAmount = factory.computeStakeAmount(DEPOSIT_CAP);
        usdc.approve(address(staking), stakeAmount);
        address v = factory.createVault("NestFi", "nFi", false, DEPOSIT_CAP, MIN_DEPOSIT, IDLE_BPS);
        vault = GroupVault(v);

        // register mock strategy
        strat = new MockStrategy(IERC20(address(usdc)), v);
        vault.addStrategy("mock", address(strat));
        vm.stopPrank();
    }

    // -----------------------------------------------------
    // Deployment / init
    // -----------------------------------------------------
    function test_factory_tracksVault() public view {
        assertEq(factory.getTotalVaultCount(), 1);
        assertEq(factory.vaultOwner(address(vault)), curator);
        assertEq(factory.getVaultsByUser(curator)[0], address(vault));
    }

    function test_staking_receivedStake() public view {
        uint256 expected = (DEPOSIT_CAP * 200) / 10_000;
        assertEq(staking.stakeOf(curator), expected);
        assertEq(usdc.balanceOf(address(staking)), expected);
    }

    function test_vault_initParams() public view {
        assertEq(vault.owner(), curator);
        assertEq(vault.asset(), address(usdc));
        assertEq(vault.depositCap(), DEPOSIT_CAP);
        assertEq(vault.minDeposit(), MIN_DEPOSIT);
        assertEq(vault.idleBufferBps(), IDLE_BPS);
    }

    // -----------------------------------------------------
    // Deposits
    // -----------------------------------------------------
    function test_deposit_mintsSharesOneToOne() public {
        vm.startPrank(investor);
        usdc.approve(address(vault), 1_000e6);
        uint256 shares = vault.deposit(1_000e6, investor);
        vm.stopPrank();

        assertEq(shares, vault.balanceOf(investor));
        assertEq(vault.totalAssets(), 1_000e6);
        assertEq(vault.idleAssets(), 1_000e6);
    }

    function test_deposit_belowMinReverts() public {
        vm.startPrank(investor);
        usdc.approve(address(vault), 5e6);
        vm.expectRevert(GroupVault.MinDepositNotMet.selector);
        vault.deposit(5e6, investor);
        vm.stopPrank();
    }

    function test_deposit_overCapReverts() public {
        vm.startPrank(investor);
        usdc.mint(investor, DEPOSIT_CAP + 1e6);
        usdc.approve(address(vault), type(uint256).max);
        vm.expectRevert(GroupVault.DepositCapExceeded.selector);
        vault.deposit(DEPOSIT_CAP + 1e6, investor);
        vm.stopPrank();
    }

    // -----------------------------------------------------
    // Invest / divest / idle buffer
    // -----------------------------------------------------
    function test_invest_up_to_idleBuffer() public {
        _deposit(investor, 1_000e6);

        // 10% idle buffer -> curator can invest at most 900 USDC
        vm.startPrank(curator);
        vault.invest("mock", 900e6);
        vm.stopPrank();

        assertEq(vault.idleAssets(), 100e6);
        assertEq(vault.investedAssets(), 900e6);
        assertEq(vault.totalAssets(), 1_000e6);
    }

    function test_invest_breachingIdleBufferReverts() public {
        _deposit(investor, 1_000e6);

        // Trying to invest 901 USDC would leave 99 idle (<10% of 1000)
        vm.startPrank(curator);
        vm.expectRevert(GroupVault.IdleBufferBreached.selector);
        vault.invest("mock", 901e6);
        vm.stopPrank();
    }

    function test_invest_unknownStrategyReverts() public {
        _deposit(investor, 1_000e6);
        vm.startPrank(curator);
        vm.expectRevert(GroupVault.StrategyNotFound.selector);
        vault.invest("nope", 100e6);
        vm.stopPrank();
    }

    function test_divest_pullsBack() public {
        _deposit(investor, 1_000e6);
        vm.prank(curator);
        vault.invest("mock", 800e6);

        vm.prank(curator);
        vault.divest("mock", 500e6);

        assertEq(vault.idleAssets(), 700e6);
        assertEq(vault.investedAssets(), 300e6);
        assertEq(vault.totalAssets(), 1_000e6);
    }

    // -----------------------------------------------------
    // Withdrawals
    // -----------------------------------------------------
    function test_withdraw_fromIdle_succeeds() public {
        _deposit(investor, 1_000e6);
        vm.prank(curator);
        vault.invest("mock", 800e6);

        // Idle = 200 USDC — investor can withdraw up to that
        vm.startPrank(investor);
        vault.withdraw(150e6, investor, investor);
        vm.stopPrank();

        assertEq(usdc.balanceOf(investor), 10_000e6 - 1_000e6 + 150e6);
    }

    function test_withdraw_exceedingIdle_reverts() public {
        _deposit(investor, 1_000e6);
        vm.prank(curator);
        vault.invest("mock", 900e6);

        vm.startPrank(investor);
        vm.expectRevert(
            abi.encodeWithSelector(GroupVault.InsufficientIdle.selector, 500e6, 100e6)
        );
        vault.withdraw(500e6, investor, investor);
        vm.stopPrank();
    }

    function test_withdraw_afterDivest_succeeds() public {
        _deposit(investor, 1_000e6);
        vm.prank(curator);
        vault.invest("mock", 900e6);

        // Investor needs 500, curator divests
        vm.prank(curator);
        vault.divest("mock", 400e6);

        vm.prank(investor);
        vault.withdraw(500e6, investor, investor);

        assertEq(usdc.balanceOf(investor), 10_000e6 - 1_000e6 + 500e6);
    }

    // -----------------------------------------------------
    // Access control
    // -----------------------------------------------------
    function test_nonOwner_cannotInvest() public {
        _deposit(investor, 1_000e6);
        vm.expectRevert(); // Ownable: not owner
        vm.prank(investor);
        vault.invest("mock", 100e6);
    }

    function test_nonFactory_cannotStakeFor() public {
        vm.expectRevert(CuratorStaking.NotFactory.selector);
        staking.stakeFor(curator, 1e6);
    }

    function test_setFactory_onlyOnce() public {
        vm.expectRevert(CuratorStaking.FactoryAlreadySet.selector);
        vm.prank(deployer);
        staking.setFactory(address(0xdead));
    }

    // -----------------------------------------------------
    // helpers
    // -----------------------------------------------------
    function _deposit(address who, uint256 amt) internal {
        vm.startPrank(who);
        usdc.approve(address(vault), amt);
        vault.deposit(amt, who);
        vm.stopPrank();
    }
}
