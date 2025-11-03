// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./DeployHelpers.s.sol";
import {GroupVault} from "../contracts/GroupVault.sol";
import {VaultFactory} from "../contracts/VaultFactory.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AaveV3Strategy} from "../contracts/strategies/AaveV3Strategy.sol";
import {IPool} from "../contracts/interfaces/aave/IPool.sol";
import {CometUSDCStrategy} from "../contracts/strategies/CometUSDCStrategy.sol";
import {IComet} from "../contracts/interfaces/compound/IComet.sol";
import {UniswapV3LPStrategy} from "../contracts/strategies/UniswapV3LPStrategy.sol";
import {INonfungiblePositionManager} from "../contracts/interfaces/uniswap/INonfungiblePositionManager.sol";

/**
 * @notice Deploy script for NestFi contracts
 * @dev Deploys GroupVault implementation and VaultFactory
 *
 * Example: yarn deploy --file DeployNestFi.s.sol
 */
contract DeployNestFi is ScaffoldETHDeploy {
    function run() external {
        vm.startBroadcast();

        // Use real USDC & Permit2 from env
        address usdc = vm.envAddress("USDC");
        address permit2Address = vm.envAddress("PERMIT2");

        // Deploy GroupVault implementation
        GroupVault implementation = new GroupVault();
        console.log("GroupVault implementation deployed at:", address(implementation));

        // Deploy VaultFactory with implementation and Permit2
        VaultFactory factory = new VaultFactory(implementation, permit2Address);
        console.log("VaultFactory deployed at:", address(factory));

        // Optionally deploy AaveV3Strategy (requires AAVE_V3_POOL env var)
        address poolAddr = vm.envOr("AAVE_V3_POOL", address(0));
        if (poolAddr != address(0)) {
            AaveV3Strategy strategy = new AaveV3Strategy(IERC20(usdc), IPool(poolAddr));
            console.log("AaveV3Strategy deployed at:", address(strategy));
        }

        address cometAddr = vm.envOr("COMET_USDC", address(0));
        if (cometAddr != address(0)) {
            CometUSDCStrategy cstrategy = new CometUSDCStrategy(IERC20(usdc), IComet(cometAddr));
            console.log("CometUSDCStrategy deployed at:", address(cstrategy));
        }

        // Optional Uniswap V3 LP strategy (requires NFPM, TOKEN1, FEE, TICKS)
        address nfpmAddr = vm.envOr("UNIV3_NFPM", address(0));
        address token1 = vm.envOr("UNIV3_TOKEN1", address(0));
        uint24 fee = uint24(vm.envOr("UNIV3_FEE", uint256(500))); // default 0.05%
        int24 tickLower = int24(vm.envOr("UNIV3_TICK_LOWER", int256(-887220)));
        int24 tickUpper = int24(vm.envOr("UNIV3_TICK_UPPER", int256(887220)));
        if (nfpmAddr != address(0) && token1 != address(0)) {
            UniswapV3LPStrategy u3 = new UniswapV3LPStrategy(
                IERC20(usdc),
                IERC20(token1),
                INonfungiblePositionManager(nfpmAddr),
                fee,
                tickLower,
                tickUpper
            );
            console.log("UniswapV3LPStrategy deployed at:", address(u3));
        }

        vm.stopBroadcast();
    }
}
