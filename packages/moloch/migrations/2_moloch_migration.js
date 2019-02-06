/* global artifacts */
const BigNumber = require('bignumber.js')
const Moloch = artifacts.require('./Moloch.sol')
// const LootToken = artifacts.require('./LootToken.sol')
const GuildBank = artifacts.require('./GuildBank.sol')
const FooToken = artifacts.require('./oz/ERC20.sol')
const BarToken = artifacts.require('./oz/ERC20.sol')

const foundersJSON = require('./founders.json')
const configJSON = require('./config.json')


module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    fooToken  = await deployer.deploy(FooToken)
    guildBank = await deployer.deploy(
      GuildBank,
      fooToken.address
    )
    moloch = await deployer.deploy(
      Moloch,
      accounts[0],
      fooToken.address,
      17280,
      7,
      7,
      new BigNumber(10000000000000000000),
      3,
      new BigNumber(100000000000000000),
      { gas: 6000000 }
    )
    let proposalDeposit  = await moloch.proposalDeposit()
    console.log('proposalDeposit', proposalDeposit.toString())
  })
}
