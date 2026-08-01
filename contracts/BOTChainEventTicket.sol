// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BOTChainEventTicket
 * @dev ERC721 Soulbound Token (SBT) implementation for BOTChain Event Tickets.
 * Tokens are non-transferable between accounts after minting.
 */
contract BOTChainEventTicket is ERC721, Ownable {

    // Counter for token IDs
    uint256 private _nextTokenId;

    // Struct to store event ticket metadata
    struct EventTicket {
        string eventName;
        string participantName;
        bool isAttended;
    }

    // Mapping from tokenId => EventTicket struct
    mapping(uint256 => EventTicket) private _tickets;

    // Mapping from participant address => array of tokenIds
    mapping(address => uint256[]) private _ownerTokenIds;

    // Custom Errors
    error SoulboundTokenNonTransferable();
    error TicketDoesNotExist(uint256 tokenId);
    error NoTicketsFound(address participant);
    error AlreadyAttended(uint256 tokenId);
    error InvalidRecipientAddress();

    // Events
    event TicketMinted(
        uint256 indexed tokenId,
        address indexed participant,
        string eventName,
        string participantName
    );
    event AttendanceMarked(uint256 indexed tokenId, address indexed participant);

    /**
     * @dev Constructor initializing ERC721 token details and contract owner.
     * @param initialOwner Address set as initial contract owner (organizer).
     */
    constructor(address initialOwner)
        ERC721("BOTChain Event Ticket", "BOT-TKT")
        Ownable(initialOwner)
    {
        _nextTokenId = 1;
    }

    /**
     * @notice Mint a new SBT event ticket for a participant address.
     * @dev Only callable by contract Owner (organizer).
     * @param to Address of participant receiving the ticket.
     * @param eventName Name of the event.
     * @param participantName Name of the participant.
     * @return tokenId The assigned unique token ID.
     */
    function mintTicket(
        address to,
        string memory eventName,
        string memory participantName
    ) external onlyOwner returns (uint256) {
        if (to == address(0)) revert InvalidRecipientAddress();

        uint256 tokenId = _nextTokenId++;

        _tickets[tokenId] = EventTicket({
            eventName: eventName,
            participantName: participantName,
            isAttended: false
        });

        _ownerTokenIds[to].push(tokenId);

        _safeMint(to, tokenId);

        emit TicketMinted(tokenId, to, eventName, participantName);

        return tokenId;
    }

    /**
     * @notice Mark attendance status for a ticket as attended (isAttended = true).
     * @dev Only callable by contract Owner (organizer).
     * @param tokenId Unique token ID of the ticket.
     */
    function markAttendance(uint256 tokenId) external onlyOwner {
        address ticketOwner = _ownerOf(tokenId);
        if (ticketOwner == address(0)) revert TicketDoesNotExist(tokenId);

        EventTicket storage ticket = _tickets[tokenId];
        if (ticket.isAttended) revert AlreadyAttended(tokenId);

        ticket.isAttended = true;

        emit AttendanceMarked(tokenId, ticketOwner);
    }

    /**
     * @notice Verify and fetch ticket details by token ID.
     * @param tokenId Unique token ID.
     * @return EventTicket struct containing ticket details.
     */
    function verifyTicket(uint256 tokenId) external view returns (EventTicket memory) {
        if (_ownerOf(tokenId) == address(0)) revert TicketDoesNotExist(tokenId);
        return _tickets[tokenId];
    }

    /**
     * @notice Verify and fetch ticket details by participant (owner) address.
     * @param ownerAddress Wallet address of ticket holder.
     * @return tokenIds Array of token IDs owned by the address.
     * @return tickets Array of EventTicket structs corresponding to the owned tokens.
     */
    function verifyTicket(address ownerAddress)
        external
        view
        returns (uint256[] memory tokenIds, EventTicket[] memory tickets)
    {
        tokenIds = _ownerTokenIds[ownerAddress];
        if (tokenIds.length == 0) revert NoTicketsFound(ownerAddress);

        tickets = new EventTicket[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            tickets[i] = _tickets[tokenIds[i]];
        }

        return (tokenIds, tickets);
    }

    /**
     * @dev Override of OpenZeppelin ERC721 _update function.
     * Restricts transfers between non-zero addresses to enforce Soulbound Token behavior.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Fail transfer if transferring between active accounts (Soulbound restriction)
        if (from != address(0) && to != address(0)) {
            revert SoulboundTokenNonTransferable();
        }

        return super._update(to, tokenId, auth);
    }
}
