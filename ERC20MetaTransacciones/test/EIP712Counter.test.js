const { expect } = require("chai");
const { ethers } = require("hardhat");

const eip712DomainTypeDefinition = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

const signatureTypeDefinition = [
  { name: 'signer', type: 'address' },
  { name: 'message', type: 'string' },
];

/* typedDataInput
  {
    domainValues: {
      name: <string>,
      version: <string>,
      chainId: <number>,
      verifyingContract: <string>
    },
    primaryType: "Signature",
    messageValues: {
      signer: <string>,
      message: <string>,
    }
  }
*/
function getTypedData(typedDataInput) {
  return {
    types: {
      EIP712Domain: eip712DomainTypeDefinition,
      [typedDataInput.primaryType]: signatureTypeDefinition,
    },
    primaryType: typedDataInput.primaryType,
    domain: typedDataInput.domainValues,
    message: typedDataInput.messageValues,
  };
}

describe("EIP712Counter test", function () {
  let counterContract;
  let deployer;
  let relayerAccount;

  before(async function () {

    const availableSigners = await ethers.getSigners();
    deployer = availableSigners[0];
    relayerAccount = availableSigners[1];

    const EIP712Counter = await ethers.getContractFactory("EIP712MessageCounter");
    counterContract = await EIP712Counter.deploy();
    await counterContract.deployed();
    counterContract.address
  });

  it("Should allow a gas relayer send a transaction on behalf of some other account", async function () {
    const counterTmpInstance = await counterContract.connect(relayerAccount);
    const { chainId } = await relayerAccount.provider.getNetwork();

    const relayerEthBeforeTx = await relayerAccount.getBalance();
    const deployerEthBeforeTx = await deployer.getBalance();

    const signatureMessage = {
      signer: deployer.address,
      message: "first message",
    };

    const typedData = getTypedData(
      {
        domainValues: {
          name: "EIP712MessageCounter",
          version: "0.0.1",
          chainId: chainId,
          verifyingContract: counterTmpInstance.address,
        },
        primaryType: "Signature",
        messageValues: signatureMessage,
      },
    );

    const signedMessage = await ethers.provider.send(
      "eth_signTypedData_v4",
      [deployer.address, typedData],
    );

    await counterTmpInstance.setSignerMessage(signatureMessage, signedMessage);

    const lastStoredMessageForAccount = await counterTmpInstance.lastMessageOf(deployer.address);
    const messageCountForAccount = await counterTmpInstance.countOf(deployer.address);
    
    const lastStoredMessageForRelayer = await counterTmpInstance.lastMessageOf(relayerAccount.address);
    const messageCountForRelayer = await counterTmpInstance.countOf(relayerAccount.address);

    const relayerEthAfterTx = await relayerAccount.getBalance();
    const deployerEthAfterTx = await deployer.getBalance();

    expect(lastStoredMessageForAccount).to.equal(signatureMessage.message);
    expect(messageCountForAccount.eq(ethers.BigNumber.from(1))).to.be.true;

    expect(lastStoredMessageForRelayer).to.be.equal("");
    expect(messageCountForRelayer.eq(ethers.BigNumber.from(0))).to.be.true;

    expect(relayerEthAfterTx.lt(relayerEthBeforeTx)).to.be.true;
    expect(deployerEthBeforeTx.eq(deployerEthAfterTx)).to.be.true;
  });

});