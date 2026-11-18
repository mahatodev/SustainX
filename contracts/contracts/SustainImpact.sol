// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title SustainImpact – ERC-1155 Fractional Micro-Credit Contract
/// @notice Mints verified environmental-impact credits as fungible ERC-1155 tokens
///         and allows corporates to retire (burn) them on-chain for BRSR reporting.
contract SustainImpact is ERC1155, ERC1155Burnable, Ownable {
    // ──────────────────────── Token IDs (Constants) ─────────
    /// @notice 1 unit = 1 verified gram of CO₂ offset.
    uint256 public constant VERIFIED_CO2_GRAMS = 1;

    /// @notice 1 unit = 1 verified gram of EPR-compliant plastic recovered.
    uint256 public constant VERIFIED_EPR_PLASTIC_GRAMS = 2;

    // ──────────────────────── Events ────────────────────────
    /// @notice Emitted when a batch of impact credits is permanently retired.
    event ImpactBatchRetired(
        address indexed retiree,
        uint256 indexed tokenId,
        uint256 amount,
        string  corporateEntityName,
        string  brsrReportRef,
        bytes32 certificateHash,
        uint256 timestamp
    );

    // ──────────────────────── Errors ────────────────────────
    error InvalidTokenId(uint256 tokenId);

    // ──────────────────────── Constructor ────────────────────
    /// @param uri_ Base metadata URI (can include `{id}` placeholder per ERC-1155).
    constructor(string memory uri_)
        ERC1155(uri_)
        Ownable(msg.sender)
    {}

    // ──────────────────────── Minting ────────────────────────
    /// @notice Mint verified impact credits to a citizen.
    /// @param citizen  Recipient address.
    /// @param tokenId  Must be VERIFIED_CO2_GRAMS (1) or VERIFIED_EPR_PLASTIC_GRAMS (2).
    /// @param amount   Number of grams to credit.
    /// @param data     Optional ERC-1155 hook data.
    function mintImpact(
        address citizen,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) external onlyOwner {
        if (tokenId != VERIFIED_CO2_GRAMS && tokenId != VERIFIED_EPR_PLASTIC_GRAMS) {
            revert InvalidTokenId(tokenId);
        }
        _mint(citizen, tokenId, amount, data);
    }

    // ──────────────────────── Retirement ─────────────────────
    /// @notice Retire (burn) impact credits on behalf of a corporate buyer.
    /// @dev Callable by any holder (or approved operator). Burns the tokens and
    ///      emits an immutable on-chain certificate.
    /// @param tokenId             The impact-credit token to retire.
    /// @param amount              Number of units to retire.
    /// @param corporateEntityName Legal name of the retiring corporate entity.
    /// @param brsrReportRef       Reference identifier for the BRSR sustainability report.
    /// @return certificateHash    Unique hash serving as the retirement certificate.
    function retireBatch(
        uint256 tokenId,
        uint256 amount,
        string calldata corporateEntityName,
        string calldata brsrReportRef
    ) external returns (bytes32 certificateHash) {
        // Burn from the caller's balance (reverts if insufficient).
        _burn(msg.sender, tokenId, amount);

        // Compute a deterministic certificate hash.
        certificateHash = keccak256(
            abi.encodePacked(
                msg.sender,
                tokenId,
                amount,
                corporateEntityName,
                brsrReportRef,
                block.timestamp
            )
        );

        emit ImpactBatchRetired(
            msg.sender,
            tokenId,
            amount,
            corporateEntityName,
            brsrReportRef,
            certificateHash,
            block.timestamp
        );
    }
}
