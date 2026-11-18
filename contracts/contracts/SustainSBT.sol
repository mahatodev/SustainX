// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title IERC5192 – Minimal Soulbound (Non-Transferable) Token Interface
interface IERC5192 {
    /// @notice Emitted when the locking status is changed to locked.
    event Locked(uint256 tokenId);

    /// @notice Emitted when the locking status is changed to unlocked.
    event Unlocked(uint256 tokenId);

    /// @notice Returns the locking status of a Soulbound Token.
    /// @param tokenId The identifier of the token.
    /// @return True if the token is locked (soulbound).
    function locked(uint256 tokenId) external view returns (bool);
}

/// @title SustainSBT – ERC-5192 Soulbound Citizen Score Token
/// @notice Non-transferable token that tracks a citizen's sustainability score and tier.
contract SustainSBT is ERC721, Ownable, IERC5192 {
    // ──────────────────────── Errors ────────────────────────
    /// @dev Reverts on any transfer that is not a mint.
    error ErrSoulboundNonTransferable();

    // ──────────────────────── Types ─────────────────────────
    /// @param score  Sustainability score in the range 0-1000.
    /// @param tier   Tier derived from score: 0 = Bronze, 1 = Silver, 2 = Gold, 3 = Platinum.
    /// @param lastUpdated  Timestamp of the last score update.
    /// @param latestProofHash  Hash of the latest off-chain proof submitted.
    struct CitizenScore {
        uint16 score;        // 0 – 1000
        uint8  tier;         // 0 – 3
        uint64 lastUpdated;
        bytes32 latestProofHash;
    }

    // ──────────────────────── State ─────────────────────────
    uint256 private _nextTokenId;

    /// @notice Token-level citizen score data.
    mapping(uint256 => CitizenScore) private _scores;

    // ──────────────────────── Constructor ────────────────────
    constructor()
        ERC721("SustainSBT", "SSBT")
        Ownable(msg.sender)
    {}

    // ──────────────────────── ERC-5192 ──────────────────────
    /// @inheritdoc IERC5192
    /// @dev Always returns true – every SBT is permanently locked.
    function locked(uint256 tokenId) external view override returns (bool) {
        // Ensure the token exists (ownerOf reverts for non-existent tokens).
        _requireOwned(tokenId);
        return true;
    }

    // ──────────────────────── Transfer Guard ────────────────
    /// @dev Overrides the internal _update hook to block all transfers except mints.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0)), revert on all other transfers.
        if (from != address(0)) {
            revert ErrSoulboundNonTransferable();
        }

        return super._update(to, tokenId, auth);
    }

    // ──────────────────────── Mint ───────────────────────────
    /// @notice Mint a new Soulbound Token to `citizen`.
    /// @param citizen The address receiving the SBT.
    /// @return tokenId The id of the newly minted token.
    function mintSBT(address citizen) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(citizen, tokenId);

        // Initialise score struct (defaults to 0 / Bronze).
        _scores[tokenId] = CitizenScore({
            score: 0,
            tier: 0,
            lastUpdated: uint64(block.timestamp),
            latestProofHash: bytes32(0)
        });

        emit Locked(tokenId);
    }

    // ──────────────────────── Score Updates ──────────────────
    /// @notice Update the sustainability score for a given token.
    /// @param tokenId   The SBT to update.
    /// @param newScore  New score value (0-1000).
    /// @param proofHash Hash of the off-chain verification proof.
    function updateScore(
        uint256 tokenId,
        uint16 newScore,
        bytes32 proofHash
    ) external onlyOwner {
        _requireOwned(tokenId);
        require(newScore <= 1000, "Score exceeds max 1000");

        CitizenScore storage cs = _scores[tokenId];
        cs.score = newScore;
        cs.tier = _calculateTier(newScore);
        cs.lastUpdated = uint64(block.timestamp);
        cs.latestProofHash = proofHash;
    }

    /// @notice Read the full CitizenScore struct for a token.
    function getCitizenScore(uint256 tokenId)
        external
        view
        returns (CitizenScore memory)
    {
        _requireOwned(tokenId);
        return _scores[tokenId];
    }

    // ──────────────────────── Tier Logic ─────────────────────
    /// @dev Derives tier from score according to PRD Section 4:
    ///   0-299   → 0 (Bronze)
    ///   300-599 → 1 (Silver)
    ///   600-849 → 2 (Gold)
    ///   850-1000→ 3 (Platinum)
    function _calculateTier(uint16 score) internal pure returns (uint8) {
        if (score >= 850) return 3;
        if (score >= 600) return 2;
        if (score >= 300) return 1;
        return 0;
    }

    // ──────────────────────── ERC-165 ────────────────────────
    /// @dev Advertises support for ERC-5192 (interfaceId 0xb45a3c0e).
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return
            interfaceId == 0xb45a3c0e || // IERC5192
            super.supportsInterface(interfaceId);
    }
}
