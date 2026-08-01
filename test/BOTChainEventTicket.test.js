const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BOTChainEventTicket", function () {
  let botChainEventTicket;
  let owner;
  let participant1;
  let participant2;

  const eventName = "BOTChain Developer Summit 2026";
  const participant1Name = "Bayu Pratama";
  const participant2Name = "Alice Smith";

  beforeEach(async function () {
    [owner, participant1, participant2] = await ethers.getSigners();

    const BOTChainEventTicket = await ethers.getContractFactory("BOTChainEventTicket");
    botChainEventTicket = await BOTChainEventTicket.deploy(owner.address);
    await botChainEventTicket.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await botChainEventTicket.name()).to.equal("BOTChain Event Ticket");
      expect(await botChainEventTicket.symbol()).to.equal("BOT-TKT");
    });

    it("Should set the correct contract owner", async function () {
      expect(await botChainEventTicket.owner()).to.equal(owner.address);
    });
  });

  describe("Minting (onlyOwner)", function () {
    it("Should allow the owner to mint a ticket to a participant", async function () {
      await expect(
        botChainEventTicket.connect(owner).mintTicket(participant1.address, eventName, participant1Name)
      )
        .to.emit(botChainEventTicket, "TicketMinted")
        .withArgs(1, participant1.address, eventName, participant1Name);

      expect(await botChainEventTicket.ownerOf(1)).to.equal(participant1.address);
    });

    it("Should revert if non-owner tries to mint a ticket", async function () {
      await expect(
        botChainEventTicket.connect(participant1).mintTicket(participant1.address, eventName, participant1Name)
      ).to.be.revertedWithCustomError(botChainEventTicket, "OwnableUnauthorizedAccount");
    });

    it("Should revert if minting to zero address", async function () {
      await expect(
        botChainEventTicket.connect(owner).mintTicket(ethers.ZeroAddress, eventName, participant1Name)
      ).to.be.revertedWithCustomError(botChainEventTicket, "InvalidRecipientAddress");
    });
  });

  describe("Soulbound Non-Transferability", function () {
    beforeEach(async function () {
      await botChainEventTicket.connect(owner).mintTicket(participant1.address, eventName, participant1Name);
    });

    it("Should fail when transferring ticket from one user to another (transferFrom)", async function () {
      await expect(
        botChainEventTicket.connect(participant1).transferFrom(participant1.address, participant2.address, 1)
      ).to.be.revertedWithCustomError(botChainEventTicket, "SoulboundTokenNonTransferable");
    });

    it("Should fail when safeTransferFrom is called", async function () {
      await expect(
        botChainEventTicket
          .connect(participant1)
          ["safeTransferFrom(address,address,uint256)"](participant1.address, participant2.address, 1)
      ).to.be.revertedWithCustomError(botChainEventTicket, "SoulboundTokenNonTransferable");
    });
  });

  describe("Attendance Marking (markAttendance)", function () {
    beforeEach(async function () {
      await botChainEventTicket.connect(owner).mintTicket(participant1.address, eventName, participant1Name);
    });

    it("Should allow owner to mark attendance", async function () {
      await expect(botChainEventTicket.connect(owner).markAttendance(1))
        .to.emit(botChainEventTicket, "AttendanceMarked")
        .withArgs(1, participant1.address);

      const ticket = await botChainEventTicket.connect(owner)["verifyTicket(uint256)"](1);
      expect(ticket.isAttended).to.be.true;
    });

    it("Should revert if marking attendance for a non-existent token", async function () {
      await expect(
        botChainEventTicket.connect(owner).markAttendance(999)
      ).to.be.revertedWithCustomError(botChainEventTicket, "TicketDoesNotExist");
    });

    it("Should revert if ticket is already marked as attended", async function () {
      await botChainEventTicket.connect(owner).markAttendance(1);
      await expect(
        botChainEventTicket.connect(owner).markAttendance(1)
      ).to.be.revertedWithCustomError(botChainEventTicket, "AlreadyAttended");
    });

    it("Should revert if non-owner tries to mark attendance", async function () {
      await expect(
        botChainEventTicket.connect(participant1).markAttendance(1)
      ).to.be.revertedWithCustomError(botChainEventTicket, "OwnableUnauthorizedAccount");
    });
  });

  describe("Verification (verifyTicket)", function () {
    beforeEach(async function () {
      await botChainEventTicket.connect(owner).mintTicket(participant1.address, eventName, participant1Name);
      await botChainEventTicket.connect(owner).mintTicket(participant1.address, "BOTChain Hackathon", participant1Name);
    });

    it("Should verify ticket data by tokenId", async function () {
      const ticket = await botChainEventTicket["verifyTicket(uint256)"](1);
      expect(ticket.eventName).to.equal(eventName);
      expect(ticket.participantName).to.equal(participant1Name);
      expect(ticket.isAttended).to.be.false;
    });

    it("Should revert verifyTicket by tokenId for non-existent token", async function () {
      await expect(
        botChainEventTicket["verifyTicket(uint256)"](99)
      ).to.be.revertedWithCustomError(botChainEventTicket, "TicketDoesNotExist");
    });

    it("Should verify tickets by owner address", async function () {
      const [tokenIds, tickets] = await botChainEventTicket["verifyTicket(address)"](participant1.address);
      expect(tokenIds.length).to.equal(2);
      expect(tokenIds[0]).to.equal(1n);
      expect(tokenIds[1]).to.equal(2n);

      expect(tickets[0].eventName).to.equal(eventName);
      expect(tickets[1].eventName).to.equal("BOTChain Hackathon");
    });

    it("Should revert verifyTicket by owner address if address has no tickets", async function () {
      await expect(
        botChainEventTicket["verifyTicket(address)"](participant2.address)
      ).to.be.revertedWithCustomError(botChainEventTicket, "NoTicketsFound");
    });
  });
});
