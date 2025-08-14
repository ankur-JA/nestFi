// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockPermit2
 * @dev Mock Permit2 contract for testing purposes
 */
contract MockPermit2 {
    struct PermitSingle {
        address token;
        address spender;
        uint160 amount;
        uint48 expiration;
        uint48 nonce;
    }

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public nonces;

    function permit(
        address owner,
        PermitSingle calldata permitSingle,
        Signature calldata signature
    ) external {
        // Mock implementation - just approve the spender
        allowance[owner][permitSingle.spender] = permitSingle.amount;
        nonces[owner]++;
    }

    function transferFrom(
        address from,
        address to,
        uint160 amount,
        address token
    ) external {
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        allowance[from][msg.sender] -= amount;
        IERC20(token).transferFrom(from, to, amount);
    }

    function approve(
        address token,
        address spender,
        uint160 amount,
        uint48 expiration
    ) external {
        allowance[msg.sender][spender] = amount;
    }
}
