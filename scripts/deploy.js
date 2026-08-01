const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying BOTChainEventTicket contract with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const BOTChainEventTicket = await ethers.getContractFactory("BOTChainEventTicket");
  const contract = await BOTChainEventTicket.deploy(deployer.address);

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("\n=============================================");
  console.log("BOTChainEventTicket deployed to:", contractAddress);
  console.log("Contract Owner:", await contract.owner());
  console.log("=============================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
