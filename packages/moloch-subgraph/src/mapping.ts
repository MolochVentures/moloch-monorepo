import { BigInt } from '@graphprotocol/graph-ts'
import { Moloch as Contract, SubmitProposal, SubmitVote, ProcessProposal, Ragequit } from './types/Moloch/Moloch'
import { Proposal, Member, Vote } from './types/schema'

export function handleSubmitProposal(event: SubmitProposal): void {
  let proposal = new Proposal(event.params.index.toString())
  proposal.index = event.params.index
  proposal.applicant = event.params.applicant
  proposal.proposer = event.params.memberAddress
  proposal.shares = BigInt.fromI32(0)
  proposal.votes = new Array()
  proposal.didPass = 0
  proposal.save()

  let member = new Member(event.params.applicant.toHex())
  member.memberAddress = event.params.applicant
  member.shares = BigInt.fromI32(0)
  member.isProcessed = 0
  member.didPass = 0
  member.didRagequit = 0
  member.votes = new Array()
  member.save()
}

export function handleSubmitVote(event: SubmitVote): void {
  let voteID = event.block.timestamp.toString()
  let vote = new Vote(voteID)
  vote.sender = event.params.sender
  vote.memberAddress = event.params.memberAddress
  vote.index = event.params.proposalIndex
  vote.uintVote = event.params.uintVote

  let proposal = Proposal.load(event.params.proposalIndex.toHex())
  proposal.votes.push(voteID)
  proposal.save()

  let member = Member.load(event.params.memberAddress.toHex())
  member.votes.push(voteID)
  member.save()
}

export function handleProcessProposal(event: ProcessProposal): void {
  let proposal = Proposal.load(event.params.index.toString())
  proposal.didPass = event.params.didPass
  proposal.shares = event.params.shares
  proposal.save()

  let member = Member.load(event.params.applicant.toHex())
  member.shares = event.params.shares
  member.isProcessed = 1
  member.didPass = event.params.didPass
  member.save()
}

export function handleRagequit(event: Ragequit): void {
  let member = Member.load(event.params.memberAddress.toHex())
  member.didRagequit = 1
  member.save()
}