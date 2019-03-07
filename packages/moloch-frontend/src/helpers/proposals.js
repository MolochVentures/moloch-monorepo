import { getMoloch } from "../web3";

const VOTING_PERIOD_LENGTH = 35;
const GRACE_PERIOD_LENGTH = 35;

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
  proposal.startingPeriod = parseInt(proposalFromChain.startingPeriod);

  proposal.votingEnds = 0;
  proposal.gracePeriod = 0;

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
    proposal.status === ProposalStatus.InQueue &&
    passedVotingAndGrace(proposal) &&
    enoughPassingVotes(proposal) &&
    proposal.lastProposalProcessed
  ) {
    proposal.readyForProcessing = true;
  }

  let details = {
    title: "",
    description: ""
  };
  try {
    details = JSON.parse(proposalFromChain.details);
  } catch (e) {
    console.log(
      `Could not parse details from proposal.proposalIndex: ${proposal.proposalIndex} proposalFromChain: ${JSON.stringify(
        proposalFromChain,
        null,
        2
      )}`
    );
    details.title = proposalFromChain.details
  }

  proposal.title = details.title;
  proposal.description = details.description;

  return proposal;
}
