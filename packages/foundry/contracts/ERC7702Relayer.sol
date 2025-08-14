// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC7702} from "./interfaces/IERC7702.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title ERC7702Relayer
 * @dev Implementation of ERC-7702 for gasless transactions with ERC-20 gas payments
 */
contract ERC7702Relayer is IERC7702, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // Gas token for payments
    address public gasToken;
    
    // Gas price in terms of gas token (e.g., 1 USDC per 100k gas)
    uint256 public gasPriceInToken;
    
    // Authorized relayers
    mapping(address => bool) public authorizedRelayers;
    
    // Nonce for replay protection
    mapping(address => uint256) public nonces;
    
    // Domain separator for EIP-712
    bytes32 public immutable DOMAIN_SEPARATOR;
    
    // Gas payment typehash
    bytes32 public constant GAS_PAYMENT_TYPEHASH = keccak256(
        "GasPayment(address user,address token,uint256 amount,uint256 deadline,uint256 nonce)"
    );

    constructor(address _gasToken, uint256 _gasPriceInToken) Ownable(msg.sender) {
        gasToken = _gasToken;
        gasPriceInToken = _gasPriceInToken;
        
        // Set deployer as authorized relayer
        authorizedRelayers[msg.sender] = true;
        
        // Setup EIP-712 domain separator
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("ERC7702Relayer")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
        
        emit GasTokenSet(_gasToken);
        emit RelayerAuthorized(msg.sender, true);
    }

    /**
     * @dev Execute a transaction with ERC-20 gas payment
     */
    function executeWithGasPayment(
        address target,
        bytes calldata data,
        GasPayment calldata gasPayment
    ) external override nonReentrant {
        require(authorizedRelayers[msg.sender], "Not authorized relayer");
        require(block.timestamp <= gasPayment.deadline, "Gas payment expired");
        require(gasPayment.token == gasToken, "Invalid gas token");
        
        _executeWithGasPayment(target, data, gasPayment);
    }

    /**
     * @dev Internal function to execute with gas payment
     */
    function _executeWithGasPayment(
        address target,
        bytes calldata data,
        GasPayment calldata gasPayment
    ) internal {
        // Verify signature
        bytes32 structHash = keccak256(
            abi.encode(
                GAS_PAYMENT_TYPEHASH,
                gasPayment.user,
                gasPayment.token,
                gasPayment.amount,
                gasPayment.deadline,
                nonces[gasPayment.user]++
            )
        );
        
        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
        
        address signer = hash.recover(gasPayment.signature);
        require(signer == gasPayment.user, "Invalid signature");
        
        // Calculate gas cost
        uint256 gasUsed = gasleft();
        
        // Execute the transaction
        (bool success, ) = target.call(data);
        require(success, "Transaction failed");
        
        gasUsed = gasUsed - gasleft();
        
        // Calculate gas cost in tokens
        uint256 gasCostInToken = (gasUsed * gasPriceInToken) / 1e18;
        require(gasCostInToken <= gasPayment.amount, "Insufficient gas payment");
        
        // Transfer gas payment from user to relayer
        IERC20(gasToken).transferFrom(gasPayment.user, msg.sender, gasCostInToken);
        
        // Refund excess payment
        if (gasCostInToken < gasPayment.amount) {
            IERC20(gasToken).transferFrom(gasPayment.user, gasPayment.user, gasPayment.amount - gasCostInToken);
        }
        
        emit GasPaidWithToken(gasPayment.user, gasPayment.token, gasCostInToken, gasUsed);
    }

    /**
     * @dev Execute a transaction with permit and ERC-20 gas payment
     */
    function executeWithPermitAndGasPayment(
        address target,
        bytes calldata data,
        GasPayment calldata gasPayment,
        Permit calldata permit
    ) external override nonReentrant {
        require(authorizedRelayers[msg.sender], "Not authorized relayer");
        require(block.timestamp <= gasPayment.deadline, "Gas payment expired");
        require(gasPayment.token == gasToken, "Invalid gas token");
        
        // Execute permit first
        IERC20Permit(gasPayment.token).permit(
            permit.owner,
            permit.spender,
            permit.value,
            permit.deadline,
            permit.v,
            permit.r,
            permit.s
        );
        
        // Then execute with gas payment
        _executeWithGasPayment(target, data, gasPayment);
    }

    /**
     * @dev Set the ERC-20 token to be used for gas payments
     */
    function setGasToken(address _gasToken) external override onlyOwner {
        gasToken = _gasToken;
        emit GasTokenSet(_gasToken);
    }

    /**
     * @dev Set gas price in terms of gas token
     */
    function setGasPriceInToken(uint256 _gasPriceInToken) external onlyOwner {
        gasPriceInToken = _gasPriceInToken;
    }

    /**
     * @dev Authorize or deauthorize a relayer
     */
    function setRelayerAuthorization(address relayer, bool authorized) external override onlyOwner {
        authorizedRelayers[relayer] = authorized;
        emit RelayerAuthorized(relayer, authorized);
    }

    /**
     * @dev Check if an address is an authorized relayer
     */
    function isAuthorizedRelayer(address relayer) external view override returns (bool) {
        return authorizedRelayers[relayer];
    }

    /**
     * @dev Get the gas price in terms of the gas token
     */
    function getGasPriceInToken() external view override returns (uint256) {
        return gasPriceInToken;
    }

    /**
     * @dev Estimate the gas cost in terms of the gas token
     */
    function estimateGasCostInToken(uint256 gasLimit) external view override returns (uint256) {
        return (gasLimit * gasPriceInToken) / 1e18;
    }

    /**
     * @dev Get current nonce for a user
     */
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }

    /**
     * @dev Emergency function to recover stuck tokens
     */
    function emergencyRecover(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }
}
