# SoulEvent — Non-Transferable Event SBT & Verification System

## 📌 Overview
SoulEvent is a decentralized application (DApp) built on **BOT Chain** that issues non-transferable Soulbound Tokens (SBTs) to prevent invitation fraud and streamline event attendance verification.

## 🔗 Deployed Contract (BOT Chain Mainnet)
- **Contract Address:** `0x78795F5d3f49F4d614DC6cE41A0aA2925019a30a`
- **Network:** BOT Chain Mainnet (Chain ID: 677)
- **Explorer:** [scan.botchain.ai](https://scan.botchain.ai/address/0x78795F5d3f49F4d614DC6cE41A0aA2925019a30a)

## 🚀 Key Features
1. **Organizer Portal (Minting):** Issue soulbound event passes directly to participant wallets securely.
2. **Gatekeeper / Verifier:** Check ticket validity and token details instantly on-chain.
3. **Attendance Tracking:** Mark attendees as checked-in, transforming the ticket into a permanent proof-of-attendance credential.

## 🛠️ Tech Stack
- Solidity ^0.8.26 (OpenZeppelin ERC-721 & Ownable)
- Ethers.js v6 & Tailwind CSS
- Hosted on GitHub Pages

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
