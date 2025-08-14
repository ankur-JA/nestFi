// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title ERC-7702: Gasless Transactions with ERC-20 Gas Payments
 * @dev Interface for ERC-7702 standard that allows users to pay gas fees with ERC-20 tokens
 */
interface IERC7702 {
    /**
     * @dev Emitted when gas is paid with ERC-20 tokens
     * @param user The address of the user who paid gas
     * @param token The ERC-20 token used for gas payment
     * @param amount The amount of tokens used for gas
     * @param gasUsed The amount of gas used in the transaction
     */
    event GasPaidWithToken(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 gasUsed
    );

    /**
     * @dev Emitted when a relayer is authorized
     * @param relayer The address of the authorized relayer
     * @param authorized Whether the relayer is authorized
     */
    event RelayerAuthorized(address indexed relayer, bool authorized);

    /**
     * @dev Emitted when gas token is set
     * @param token The ERC-20 token to be used for gas payments
     */
    event GasTokenSet(address indexed token);

    /**
     * @dev Struct for gas payment data
     * @param user The address of the user
     * @param token The ERC-20 token for gas payment
     * @param amount The amount of tokens to use for gas
     * @param deadline The deadline for the gas payment
     * @param signature The signature for the gas payment
     */
    struct GasPayment {
        address user;
        address token;
        uint256 amount;
        uint256 deadline;
        bytes signature;
    }

    /**
     * @dev Struct for permit data
     * @param owner The token owner
     * @param spender The spender address
     * @param value The amount to approve
     * @param deadline The deadline for the permit
     * @param v The v component of the signature
     * @param r The r component of the signature
     * @param s The s component of the signature
     */
    struct Permit {
        address owner;
        address spender;
        uint256 value;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    /**
     * @dev Execute a transaction with ERC-20 gas payment
     * @param target The target contract to call
     * @param data The calldata to execute
     * @param gasPayment The gas payment data
     */
    function executeWithGasPayment(
        address target,
        bytes calldata data,
        GasPayment calldata gasPayment
    ) external;

    /**
     * @dev Execute a transaction with permit and ERC-20 gas payment
     * @param target The target contract to call
     * @param data The calldata to execute
     * @param gasPayment The gas payment data
     * @param permit The permit data for token approval
     */
    function executeWithPermitAndGasPayment(
        address target,
        bytes calldata data,
        GasPayment calldata gasPayment,
        Permit calldata permit
    ) external;

    /**
     * @dev Set the ERC-20 token to be used for gas payments
     * @param token The ERC-20 token address
     */
    function setGasToken(address token) external;

    /**
     * @dev Authorize or deauthorize a relayer
     * @param relayer The relayer address
     * @param authorized Whether to authorize the relayer
     */
    function setRelayerAuthorization(address relayer, bool authorized) external;

    /**
     * @dev Get the current gas token
     * @return The address of the gas token
     */
    function gasToken() external view returns (address);

    /**
     * @dev Check if an address is an authorized relayer
     * @param relayer The relayer address to check
     * @return Whether the relayer is authorized
     */
    function isAuthorizedRelayer(address relayer) external view returns (bool);

    /**
     * @dev Get the gas price in terms of the gas token
     * @return The gas price in gas token units
     */
    function getGasPriceInToken() external view returns (uint256);

    /**
     * @dev Estimate the gas cost in terms of the gas token
     * @param gasLimit The gas limit for the transaction
     * @return The estimated gas cost in gas token units
     */
    function estimateGasCostInToken(uint256 gasLimit) external view returns (uint256);
}
