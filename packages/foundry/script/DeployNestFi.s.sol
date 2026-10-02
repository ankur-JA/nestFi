// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./DeployHelpers.s.sol";
import {GroupVault} from "../contracts/GroupVault.sol";
import {VaultFactory} from "../contracts/VaultFactory.sol";
import {CuratorStaking} from "../contracts/CuratorStaking.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AaveV3Strategy} from "../contracts/strategies/AaveV3Strategy.sol";
import {IPool} from "../contracts/interfaces/aave/IPool.sol";
import {BeefyStrategy} from "../contracts/strategies/BeefyStrategy.sol";
import {IBeefyVault} from "../contracts/interfaces/beefy/IBeefyVault.sol";
import {VelodromeStrategy} from "../contracts/strategies/VelodromeStrategy.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {IVelodromeGauge} from "../contracts/interfaces/velodrome/IVelodromeGauge.sol";

/**
 * @notice Production/testnet deployment for NestFi.
 * @dev Deploys CuratorStaking, GroupVault implementation, VaultFactory, and
 *      optionally the DeFi strategy adapters when their env vars are present.
 *
 * Required env vars:
 *   USDC    - USDC token address on target chain
 *   PERMIT2 - Permit2 contract (or address(0) to disable)
 *
 * Optional strategy env vars (deployed only if set):
 *   AAVE_V3_POOL
 *   BEEFY_VAULT
 *   VELODROME_LP_VAULT + VELODROME_GAUGE
 */
contract DeployNestFi is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        address usdc = vm.envAddress("USDC");
        address permit2 = vm.envOr("PERMIT2", address(0));

        // 1) CuratorStaking
        CuratorStaking staking = new CuratorStaking(usdc);
        console.log("CuratorStaking :", address(staking));

        // 2) GroupVault implementation
        GroupVault impl = new GroupVault();
        console.log("GroupVault impl:", address(impl));

        // 3) Factory, wired to staking
        VaultFactory factory = new VaultFactory(impl, staking, usdc, permit2);
        console.log("VaultFactory   :", address(factory));

        // One-time wire: tell staking which factory can call stakeFor
        staking.setFactory(address(factory));

        // 4) Optional strategies — adapters are created but not pre-registered
        //    (curators register them per-vault via GroupVault.addStrategy).
        address pool = vm.envOr("AAVE_V3_POOL", address(0));
        if (pool != address(0)) {
            AaveV3Strategy strat = new AaveV3Strategy(IERC20(usdc), IPool(pool));
            console.log("AaveV3Strategy :", address(strat));
        }

        address beefy = vm.envOr("BEEFY_VAULT", address(0));
        if (beefy != address(0)) {
            BeefyStrategy strat = new BeefyStrategy(IERC20(usdc), IBeefyVault(beefy));
            console.log("BeefyStrategy  :", address(strat));
        }

        address veloLp = vm.envOr("VELODROME_LP_VAULT", address(0));
        address veloGauge = vm.envOr("VELODROME_GAUGE", address(0));
        if (veloLp != address(0) && veloGauge != address(0)) {
            VelodromeStrategy strat = new VelodromeStrategy(
                IERC20(usdc),
                IERC4626(veloLp),
                IVelodromeGauge(veloGauge)
            );
            console.log("VelodromeStrategy:", address(strat));
        }
    }
}
