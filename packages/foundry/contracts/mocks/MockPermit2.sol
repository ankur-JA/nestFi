// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IPermit2} from "../interfaces/IPermit2.sol";

/**
 * @title MockPermit2
 * @dev Mock Permit2 for local testing - simplified version
 */
contract MockPermit2 is IPermit2 {
    using SafeERC20 for IERC20;

    // Simplified - just do a regular transferFrom
    function permit(
        address owner,
        PermitSingle calldata permitSingle,
        Signature calldata signature
    ) external override {
        // In real Permit2, this verifies the signature and sets allowance
        // For testing, we just skip signature verification
    }

    function transferFrom(
        address from,
        address to,
        uint160 amount,
        address token
    ) external override {
        IERC20(token).safeTransferFrom(from, to, amount);
    }
}
