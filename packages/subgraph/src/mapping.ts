import { BigInt, Bytes, EthereumBlock, Address } from "@graphprotocol/graph-ts";
import {
  Moloch,
  SummonComplete,
  SubmitProposal,
  SubmitVote,
  ProcessProposal,
  Ragequit,
  Abort,
  UpdateDelegateKey
} from "./types/Moloch/Moloch";
import {
  AddKeepers,
  RemoveKeepers,
  Sync,
  SharesMinted,
  SharesBurned,
} from "./types/MolochPool/MolochPool";
import { Proposal, Member, Vote, Applicant, PoolMember, PoolMeta, Meta } from "./types/schema";

export function handleSummonComplete(event: SummonComplete): void {
  let member = new Member(event.params.summoner.toHex());
  member.delegateKey = event.params.summoner;
  member.shares = event.params.shares;
  member.isActive = true;
  member.tokenTribute = BigInt.fromI32(0);
  member.didRagequit = false;
  member.votes = new Array<string>();
  member.submissions = new Array<string>();
  member.highestIndexYesVote = BigInt.fromI32(0);
  member.save();

  let contract = Moloch.bind(event.address);
  let currentPeriod = contract.getCurrentPeriod();
  let periodDuration = contract.periodDuration();
  let votingPeriodLength = contract.votingPeriodLength();
  let gracePeriodLength = contract.gracePeriodLength();
  let proposalDeposit = contract.proposalDeposit();
  let dilutionBound = contract.dilutionBound();
  let processingReward = contract.processingReward();
  let summoningTime = contract.summoningTime();

  let meta = Meta.load("");
  if (!meta) {
    meta = new Meta("");
    meta.totalShares = event.params.shares;
    meta.periodDuration = periodDuration;
    meta.votingPeriodLength = votingPeriodLength;
    meta.gracePeriodLength = gracePeriodLength;
    meta.proposalDeposit = proposalDeposit;
    meta.dilutionBound = dilutionBound;
    meta.processingReward = processingReward;
    meta.summoningTime = summoningTime;
  }
  meta.currentPeriod = currentPeriod;
  meta.save();
}

export function handleSubmitProposal(event: SubmitProposal): void {
  // get information directly from contract
  // struct Proposal {
  //     address proposer; // the member who submitted the proposal
  //     address applicant; // the applicant who wishes to become a member - this key will be used for withdrawals
  //     uint256 sharesRequested; // the # of shares the applicant is requesting
  //     uint256 startingPeriod; // the period in which voting can start for this proposal
  //     uint256 yesVotes; // the total number of YES votes for this proposal
  //     uint256 noVotes; // the total number of NO votes for this proposal
  //     bool processed; // true only if the proposal has been processed
  //     bool didPass; // true only if the proposal passed
  //     bool aborted; // true only if applicant calls "abort" fn before end of voting period
  //     uint256 tokenTribute; // amount of tokens offered as tribute
  //     string details; // proposal details - could be IPFS hash, plaintext, or JSON
  //     uint256 maxTotalSharesAtYesVote; // the maximum # of total shares encountered at a yes vote on this proposal
  //     mapping (address => Vote) votesByMember; // the votes on this proposal by each member
  // }
  let contract = Moloch.bind(event.address);
  let currentPeriod = contract.getCurrentPeriod();
  let proposalFromContract = contract.proposalQueue(event.params.proposalIndex);
  let startingPeriod = proposalFromContract.value3;
  let details = proposalFromContract.value10;

  let meta = Meta.load("");

  // calculate voting and grace end
  let votingEndPeriod = startingPeriod.plus(meta.votingPeriodLength);
  let graceEndPeriod = votingEndPeriod.plus(meta.gracePeriodLength);
  let votingStartTime = currentPeriod.times(meta.periodDuration).plus(meta.summoningTime);
  let votingEndTime = votingEndPeriod.times(meta.periodDuration).plus(meta.summoningTime);
  let graceEndTime = graceEndPeriod.times(meta.periodDuration).plus(meta.summoningTime);

  let proposal = new Proposal(event.params.proposalIndex.toString());
  proposal.timestamp = event.block.timestamp.toString();
  proposal.proposalIndex = event.params.proposalIndex;
  proposal.startingPeriod = startingPeriod;
  proposal.delegateKey = event.params.delegateKey;
  proposal.member = event.params.memberAddress.toHex();
  proposal.memberAddress = event.params.memberAddress;
  proposal.applicant = event.params.applicant.toHex();
  proposal.applicantAddress = event.params.applicant;
  proposal.tokenTribute = event.params.tokenTribute;
  proposal.sharesRequested = event.params.sharesRequested;
  proposal.yesVotes = BigInt.fromI32(0);
  proposal.noVotes = BigInt.fromI32(0);
  proposal.yesShares = BigInt.fromI32(0);
  proposal.noShares = BigInt.fromI32(0);
  proposal.maxTotalSharesAtYesVote = BigInt.fromI32(0);
  proposal.processed = false;
  proposal.status = "IN_QUEUE";
  proposal.votingPeriodBegins = votingStartTime;
  proposal.votingPeriodEnds = votingEndTime;
  proposal.gracePeriodEnds = graceEndTime;
  proposal.votes = new Array<string>();
  proposal.details = details;
  proposal.save();

  let applicant = new Applicant(event.params.applicant.toHex());
  applicant.timestamp = event.block.timestamp.toString();
  applicant.proposalIndex = event.params.proposalIndex;
  applicant.delegateKey = event.params.delegateKey;
  applicant.member = event.params.memberAddress.toHex();
  applicant.memberAddress = event.params.memberAddress;
  applicant.applicantAddress = event.params.applicant;
  applicant.tokenTribute = event.params.tokenTribute;
  applicant.sharesRequested = event.params.sharesRequested;
  applicant.didPass = false;
  applicant.aborted = false;
  applicant.votes = new Array<string>();
  applicant.proposal = event.params.proposalIndex.toString();
  applicant.save();

  let member = Member.load(event.params.memberAddress.toHex());
  let submission = event.params.proposalIndex.toString();
  let memberSubmissions = member.submissions;
  memberSubmissions.push(submission);
  member.submissions = memberSubmissions;
  member.save();

  meta.currentPeriod = currentPeriod;
  meta.save();
}

