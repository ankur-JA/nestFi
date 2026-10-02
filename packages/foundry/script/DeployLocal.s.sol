// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {GroupVault} from "../contracts/GroupVault.sol";
import {VaultFactory} from "../contracts/VaultFactory.sol";
import {CuratorStaking} from "../contracts/CuratorStaking.sol";
import {MockUSDC} from "../contracts/mocks/MockERC20.sol";
import {MockPermit2} from "../contracts/mocks/MockPermit2.sol";
import {MockStrategy} from "../contracts/mocks/MockStrategy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployLocal
 * @dev Local anvil deployment with mocks. Produces a ready-to-use setup:
 *      - MockUSDC + MockPermit2
 *      - CuratorStaking
 *      - GroupVault implementation + VaultFactory (wired to CuratorStaking)
 *      - One sample vault owned by `curator` with a mock strategy registered
 *      - `investor1` seeded with USDC and deposited into the sample vault
 *
 * Usage:
 *   anvil (in another terminal)
 *   forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast --ffi
 */
contract DeployLocal is Script {
    MockUSDC public usdc;
    MockPermit2 public permit2;
    CuratorStaking public staking;
    GroupVault public vaultImpl;
    VaultFactory public factory;
    MockStrategy public mockStrategy;
    GroupVault public sampleVault;

    address public deployer;
    address public curator;
    address public investor1;
    address public investor2;

    function run() external {
        uint256 deployerKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        // Anvil's default accounts 1, 2, 3 (deterministic from mnemonic).
        uint256 curatorKey   = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
        uint256 investor1Key = 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a;
        uint256 investor2Key = 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6;

        deployer = vm.addr(deployerKey);
        curator = vm.addr(curatorKey);
        investor1 = vm.addr(investor1Key);
        investor2 = vm.addr(investor2Key);

        console.log("====== NestFi Local Deployment ======");
        console.log("Deployer:", deployer);
        console.log("Curator :", curator);

        vm.startBroadcast(deployerKey);

        // 1) Mocks
        usdc = new MockUSDC();
        permit2 = new MockPermit2();
        console.log("MockUSDC   :", address(usdc));
        console.log("MockPermit2:", address(permit2));

        // 2) Staking
        staking = new CuratorStaking(address(usdc));
        console.log("CuratorStaking:", address(staking));

        // 3) Vault implementation
        vaultImpl = new GroupVault();
        console.log("GroupVault impl:", address(vaultImpl));

        // 4) Factory
        factory = new VaultFactory(vaultImpl, staking, address(usdc), address(permit2));
        console.log("VaultFactory :", address(factory));

        // Wire factory into staking (one-time)
        staking.setFactory(address(factory));

        // 5) Seed accounts with USDC
        usdc.mint(curator, 100_000e6);
        usdc.mint(investor1, 10_000e6);
        usdc.mint(investor2, 10_000e6);
        usdc.mint(deployer, 1_000e6);

        vm.stopBroadcast();

        // 6) Curator creates a sample vault (depositCap=100k USDC, min=10 USDC, idleBps=1000)
        vm.startBroadcast(curatorKey);
        uint256 stakeAmount = factory.computeStakeAmount(100_000e6); // 2000 USDC
        usdc.approve(address(staking), stakeAmount);
        address vaultAddr = factory.createVault(
            "NestFi Blue Chip Yield",
            "nestBCY",
            false, // allowlist disabled for demo
            100_000e6,
            10e6,
            1000 // 10% idle buffer
        );
        sampleVault = GroupVault(vaultAddr);
        console.log("Sample vault :", vaultAddr);

        // Add a mock strategy
        mockStrategy = new MockStrategy(IERC20(address(usdc)), vaultAddr);
        console.log("MockStrategy :", address(mockStrategy));
        sampleVault.addStrategy("mock", address(mockStrategy));
        vm.stopBroadcast();

        // 7) Investor1 deposits
        vm.startBroadcast(investor1Key);
        usdc.approve(vaultAddr, 1_000e6);
        sampleVault.deposit(1_000e6, investor1);
        vm.stopBroadcast();

        // 8) Curator invests 85% into mock strategy (leaving 15% idle)
        vm.startBroadcast(curatorKey);
        sampleVault.invest("mock", 850e6);
        vm.stopBroadcast();

        console.log("====== Final State ======");
        console.log("sampleVault.totalAssets()    :", sampleVault.totalAssets());
        console.log("sampleVault.idleAssets()     :", sampleVault.idleAssets());
        console.log("sampleVault.investedAssets() :", sampleVault.investedAssets());
        console.log("investor1 shares             :", sampleVault.balanceOf(investor1));
    }
}
