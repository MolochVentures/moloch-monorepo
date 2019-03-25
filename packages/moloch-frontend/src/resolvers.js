import {
  ProposalStatus,
  determineProposalStatus,
  inGracePeriod,
  VOTING_PERIOD_LENGTH,
  GRACE_PERIOD_LENGTH,
  inVotingPeriod,
  inQueue,
  passedVotingAndGrace
} from "./helpers/proposals";
import gql from "graphql-tag";
import { GET_METADATA, GET_PROPOSAL_DETAIL } from "./helpers/graphQlQueries";
import { computePublicKey } from "ethers/utils";

export const resolvers = {
  Proposal: {
    status: (proposal, _args, { cache }) => {
      const { currentPeriod } = cache.readQuery({ query: GET_METADATA });
      return determineProposalStatus(proposal, +currentPeriod);
    },
    title: proposal => {
      try {
        const details = JSON.parse(proposal.details);
        return details.title || proposal.details || "";
      } catch (e) {
        console.log(`Could not parse details from proposal.proposalIndex: ${proposal.proposalIndex} proposal.details: ${proposal.details}`);
        return "";
      }
    },
    description: proposal => {
      try {
        const details = JSON.parse(proposal.details);
        return details.description || "";
      } catch (e) {
        console.log(`Could not parse details from proposal.proposalIndex: ${proposal.proposalIndex} proposal.details: ${proposal.details}`);
        return "";
      }
    },
    gracePeriod: (proposal, _args, { cache }) => {
      const { currentPeriod } = cache.readQuery({ query: GET_METADATA });
      if (inGracePeriod(proposal, currentPeriod)) {
        return +proposal.startingPeriod + VOTING_PERIOD_LENGTH + GRACE_PERIOD_LENGTH - currentPeriod;
      }
      return 0;
    },
    votingEnds: (proposal, _args, { cache }) => {
      const { currentPeriod } = cache.readQuery({ query: GET_METADATA });
      if (inVotingPeriod(proposal, currentPeriod)) {
        return proposal.startingPeriod + VOTING_PERIOD_LENGTH - currentPeriod;
      }
      return 0;
    },
    votingStarts: (proposal, _args, { cache }) => {
      const { currentPeriod } = cache.readQuery({ query: GET_METADATA });
      if (inQueue(proposal, currentPeriod)) {
        return proposal.startingPeriod - currentPeriod;
      }
      return 0;
    },
    readyForProcessing: (proposal, _args, { cache }) => {
      const { currentPeriod } = cache.readQuery({ query: GET_METADATA });
      if (passedVotingAndGrace(proposal, currentPeriod) && !proposal.processed) {
        return true;
      }
      return false
    }
  },
  Mutation: {
    setAttributes: (_, variables, { cache }) => {
      const id = `Proposal:${variables.id}`;
      const fragment = gql`
        fragment getMeta on Proposal {
          status
          title
          description
          gracePeriod
          votingEnds
          votingStarts
          readyForProcessing
        }
      `;
      const proposal = cache.readFragment({ fragment, id });
      const data = {
        ...proposal,
        status: variables.status,
        title: variables.title,
        description: variables.description,
        gracePeriod: variables.gracePeriod,
        votingEnds: variables.votingEnds,
        votingStarts: variables.votingStarts,
        readyForProcessing: variables.readyForProcessing
      };
      cache.writeData({ id, data });
      return data;
    }
  }
};