export function handleSubmitVote(event: SubmitVote): void {
  let voteID = event.params.memberAddress
    .toHex()
    .concat("-")
    .concat(event.params.proposalIndex.toString());

  let vote = new Vote(voteID);
  vote.timestamp = event.block.timestamp.toString();
  vote.proposalIndex = event.params.proposalIndex;
  vote.delegateKey = event.params.delegateKey;
  vote.memberAddress = event.params.memberAddress;
  vote.uintVote = event.params.uintVote;
  vote.proposal = event.params.proposalIndex.toString();
  vote.member = event.params.memberAddress.toHex();
  vote.save();

  let proposal = Proposal.load(event.params.proposalIndex.toString());
  proposal.status = "VOTING_PERIOD";
  let member = Member.load(event.params.memberAddress.toHex());

  if (event.params.uintVote == 1) {
    proposal.yesVotes = proposal.yesVotes.plus(BigInt.fromI32(1));
    proposal.yesShares = proposal.yesShares.plus(member.shares);
  }
  if (event.params.uintVote == 2) {
    proposal.noVotes = proposal.noVotes.plus(BigInt.fromI32(1));
    proposal.noShares = proposal.noShares.plus(member.shares);
  }

  let proposalVotes = proposal.votes;
  proposalVotes.push(voteID);
  proposal.votes = proposalVotes;
  proposal.save();

  let applicant = Applicant.load(proposal.applicant);
  let applicantVotes = applicant.votes;
  applicantVotes.push(voteID);
  applicant.votes = applicantVotes;
  applicant.save();

  let memberVotes = member.votes;
  memberVotes.push(voteID);
  member.votes = memberVotes;
  member.save();

  let contract = Moloch.bind(event.address);
  let currentPeriod = contract.getCurrentPeriod();

  let meta = Meta.load("");
  meta.currentPeriod = currentPeriod;
  meta.save();
}

