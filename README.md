# SoulEvent — Non-Transferable Event SBT & Verification System

## 📌 Overview
SoulEvent is a decentralized application (DApp) built on **BOT Chain** that issues non-transferable Soulbound Tokens (SBTs) to prevent invitation fraud and streamline event attendance verification.

## 🔗 Deployed Contract (BOT Chain Mainnet)
- **Contract Address:** `0x78795F5d3f49F4d614DC6ce41A0aA2925019a30a`
- **Network:** BOT Chain Mainnet (Chain ID: 677)
- **Explorer:** [scan.botchain.ai](https://scan.botchain.ai/address/0x78795F5d3f49F4d614DC6ce41A0aA2925019a30a)

## 🚀 Key Features
1. **Organizer Portal (Minting):** Issue soulbound event passes directly to participant wallets securely.
2. **Gatekeeper / Verifier:** Check ticket validity and token details instantly on-chain.
3. **Attendance Tracking:** Mark attendees as checked-in, transforming the ticket into a permanent proof-of-attendance credential.

## 🛠️ Tech Stack
- Solidity ^0.8.26 (OpenZeppelin ERC-721 & Ownable)
- Ethers.js v6 & Tailwind CSS
- Hosted on GitHub Pages

## ⛽ Gas Efficiency & Cost Analysis

SoulEvent leverages the high efficiency and extremely low gas fees of **BOT Chain Mainnet** (1 BOT ≈ $1.31 USD / ~IDR 21,200), making decentralized ticketing scalable and cost-effective for organizers.

| Operation | Gas Fee (BOT) | Estimated Cost (USD) | Estimated Cost (IDR) | Paid By |
| :--- | :--- | :--- | :--- | :--- |
| **Smart Contract Deployment** | `~0.0320 BOT` | ~$0.042 USD | ~Rp 678 | Contract Owner |
| **Ticket Minting (Per Attendee)** | `~0.0034 BOT` | ~$0.0044 USD | ~Rp 72 | Event Organizer |
| **Attendance Marking (Check-in)** | `~0.0024 BOT` | ~$0.0031 USD | ~Rp 51 | Gatekeeper / Organizer |
| **Ticket Verification (Read-only)** | `0.0000 BOT` | **FREE** | **FREE** | Anyone (Public) |

### Key Highlights:
- **Full Lifecycle Cost per Attendee:** Minting + Attendance Marking costs a total of **~0.0058 BOT** (~$0.0075 USD / ~Rp 123 IDR) per person.
- **Participant Cost:** **$0 (100% Free for Attendees)**. Attendees do not need to sign transactions or pay gas fees to receive or verify their ticket.
- **Scalability:** With just **1 BOT** (~$1.31 USD / ~Rp 21,200 IDR), an event organizer can successfully issue and verify tickets for **over 170 attendees** on-chain.

---

## 🏃 Local Development & Testing

### Installation
```bash
npm install
```

### Running the Web Application
```bash
npx serve .
# Or using Python: python3 -m http.server 3000
```
Open `http://localhost:3000` in a browser with the MetaMask extension installed.

### Automated Testing
To run the Hardhat unit test suite (15 tests passing):
```bash
npx hardhat test
```

### Deploy Contract
```bash
npx hardhat run scripts/deploy.js
```
