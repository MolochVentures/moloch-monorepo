/* global artifacts, contract, assert, web3 */
/* eslint-env mocha */

const Moloch = artifacts.require('./Moloch')
const SimpleToken = artifacts.require('./SimpleToken')
const configJSON = require('../migrations/config.json')

const abi = require('web3-eth-abi')
const HttpProvider = require(`ethjs-provider-http`)
const EthRPC = require(`ethjs-rpc`)
const ethRPC = new EthRPC(new HttpProvider('http://localhost:8545'))

const BigNumber = require('bignumber.js')

const should = require('chai').use(require('chai-as-promised')).use(require('chai-bignumber')(BigNumber)).should()

async function blockTime() {
  return (await web3.eth.getBlock('latest')).timestamp
}

function getEventParams(tx, event) {
  if (tx.logs.length > 0) {
    for (let idx=0; idx < tx.logs.length; idx++) {
      if (tx.logs[idx].event == event) {
        return tx.logs[idx].args
      }
    }
  }
  return false
}

async function snapshot() {
  return new Promise((accept, reject) => {
    ethRPC.sendAsync({method: `evm_snapshot`}, (err, result)=> {
      if (err) {
        reject(err)
      } else {
        accept(result)
      }
    })
  })
}

async function restore(snapshotId) {
  return new Promise((accept, reject) => {
    ethRPC.sendAsync({method: `evm_revert`, params: [snapshotId]}, (err, result) => {
      if (err) {
        reject(err)
      } else {
        accept(result)
      }
    })
  })
}

async function forceMine() {
  return await ethRPC.sendAsync({method: `evm_mine`}, (err)=> {});
}

async function moveForwardPeriods(periods) {
  const blocktimestamp = await blockTime()
  const goToTime = configJSON.PERIOD_DURATION * periods
  await ethRPC.sendAsync({
    jsonrpc:'2.0', method: `evm_increaseTime`,
    params: [goToTime],
    id: 0
  }, (err)=> {`error increasing time`});
  await forceMine()
  return true
}

function randomInt(min,max) // min and max included
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

contract('Graph', accounts => {
  let snapshotId = 0, proposalIndex = 0, numAccounts = 5, applicants = []

  before('deploy contracts', async () => {
    moloch = await Moloch.deployed()
    console.log('moloch.address', moloch.address)
    simpleToken = await SimpleToken.deployed()

    summoner = accounts[0]
    simpleToken.approve(moloch.address, new BigNumber(configJSON.PROPOSAL_DEPOSIT * numAccounts))

    // transfer proposal deposit SIM to applicant
    for (let x=1; x <= numAccounts; x++) {
      simpleToken.transfer(accounts[x], new BigNumber(configJSON.PROPOSAL_DEPOSIT))
      simpleToken.approve(moloch.address, new BigNumber(configJSON.PROPOSAL_DEPOSIT), {from:accounts[x]})

      let applicant = {}
      applicant.address = accounts[x]
      applicant.sharesRequested = randomInt(1,10)
      applicant.tokenTribute = configJSON.PROPOSAL_DEPOSIT
      applicants.push(applicant)
    }
  })

  it('verify deployment parameters', async () => {
    const now = await blockTime() 
    const member = await moloch.members(summoner)
    const summoningTime =  await moloch.summoningTime()

    assert.equal(member.isActive, true)
    assert.equal(await moloch.approvedToken(), simpleToken.address)
    assert.equal(await moloch.periodDuration(), configJSON.PERIOD_DURATION)
    assert.equal(await moloch.votingPeriodLength(), configJSON.VOTING_PERIOD_LENGTH)
    assert.equal(await moloch.gracePeriodLength(), configJSON.GRACE_PERIOD_LENGTH)
    assert.equal(await moloch.proposalDeposit(), configJSON.PROPOSAL_DEPOSIT)
    assert.equal(await moloch.dilutionBound(), configJSON.DILUTION_BOUND)
    assert.equal(await moloch.processingReward(), configJSON.PROCESSING_REWARD)
  })

  it('submit proposal', async () => {
    const now = await blockTime()
    
    for (let x=1; x <= applicants.length; x++) {
      let applicant = applicants[x-1]
      let tx = await moloch.submitProposal(applicant.address, applicant.tokenTribute, applicant.sharesRequested, "proposal number " + String(proposalIndex) + "from " + accounts[x])
      let event = await getEventParams(tx, "SubmitProposal")
      
      assert.equal(+event[0], proposalIndex)
      assert.equal(event[1], summoner)
      assert.equal(event[2], summoner)
      assert.equal(event[3], accounts[x])
      assert.equal(event[4].toString(), applicant.tokenTribute.toString())
      assert.equal(event[5].toString(), applicant.sharesRequested.toString())

      proposalIndex++
    }
  })

  it('submit vote', async () => {
    for (let x=0; x < proposalIndex; x++) {
      let proposal = await moloch.proposalQueue(x)
      let currentPeriod = await moloch.getCurrentPeriod()
      startPeriod = +proposal[3]
      currentPeriod = +currentPeriod
      if (startPeriod > currentPeriod) {
        await moveForwardPeriods(startPeriod - currentPeriod)
      }
      let applicant = applicants[x]
      applicant.vote = 1 //randomInt(1,2)
      let tx = await moloch.submitVote(x, applicant.vote)
      let event = await getEventParams(tx, "SubmitVote")
      assert.equal(+event[0], x)
      assert.equal(event[1], summoner)
      assert.equal(event[2], summoner)
      assert.equal(+event[3], applicant.vote)    
    }
  })

  it('process proposals', async () => {
    let votingPeriod = await moloch.votingPeriodLength()
    votingPeriod = +votingPeriod
    let gracePeriod = await moloch.gracePeriodLength()
    gracePeriod = +gracePeriod
    for (let x=0; x < proposalIndex; x++) {
      let proposal = await moloch.proposalQueue(x)
      startPeriod = +proposal[3]
      let currentPeriod = await moloch.getCurrentPeriod()
      currentPeriod = +currentPeriod
      let startVotingWithGrace = startPeriod + votingPeriod + gracePeriod
      if (startVotingWithGrace > currentPeriod) {
        await moveForwardPeriods(startVotingWithGrace - currentPeriod)
      }

      let applicant = applicants[x]
      let tx = await moloch.processProposal(x)
      let event = await getEventParams(tx, "ProcessProposal")
      assert.equal(+event[0], x)
      assert.equal(event[1], applicant.address)
      assert.equal(event[2], summoner)
      assert.equal(+event[3], applicant.tokenTribute)
      assert.equal(+event[4], applicant.sharesRequested)
      assert.equal(event[5], applicant.vote == 1 ? true : false)
      
    }
  })
})

