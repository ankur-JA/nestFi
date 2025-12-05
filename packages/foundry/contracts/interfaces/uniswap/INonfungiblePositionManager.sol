// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @title Uniswap V3 Nonfungible Position Manager Interface
interface INonfungiblePositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    struct IncreaseLiquidityParams {
        uint256 tokenId;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    struct DecreaseLiquidityParams {
        uint256 tokenId;
        uint128 liquidity;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    struct CollectParams {
        uint256 tokenId;
        address recipient;
        uint128 amount0Max;
        uint128 amount1Max;
    }

    /// @notice Creates a new position wrapped in a NFT
    function mint(MintParams calldata params)
        external
        payable
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );

    /// @notice Increases liquidity in the current range
    function increaseLiquidity(IncreaseLiquidityParams calldata params)
        external
        payable
        returns (
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );

    /// @notice Decreases the amount of liquidity in a position and accounts it to the position
    function decreaseLiquidity(DecreaseLiquidityParams calldata params)
        external
        payable
        returns (uint256 amount0, uint256 amount1);

    /// @notice Collects up to a maximum amount of fees owed to a specific position to the recipient
    function collect(CollectParams calldata params) external payable returns (uint256 amount0, uint256 amount1);

    /// @notice Burns a token ID, which deletes it from the NFT contract
    function burn(uint256 tokenId) external payable;

    /// @notice Returns the position information associated with a given token ID
    function positions(uint256 tokenId)
        external
        view
        returns (
            uint96 nonce,
            address operator,
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        );

    /// @notice Returns the number of NFTs owned by the owner
    function balanceOf(address owner) external view returns (uint256);

    /// @notice Returns a token ID owned by owner at a given index of its token list
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);

    /// @notice Approve the spender to manage all of owner's tokens
    function setApprovalForAll(address operator, bool approved) external;

    /// @notice Approve the spender to manage a single token
    function approve(address to, uint256 tokenId) external;

    /// @notice Returns the address of the owner of the NFT
    function ownerOf(uint256 tokenId) external view returns (address);
}

