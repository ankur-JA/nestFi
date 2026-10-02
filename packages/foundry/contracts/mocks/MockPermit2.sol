// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IPermit2} from "../interfaces/IPermit2.sol";

/// @dev Minimal Permit2 stub for local tests. Trusts the signature struct and uses standard ERC20 approvals under the hood.
contract MockPermit2 is IPermit2 {
    using SafeERC20 for IERC20;

    // owner => token => (amount, expiration)
    mapping(address => mapping(address => mapping(address => uint160))) public allowances;

    function permit(
        address owner,
        PermitSingle calldata p,
        Signature calldata /*sig*/
    ) external {
        allowances[owner][p.token][p.spender] = p.amount;
    }

    function transferFrom(address from, address to, uint160 amount, address token) external {
        // Only the stored spender can pull.
        require(allowances[from][token][msg.sender] >= amount, "Permit2: insufficient");
        allowances[from][token][msg.sender] -= amount;
        IERC20(token).safeTransferFrom(from, to, amount);
    }
}
