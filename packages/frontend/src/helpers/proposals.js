import React from "react";

export const VOTING_PERIOD_LENGTH = 2;
export const GRACE_PERIOD_LENGTH = 2;
export const PERIOD_DURATION = 600;

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
  const seconds = PERIOD_DURATION * periods;

  const days = Math.floor((seconds % 31536000) / 86400);
  const hours = Math.floor(((seconds % 31536000) % 86400) / 3600);
  const minutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);

  let string = "";
  string = days ? `${days} days` : string;
  string = hours ? `${string} ${hours} hours` : string;
  string = minutes ? `${string} ${minutes} minutes` : string;

  return string;
}

export function getProposalCountdownText(proposal) {
  switch (proposal.status) {
    case ProposalStatus.InQueue:
      return (
        <>
          <span className="subtext">Voting Begins: </span>
          <span>{proposal.votingStarts ? periodsToTime(proposal.votingStarts) : "-"}</span>
        </>
      );
    case ProposalStatus.VotingPeriod:
      return (
        <>
          <span className="subtext">Voting Ends: </span>
          <span>{proposal.votingEnds ? periodsToTime(proposal.votingEnds) : "-"}</span>
        </>
      );
    case ProposalStatus.GracePeriod:
      return (
        <>
          <span className="subtext">Grace Period Ends: </span>
          <span>{proposal.gracePeriod ? periodsToTime(proposal.gracePeriod) : "-"}</span>
        </>
      );
    case ProposalStatus.Passed:
      return <span className="subtext">Passed</span>;
    case ProposalStatus.Failed:
      return <span className="subtext">Failed</span>;
    case ProposalStatus.Aborted:
      return <span className="subtext">Aborted</span>;
    case ProposalStatus.ReadyForProcessing:
      return <span className="subtext">Ready For Processing</span>;
    default:
      return <></>;
  }
}

export const inQueue = (proposal, currentPeriod) => currentPeriod < proposal.startingPeriod;

export const inGracePeriod = (proposal, currentPeriod) =>
    currentPeriod > proposal.startingPeriod + VOTING_PERIOD_LENGTH &&
    currentPeriod < proposal.startingPeriod + VOTING_PERIOD_LENGTH + GRACE_PERIOD_LENGTH;

export const inVotingPeriod = (proposal, currentPeriod) => currentPeriod >= proposal.startingPeriod && currentPeriod <= proposal.startingPeriod + VOTING_PERIOD_LENGTH;

export const passedVotingAndGrace = (proposal, currentPeriod) => currentPeriod > proposal.startingPeriod + VOTING_PERIOD_LENGTH + GRACE_PERIOD_LENGTH;

export function determineProposalStatus(proposal, currentPeriod) {
  proposal.startingPeriod = +proposal.startingPeriod

  let status;
  if (proposal.processed && proposal.aborted) {
    status = ProposalStatus.Aborted;
  } else if (proposal.processed && proposal.didPass) {
    status = ProposalStatus.Passed;
  } else if (proposal.processed && !proposal.didPass) {
    status = ProposalStatus.Failed;
  } else if (inGracePeriod(proposal, currentPeriod)) {
    status = ProposalStatus.GracePeriod;
  } else if (inVotingPeriod(proposal, currentPeriod)) {
    status = ProposalStatus.VotingPeriod;
  } else if (inQueue(proposal, currentPeriod)) {
    status = ProposalStatus.InQueue;
  } else if (passedVotingAndGrace(proposal, currentPeriod)) {
    status = ProposalStatus.ReadyForProcessing;
  } else {
    status = ProposalStatus.Unknown;
  }

  return status;
}
