// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import {GroupVault} from "../contracts/GroupVault.sol";
import {VaultFactory} from "../contracts/VaultFactory.sol";
import {ERC7702Relayer} from "../contracts/ERC7702Relayer.sol";
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
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Use real USDC & Permit2 from env
        address usdc = vm.envAddress("USDC");
        address permit2Address = vm.envAddress("PERMIT2");

        // Deploy ERC-7702 Relayer first
        address gasToken = usdc; // Gas token in production (e.g., USDC)
        uint256 gasPriceInToken = 1e6; // 1 USDC per 100k gas (6 decimals for USDC)

        ERC7702Relayer erc7702Relayer = new ERC7702Relayer(gasToken, gasPriceInToken);
        console.log("ERC7702Relayer deployed at:", address(erc7702Relayer));

        // Deploy GroupVault implementation
        GroupVault implementation = new GroupVault();
        console.log("GroupVault implementation deployed at:", address(implementation));

        // Deploy VaultFactory with implementation and Permit2
        VaultFactory factory = new VaultFactory(implementation, permit2Address);
        console.log("VaultFactory deployed at:", address(factory));

        // Set up ERC-7702 relayer authorization
        erc7702Relayer.setRelayerAuthorization(address(factory), true);
        console.log("VaultFactory authorized as ERC-7702 relayer");

        // Optionally, for local dev you may mint externally; in prod we skip minting

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
        int24 tickLower = int24(uint24(vm.envOr("UNIV3_TICK_LOWER", uint256(-887220))));
        int24 tickUpper = int24(uint24(vm.envOr("UNIV3_TICK_UPPER", uint256(887220))));
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
