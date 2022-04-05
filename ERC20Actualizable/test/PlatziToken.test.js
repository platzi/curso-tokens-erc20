const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

const initialSupply = 1000000;
const tokenName = "PlatziToken";
const tokenSymbol = "PLZ";

describe("Platzi token tests", function() {
  let platziTokenV1;
  let platziTokenV2;
  let deployer;
  let userAccount;

  describe("V1 tests", function () {
    before(async function() {
      const availableSigners = await ethers.getSigners();
      deployer = availableSigners[0];

      const PlatziToken = await ethers.getContractFactory("PlatziTokenV1");

      // this.platziTokenV1 = await PlatziToken.deploy(initialSupply);
      platziTokenV1 = await upgrades.deployProxy(PlatziToken, [initialSupply], { kind: "uups" });
      await platziTokenV1.deployed();
    });

    it('Should be named PlatziToken', async function() {
      const fetchedTokenName = await platziTokenV1.name();
      expect(fetchedTokenName).to.be.equal(tokenName);
    });

    it('Should have symbol "PLZ"', async function() {
      const fetchedTokenSymbol = await platziTokenV1.symbol();
      expect(fetchedTokenSymbol).to.be.equal(tokenSymbol);
    });

    it('Should have totalSupply passed in during deployment', async function() {
      const [ fetchedTotalSupply, decimals ] = await Promise.all([
        platziTokenV1.totalSupply(),
        platziTokenV1.decimals(),
      ]);
      const expectedTotalSupply = ethers.BigNumber.from(initialSupply).mul(ethers.BigNumber.from(10).pow(decimals));
      expect(fetchedTotalSupply.eq(expectedTotalSupply)).to.be.true;
    });

    it('Should run into an error when executing a function that does not exist', async function () {
      expect(() => platziTokenV1.mint(deployer.address, ethers.BigNumber.from(10).pow(18))).to.throw();
    });
  });

  
  describe("V2 tests", function () {
    before(async function () {

      userAccount = (await ethers.getSigners())[1];

      const PlatziTokenV2 = await ethers.getContractFactory("PlatziTokenV2");

      platziTokenV2 = await upgrades.upgradeProxy(platziTokenV1.address, PlatziTokenV2);


      await platziTokenV2.deployed();

    });

    it("Should has the same address, and keep the state as the previous version", async function () {
      const [totalSupplyForNewCongtractVersion, totalSupplyForPreviousVersion] = await Promise.all([
        platziTokenV2.totalSupply(),
        platziTokenV1.totalSupply(),
      ]);
      expect(platziTokenV1.address).to.be.equal(platziTokenV2.address);
      expect(totalSupplyForNewCongtractVersion.eq(totalSupplyForPreviousVersion)).to.be.equal(true);
    });

    it("Should revert when an account other than the owner is trying to mint tokens", async function() {
      const tmpContractRef = await platziTokenV2.connect(userAccount);
      try {
        await tmpContractRef.mint(userAccount.address, ethers.BigNumber.from(10).pow(ethers.BigNumber.from(18)));
      } catch (ex) {
        expect(ex.message).to.contain("reverted");
        expect(ex.message).to.contain("Ownable: caller is not the owner");
      }
    });

    it("Should mint tokens when the owner is executing the mint function", async function () {
      const amountToMint = ethers.BigNumber.from(10).pow(ethers.BigNumber.from(18)).mul(ethers.BigNumber.from(10));
      const accountAmountBeforeMint = await platziTokenV2.balanceOf(deployer.address);
      const totalSupplyBeforeMint = await platziTokenV2.totalSupply();
      await platziTokenV2.mint(deployer.address, amountToMint);

      const newAccountAmount = await platziTokenV2.balanceOf(deployer.address);
      const newTotalSupply = await platziTokenV2.totalSupply();
      
      expect(newAccountAmount.eq(accountAmountBeforeMint.add(amountToMint))).to.be.true;
      expect(newTotalSupply.eq(totalSupplyBeforeMint.add(amountToMint))).to.be.true;
    });
  });


});