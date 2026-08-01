# AVEC -- Attendance Verification Event Chain

Smart Contract ERC721 Soulbound Token (SBT) berbasis **Solidity v0.8.26** untuk sistem tiket acara **BOTChain Event Ticket**.

---

## 📋 Syarat & Fitur Utama

1. **Non-Transferable (Soulbound Token)**:
   - Meng-override fungsi `_update` dari standar OpenZeppelin ERC721.
   - Transfer token antar alamat pengguna akan gagal dan melempar custom error `SoulboundTokenNonTransferable()`. Minting (dari address 0) dan burning (ke address 0) tetap diizinkan.
2. **Owner-Only Minting**:
   - Menggunakan pattern `Ownable` dari OpenZeppelin.
   - Hanya penyelenggara (`Owner`) yang berhak melakukan minting tiket ke address peserta via `mintTicket()`.
3. **Struct `EventTicket`**:
   - Memiliki data struktur:
     - `string eventName`
     - `string participantName`
     - `bool isAttended`
4. **Kehadiran (`markAttendance`)**:
   - Fungsi `markAttendance(uint256 tokenId)` untuk mengubah status `isAttended` menjadi `true` saat acara berlangsung. Hanya bisa dipanggil oleh `Owner` dan hanya untuk tiket yang belum diabsen.
5. **Verifikasi Tiket (`verifyTicket`)**:
   - `verifyTicket(uint256 tokenId)`: Memverifikasi dan mengembalikan data struct `EventTicket` berdasarkan ID tiket.
   - `verifyTicket(address ownerAddress)`: Memverifikasi dan mengembalikan daftar `tokenId` beserta data struct `EventTicket[]` berdasarkan address wallet peserta.

---

## 🛠️ Ringkasan Smart Contract Code (`BOTChainEventTicket.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BOTChainEventTicket is ERC721, Ownable {
    uint256 private _nextTokenId;

    struct EventTicket {
        string eventName;
        string participantName;
        bool isAttended;
    }

    mapping(uint256 => EventTicket) private _tickets;
    mapping(address => uint256[]) private _ownerTokenIds;

    error SoulboundTokenNonTransferable();
    error TicketDoesNotExist(uint256 tokenId);
    error NoTicketsFound(address participant);
    error AlreadyAttended(uint256 tokenId);
    error InvalidRecipientAddress();

    event TicketMinted(uint256 indexed tokenId, address indexed participant, string eventName, string participantName);
    event AttendanceMarked(uint256 indexed tokenId, address indexed participant);

    constructor(address initialOwner)
        ERC721("BOTChain Event Ticket", "BOT-TKT")
        Ownable(initialOwner)
    {
        _nextTokenId = 1;
    }

    function mintTicket(address to, string memory eventName, string memory participantName)
        external
        onlyOwner
        returns (uint256)
    {
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

    function markAttendance(uint256 tokenId) external onlyOwner {
        address ticketOwner = _ownerOf(tokenId);
        if (ticketOwner == address(0)) revert TicketDoesNotExist(tokenId);

        EventTicket storage ticket = _tickets[tokenId];
        if (ticket.isAttended) revert AlreadyAttended(tokenId);

        ticket.isAttended = true;
        emit AttendanceMarked(tokenId, ticketOwner);
    }

    function verifyTicket(uint256 tokenId) external view returns (EventTicket memory) {
        if (_ownerOf(tokenId) == address(0)) revert TicketDoesNotExist(tokenId);
        return _tickets[tokenId];
    }

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

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert SoulboundTokenNonTransferable();
        }
        return super._update(to, tokenId, auth);
    }
}
```

---

## 🧪 Pengujian Unit Test

Seluruh 15 unit test telah diuji dan **LULUS (100% Pass)** menggunakan Hardhat.

Perintah pengujian:
```bash
npx hardhat test
```

Hasil pengujian:
```text
  BOTChainEventTicket
    Deployment
      ✔ Should set the correct token name and symbol
      ✔ Should set the correct contract owner
    Minting (onlyOwner)
      ✔ Should allow the owner to mint a ticket to a participant
      ✔ Should revert if non-owner tries to mint a ticket
      ✔ Should revert if minting to zero address
    Soulbound Non-Transferability
      ✔ Should fail when transferring ticket from one user to another (transferFrom)
      ✔ Should fail when safeTransferFrom is called
    Attendance Marking (markAttendance)
      ✔ Should allow owner to mark attendance
      ✔ Should revert if marking attendance for a non-existent token
      ✔ Should revert if ticket is already marked as attended
      ✔ Should revert if non-owner tries to mark attendance
    Verification (verifyTicket)
      ✔ Should verify ticket data by tokenId
      ✔ Should revert verifyTicket by tokenId for non-existent token
      ✔ Should verify tickets by owner address
      ✔ Should revert verifyTicket by owner address if address has no tickets

  15 passing (896ms)
```

---

## 🚀 Panduan Deploy

### 1. Menggunakan Remix IDE
1. Buka [Remix IDE](https://remix.ethereum.org/).
2. Buat file baru `BOTChainEventTicket.sol` di dalam folder `contracts/`.
3. Salin isi kode dari [`contracts/BOTChainEventTicket.sol`](file:///home/bayu/workspace/botchain_soulbound_event/contracts/BOTChainEventTicket.sol).
4. Pilih compiler Solidity version `0.8.20` atau yang lebih tinggi (misal `0.8.24`).
5. Pada tab Deploy & Run Transactions, pilih environment (misal Injected Provider - MetaMask / Sepolia Testnet).
6. Masukkan alamat wallet admin/penyelenggara pada parameter constructor (`initialOwner`).
7. Klik **Deploy**.

### 2. Menggunakan Hardhat Local Network
```bash
npx hardhat run scripts/deploy.js
```
