// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IPermit2 {
    struct PermitSingle {
        address token;
        uint160 amount;
        uint48 expiration;
        uint48 nonce;
        address spender;
        uint48 sigDeadline;
    }

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    function permit(
        address owner,
        PermitSingle calldata permitSingle,
        Signature calldata signature
    ) external;

    function transferFrom(
        address from,
        address to,
        uint160 amount,
        address token
    ) external;
}
