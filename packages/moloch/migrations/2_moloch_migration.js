/* global artifacts */
const BigNumber = require('bignumber.js')
const Moloch = artifacts.require('./Moloch.sol')
const SimpleToken = artifacts.require('./oz/SimpleToken.sol')

const configJSON = require('./config.json')

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const simpleToken  = await deployer.deploy(SimpleToken)

    moloch = await deployer.deploy(
      Moloch,
      accounts[0],
      simpleToken.address,
      configJSON.PERIOD_DURATION,
      configJSON.VOTING_PERIOD_LENGTH,
      configJSON.GRACE_PERIOD_LENGTH,
      new BigNumber(configJSON.PROPOSAL_DEPOSIT),
      configJSON.DILUTION_BOUND,
      new BigNumber(configJSON.PROCESSING_REWARD),
      { gas: 6000000 }
    )
  })
}
