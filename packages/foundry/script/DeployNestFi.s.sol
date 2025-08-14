// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import {GroupVault} from "../contracts/GroupVault.sol";
import {VaultFactory} from "../contracts/VaultFactory.sol";
import {ERC7702Relayer} from "../contracts/ERC7702Relayer.sol";
import {MockUSDC} from "../contracts/MockUSDC.sol";
import {MockPermit2} from "../contracts/MockPermit2.sol";

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

        // Deploy Mock USDC for testing
        MockUSDC mockUSDC = new MockUSDC();
        console.log("MockUSDC deployed at:", address(mockUSDC));

        // Deploy Mock Permit2 for testing
        MockPermit2 mockPermit2 = new MockPermit2();
        console.log("MockPermit2 deployed at:", address(mockPermit2));

        // Deploy ERC-7702 Relayer first
        address gasToken = address(mockUSDC); // Using Mock USDC as gas token
        uint256 gasPriceInToken = 1e6; // 1 USDC per 100k gas (6 decimals for USDC)

        ERC7702Relayer erc7702Relayer = new ERC7702Relayer(gasToken, gasPriceInToken);
        console.log("ERC7702Relayer deployed at:", address(erc7702Relayer));

        // Deploy GroupVault implementation
        GroupVault implementation = new GroupVault();
        console.log("GroupVault implementation deployed at:", address(implementation));

        // Deploy VaultFactory with implementation and Permit2
        address permit2Address = address(mockPermit2);
        
        VaultFactory factory = new VaultFactory(implementation, permit2Address);
        console.log("VaultFactory deployed at:", address(factory));

        // Set up ERC-7702 relayer authorization
        erc7702Relayer.setRelayerAuthorization(address(factory), true);
        console.log("VaultFactory authorized as ERC-7702 relayer");

        // Mint some USDC to the deployer for testing
        mockUSDC.mint(vm.addr(deployerPrivateKey), 100000 * 10**6); // 100k USDC
        console.log("Minted 100k USDC to deployer for testing");

        vm.stopBroadcast();
    }
}
