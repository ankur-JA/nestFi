// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./DeployHelpers.s.sol";
import {GroupVault} from "../contracts/GroupVault.sol";
import {VaultFactory} from "../contracts/VaultFactory.sol";
import {VaultManager} from "../contracts/VaultManager.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AaveV3Strategy} from "../contracts/strategies/AaveV3Strategy.sol";
import {IPool} from "../contracts/interfaces/aave/IPool.sol";
import {BeefyStrategy} from "../contracts/strategies/BeefyStrategy.sol";
import {IBeefyVault} from "../contracts/interfaces/beefy/IBeefyVault.sol";
import {VelodromeStrategy} from "../contracts/strategies/VelodromeStrategy.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {IVelodromeGauge} from "../contracts/interfaces/velodrome/IVelodromeGauge.sol";

/**
 * @notice Deploy script for NestFi contracts
 * @dev Deploys VaultManager (UUPS proxy), GroupVault implementation, and VaultFactory
 *
 * Required env vars:
 *   USDC - USDC token address
 *   PERMIT2 - Permit2 contract address
 *   SWAP_ROUTER - Uniswap V3 SwapRouter address
 *
 * Example: yarn deploy --file DeployNestFi.s.sol
 */
contract DeployNestFi is ScaffoldETHDeploy {
    function run() external {
        vm.startBroadcast();

        // Use real USDC & Permit2 from env
        address usdc = vm.envAddress("USDC");
        address permit2Address = vm.envAddress("PERMIT2");
        address swapRouterAddress = vm.envOr("SWAP_ROUTER", address(0));

        // Deploy VaultManager with UUPS proxy
        VaultManager managerImpl = new VaultManager();
        console.log("VaultManager implementation deployed at:", address(managerImpl));
        
        bytes memory initData = abi.encodeWithSelector(
            VaultManager.initialize.selector,
            msg.sender // owner
        );
        ERC1967Proxy managerProxy = new ERC1967Proxy(
            address(managerImpl),
            initData
        );
        VaultManager vaultManager = VaultManager(address(managerProxy));
        console.log("VaultManager proxy deployed at:", address(vaultManager));

        // Configure VaultManager
        if (swapRouterAddress != address(0)) {
            vaultManager.setSwapRouter(swapRouterAddress);
            console.log("SwapRouter set to:", swapRouterAddress);
        }
        vaultManager.setDefaultSwapFee(3000); // 0.3%

        // Deploy GroupVault implementation
        GroupVault implementation = new GroupVault();
        console.log("GroupVault implementation deployed at:", address(implementation));

        // Deploy VaultFactory with implementation, Permit2, and VaultManager
        VaultFactory factory = new VaultFactory(implementation, permit2Address, address(vaultManager));
        console.log("VaultFactory deployed at:", address(factory));

        // Optionally deploy AaveV3Strategy (requires AAVE_V3_POOL env var)
        address poolAddr = vm.envOr("AAVE_V3_POOL", address(0));
        if (poolAddr != address(0)) {
            AaveV3Strategy strategy = new AaveV3Strategy(IERC20(usdc), IPool(poolAddr));
            console.log("AaveV3Strategy deployed at:", address(strategy));
        } else {
            console.log("Skipping AaveV3Strategy deployment (no AAVE_V3_POOL env var)");
        }

        // Optionally deploy BeefyStrategy (requires BEEFY_VAULT env var)
        address beefyVaultAddr = vm.envOr("BEEFY_VAULT", address(0));
        if (beefyVaultAddr != address(0)) {
            BeefyStrategy beefyStrategy = new BeefyStrategy(IERC20(usdc), IBeefyVault(beefyVaultAddr));
            console.log("BeefyStrategy deployed at:", address(beefyStrategy));
        } else {
            console.log("Skipping BeefyStrategy deployment (no BEEFY_VAULT env var)");
        }

        // Optionally deploy VelodromeStrategy (requires VELODROME_LP_VAULT and VELODROME_GAUGE env vars)
        address velodromeLpVaultAddr = vm.envOr("VELODROME_LP_VAULT", address(0));
        address velodromeGaugeAddr = vm.envOr("VELODROME_GAUGE", address(0));
        if (velodromeLpVaultAddr != address(0) && velodromeGaugeAddr != address(0)) {
            VelodromeStrategy velodromeStrategy = new VelodromeStrategy(
                IERC20(usdc),
                IERC4626(velodromeLpVaultAddr),
                IVelodromeGauge(velodromeGaugeAddr)
            );
            console.log("VelodromeStrategy deployed at:", address(velodromeStrategy));
        } else {
            console.log("Skipping VelodromeStrategy deployment (no VELODROME_LP_VAULT or VELODROME_GAUGE env var)");
        }

        vm.stopBroadcast();
    }
}
