import React from "react"
import { getMoloch } from "../web3";

const VOTING_PERIOD_LENGTH = 35;
const GRACE_PERIOD_LENGTH = 35;
const PERIOD_DURATION = 17280;

export const ProposalStatus = {
  Unknown: "Unknown",
  InQueue: "InQueue",
  VotingPeriod: "VotingPeriod",
  GracePeriod: "GracePeriod",
  Aborted: "Aborted",
  Passed: "Passed",
  Failed: "Failed",
  ReadyForProcessing: "ReadyForProcessing"
};

export function periodsToTime(periods) {
  const seconds = PERIOD_DURATION * periods

  const days = Math.floor((seconds % 31536000) / 86400); 
  const hours = Math.floor(((seconds % 31536000) % 86400) / 3600);
  const minutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);

  let string = ""
  string = days ? `${days} days` : string
  string = hours ? `${string} ${hours} hours` : string
  string = minutes ? `${string} ${minutes} minutes` : string

  return string
}

export function getProposalCountdownText(proposal) {
  switch (proposal.status) {
    case ProposalStatus.InQueue:
      return (
        <>
          <span className="subtext">Voting Begins: </span>
          <span>
            {proposal.votingStarts ? periodsToTime(proposal.votingStarts) : "-"}
          </span>
        </>
      );
    case ProposalStatus.VotingPeriod:
      return (
        <>
          <span className="subtext">Voting Ends: </span>
          <span>
            {proposal.votingEnds ? periodsToTime(proposal.votingEnds) : "-"}
          </span>
        </>
      );
    case ProposalStatus.GracePeriod:
      return (
        <>
          <span className="subtext">Grace Period Ends: </span>
          <span>
            {proposal.gracePeriod ? periodsToTime(proposal.gracePeriod) : "-"}
          </span>
        </>
      );
    case ProposalStatus.Passed:
      return (<span className="subtext">Passed</span>);
    case ProposalStatus.Failed:
      return (<span className="subtext">Failed</span>);
    case ProposalStatus.Aborted:
      return (<span className="subtext">Aborted</span>);
    case ProposalStatus.ReadyForProcessing:
    return (<span className="subtext">Ready For Processing</span>);
    default:
      return <></>;
  }
}

// fill in missing data from onchain
export async function getProposalDetailsFromOnChain(proposal, currentPeriod) {
  const moloch = await getMoloch()
  currentPeriod = parseInt(currentPeriod)
  console.log('currentPeriod: ', currentPeriod);
  
  const inQueue = proposal => currentPeriod < proposal.startingPeriod;

  const inGracePeriod = proposal =>
    currentPeriod > proposal.startingPeriod + VOTING_PERIOD_LENGTH &&
    currentPeriod < proposal.startingPeriod + VOTING_PERIOD_LENGTH + GRACE_PERIOD_LENGTH;

  const inVotingPeriod = proposal => currentPeriod >= proposal.startingPeriod && currentPeriod <= proposal.startingPeriod + VOTING_PERIOD_LENGTH;

  // TODO: fix to use number of shares
  const enoughPassingVotes = proposal => Math.round((parseInt(proposal.yesVotes) / (parseInt(proposal.yesVotes) + parseInt(proposal.noVotes))) * 100) > 50

  const passedVotingAndGrace = proposal => currentPeriod > proposal.startingPeriod + VOTING_PERIOD_LENGTH + GRACE_PERIOD_LENGTH

  const passedVoting = proposal => currentPeriod > proposal.startingPeriod + VOTING_PERIOD_LENGTH

  const lastProposalProcessed = async proposal => {
    if (proposal.proposalIndex === 0) {
      return true
    }
    const lastProposalFromChain = await moloch.proposalQueue(proposal.proposalIndex - 1);
    return lastProposalFromChain.processed
  }

  proposal.proposalIndex = parseInt(proposal.proposalIndex);

  const proposalFromChain = await moloch.proposalQueue(proposal.proposalIndex);
  console.log('proposalFromChain: ', proposalFromChain);
  proposal.startingPeriod = parseInt(proposalFromChain.startingPeriod.toString());

  proposal.votingEnds = 0;
  proposal.gracePeriod = 0;
  proposal.votingStarts = 0

  proposal.lastProposalProcessed = await lastProposalProcessed(proposal)
  if (proposal.aborted) {
    proposal.status = ProposalStatus.Aborted;
  } else if (proposal.processed && proposal.didPass) {
    proposal.status = ProposalStatus.Passed;
  } else if (proposal.processed && !proposal.didPass) {
    proposal.status = ProposalStatus.Failed;
  } else if (inGracePeriod(proposal)) {
    proposal.status = ProposalStatus.GracePeriod;
    proposal.gracePeriod = proposal.startingPeriod + VOTING_PERIOD_LENGTH + GRACE_PERIOD_LENGTH - currentPeriod;
  } else if (inVotingPeriod(proposal)) {
    proposal.status = ProposalStatus.VotingPeriod;
    proposal.votingEnds = proposal.startingPeriod + VOTING_PERIOD_LENGTH - currentPeriod;
  } else if (inQueue(proposal)) {
    proposal.status = ProposalStatus.InQueue;
    proposal.votingStarts = proposal.startingPeriod - currentPeriod
  } else if (passedVotingAndGrace(proposal)) {
    proposal.status = ProposalStatus.ReadyForProcessing
  } else {
    proposal.status = ProposalStatus.Unknown
  }

  proposal.votingEnded = passedVoting(proposal);
  proposal.graceEnded = passedVotingAndGrace(proposal);

  proposal.readyForProcessing = false;
  if (
    passedVotingAndGrace(proposal) &&
    enoughPassingVotes(proposal) &&
    proposal.lastProposalProcessed
  ) {
    proposal.readyForProcessing = true;
  }

  try {
    let details = JSON.parse(proposalFromChain.details);
    proposal.title = details.title || proposalFromChain.details || "";
    proposal.description = details.description || "";
  } catch (e) {
    console.log(
      `Could not parse details from proposal.proposalIndex: ${proposal.proposalIndex} proposalFromChain.details: ${proposalFromChain.details}`
    );
    proposal.title = proposalFromChain.details || ""
    proposal.description = ""
  }

  return proposal;
}