export function handleProcessProposal(event: ProcessProposal): void {
  let proposal = new Proposal(event.params.proposalIndex.toString());
  proposal.applicant = event.params.applicant.toHex();
  proposal.memberAddress = event.params.memberAddress;
  proposal.tokenTribute = event.params.tokenTribute;
  proposal.sharesRequested = event.params.sharesRequested;
  proposal.processed = true;

  if (event.params.didPass) {
    proposal.status = "PASSED";

    let applicant = Applicant.load(event.params.applicant.toHex());
    applicant.didPass = true;
    applicant.save();

    let member = Member.load(event.params.applicant.toHex());
    if (member == null) {
      let newMember = new Member(event.params.applicant.toHex());
      newMember.delegateKey = event.params.applicant;
      newMember.shares = event.params.sharesRequested;
      newMember.isActive = true;
      newMember.tokenTribute = event.params.tokenTribute;
      newMember.didRagequit = false;
      newMember.votes = new Array<string>();
      newMember.submissions = new Array<string>();
      newMember.highestIndexYesVote = BigInt.fromI32(0);
      newMember.save();
    } else {
      member.shares = member.shares.plus(event.params.sharesRequested);
      member.tokenTribute = member.tokenTribute.plus(event.params.tokenTribute);
      member.save();
    }

    let contract = Moloch.bind(event.address);
    let currentPeriod = contract.getCurrentPeriod();

    // update total shares
    let meta = Meta.load("");
    meta.totalShares = meta.totalShares.plus(event.params.sharesRequested);
    meta.currentPeriod = currentPeriod;
    meta.save();
  } else {
    proposal.status = "FAILED";
  }

  proposal.save();
}

export function handleRagequit(event: Ragequit): void {
  let member = Member.load(event.params.memberAddress.toHex());
  member.shares = member.shares.minus(event.params.sharesToBurn);
  if (member.shares.equals(new BigInt(0))) {
    member.isActive = false;
  }
  member.save();

  let contract = Moloch.bind(event.address);
  let currentPeriod = contract.getCurrentPeriod();

  let meta = Meta.load("");
  meta.totalShares = meta.totalShares.minus(event.params.sharesToBurn);
  meta.currentPeriod = currentPeriod;
  meta.save();
}

export function handleAbort(event: Abort): void {
  let proposal = Proposal.load(event.params.proposalIndex.toString());
  proposal.status = "ABORTED"
  proposal.save();

  let applicant = Applicant.load(event.params.applicantAddress.toHex());
  applicant.aborted = true;
  applicant.save();

  let contract = Moloch.bind(event.address);
  let currentPeriod = contract.getCurrentPeriod();

  let meta = Meta.load("");
  meta.currentPeriod = currentPeriod;
  meta.save();
}

export function handleUpdateDelegateKey(event: UpdateDelegateKey): void {
  let member = Member.load(event.params.memberAddress.toHex());
  member.delegateKey = event.params.newDelegateKey;
  member.save();

  let contract = Moloch.bind(event.address);
  let currentPeriod = contract.getCurrentPeriod();

  let meta = Meta.load("");
  meta.currentPeriod = currentPeriod;
  meta.save();
}

export function handlePoolSharesMinted(event: SharesMinted): void {
  let id = event.params.recipient.toHex();
  let member = PoolMember.load(id);

  if (member == null) {
    member = new PoolMember(id);
    member.shares = event.params.sharesToMint;
    member.keepers = [];
  } else {
    member.shares.plus(event.params.sharesToMint);
  }
  member.save();

  let meta = PoolMeta.load("");
  if (!meta) {
    meta = new PoolMeta("");
    meta.currentPoolIndex = new BigInt(0);
  }
  meta.totalPoolShares = event.params.totalPoolShares;
  meta.save();
}

export function handlePoolSharesBurned(event: SharesBurned): void {
  let member = PoolMember.load(event.params.recipient.toHex());
  member.shares.minus(event.params.sharesToBurn);
  member.save();

  let meta = PoolMeta.load("");
  if (!meta) {
    meta = new PoolMeta("");
    meta.currentPoolIndex = new BigInt(0);
  }
  meta.totalPoolShares = event.params.totalPoolShares;
  meta.save();
}

export function handlePoolAddKeepers(event: AddKeepers): void {
  let member = PoolMember.load(event.transaction.from.toHex());
  if (member) {
    member.keepers.concat(event.params.addedKeepers as Bytes[]);
    member.save();
  }
}

export function handlePoolRemoveKeepers(event: RemoveKeepers): void {
  // let member = Member.load(event.transaction.from.toHex());
  // for (let i = 0; i < event.params.removedKeepers.length; i++) {
  //   let keeper = member.keepers[i];
  //   member.keepers = member.keepers.filter(k => k != keeper);
  // }
  // member.save();
}

export function handlePoolSync(event: Sync): void {
  let meta = PoolMeta.load("");
  if (!meta) {
    meta = new PoolMeta("");
    meta.currentPoolIndex = new BigInt(0);
  }

  meta.currentPoolIndex = event.params.currentProposalIndex;
  meta.save();
}
