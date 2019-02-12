import { BigInt } from '@graphprotocol/graph-ts'
import { Moloch as Contract, SummonComplete, SubmitProposal, SubmitVote, ProcessProposal, Ragequit, Abort, UpdateDelegateKey } from './types/Moloch/Moloch'
import { Proposal, Member, Vote, Applicant, Txs } from './types/schema'

export function handleSubmitProposal(event: SubmitProposal): void {
  let proposal = new Proposal(event.params.proposalIndex.toString())
  proposal.timestamp = event.block.timestamp.toString()
  proposal.proposalIndex = event.params.proposalIndex
  proposal.delegateKey = event.params.delegateKey
  proposal.memberAddress = event.params.memberAddress
  proposal.applicant = event.params.applicant
  proposal.tokenTribute = event.params.tokenTribute
  proposal.sharesRequested = event.params.sharesRequested
  proposal.yesVotes = BigInt.fromI32(0)
  proposal.noVotes = BigInt.fromI32(0)
  proposal.processed = false
  proposal.didPass = false
  proposal.aborted = false
  proposal.votes = new Array()
  proposal.save()

  let applicant = new Applicant(event.params.applicant.toHex())
  applicant.timestamp = event.block.timestamp.toString()
  applicant.proposalIndex = event.params.proposalIndex
  applicant.delegateKey = event.params.delegateKey
  applicant.memberAddress = event.params.memberAddress
  applicant.applicant = event.params.applicant
  applicant.tokenTribute = event.params.tokenTribute
  applicant.sharesRequested = event.params.sharesRequested
  applicant.didPass = false
  applicant.votes = new Array()
  applicant.save()
}

export function handleSummonComplete(event: SummonComplete): void {
  let member = new Member(event.params.summoner.toHex())
  member.delegateKey = event.params.summoner
  member.shares = event.params.shares
  member.isActive = true
  member.didRagequit = false
  member.votes = new Array()
  member.save()
}

export function handleSubmitVote(event: SubmitVote): void {
  let voteID = event.params.memberAddress.toString()
    .concat("-")
    .concat(event.params.proposalIndex.toString())
    .concat("-")
  let vote = Vote.load(voteID)
  if (vote == null) {
    let vote = new Vote(voteID)
    vote.proposalIndex = event.params.proposalIndex
    vote.delegateKey = event.params.delegateKey
    vote.memberAddress = event.params.memberAddress
    vote.uintVote = event.params.uintVote
    vote.save()
  }

  let proposal = Proposal.load(event.params.proposalIndex.toHex())
  if (event.params.uintVote == 1) {

    proposal.yesVotes = proposal.yesVotes.plus(BigInt.fromI32(1))
  }
  if (event.params.uintVote == 2) {
    proposal.noVotes = proposal.noVotes.plus(BigInt.fromI32(1))
  }
  proposal.votes.push(voteID)
  proposal.save()

  let applicant = Applicant.load(proposal.applicant.toHex())
  applicant.votes.push(voteID)
  applicant.save()
  
  let member = Member.load(event.params.memberAddress.toHex())
  member.votes.push(voteID)
  member.save()
}

export function handleProcessProposal(event: ProcessProposal): void {
  let proposal = Proposal.load(event.params.proposalIndex.toString())
  proposal.applicant = event.params.applicant
  proposal.memberAddress = event.params.memberAddress
  proposal.tokenTribute = event.params.tokenTribute
  proposal.sharesRequested = event.params.sharesRequested
  proposal.didPass = event.params.didPass
  proposal.save()

  if (event.params.didPass) {
    let timestamp = event.block.timestamp.toString()
    let txs = Txs.load(event.params.memberAddress.toHex().concat("-").concat(timestamp))
    if (txs == null) {
      let txs = new Txs(event.params.memberAddress.toHex().concat("-").concat(timestamp))
      txs.memberAddress = event.params.memberAddress
      txs.tokenTribute = event.params.tokenTribute
      txs.save()
    }

    let applicant = Applicant.load(proposal.applicant.toHex())
    applicant.didPass = true
    applicant.save()

    let member = Member.load(event.params.applicant.toHex())
    if (member == null) {
      let member = new Member(event.params.applicant.toHex())
      member.shares = applicant.sharesRequested
      member.isActive = true
      member.highestIndexYesVote = BigInt.fromI32(0)
      member.tokenTribute = applicant.tokenTribute
      member.didRagequit = false
      member.votes = new Array()
    } else {
      member.shares = member.shares.plus(applicant.sharesRequested)
      member.tokenTribute = member.tokenTribute.plus(applicant.tokenTribute)
    }
    member.save()
  }
}

export function handleRagequit(event: Ragequit): void {
  let member = Member.load(event.params.memberAddress.toHex())
  member.didRagequit = true
  member.save()

  let timestamp = event.block.timestamp.toString()
  let txs = Txs.load(event.params.memberAddress.toHex().concat("-").concat(timestamp))
  if (txs == null) {
    let txs = new Txs(event.params.memberAddress.toHex().concat("-").concat(timestamp))
    txs.memberAddress = event.params.memberAddress
    txs.tokenTribute = BigInt.fromI32(0).minus(event.params.sharesToBurn)
    txs.save()
  }
}

export function handleAbort(event: Abort): void {
  let proposal = Proposal.load(event.params.proposalIndex.toHex())
  proposal.aborted = true
  proposal.save()

  let applicant =  Applicant.load(event.params.applicantAddress.toHex())
  applicant.aborted = true
  applicant.save()
}

export function handleUpdateDelegateKey(event: UpdateDelegateKey): void {
  let member = Member.load(event.params.memberAddress.toHex())
  member.delegateKey = event.params.newDelegateKey
  member.save()
}
