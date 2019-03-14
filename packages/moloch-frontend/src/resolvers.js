import { ProposalStatus } from "./helpers/proposals";
import gql from "graphql-tag";

export const resolvers = {
  Proposal: {
    status: () => ProposalStatus.Unknown,
    title: () => "",
    description: () => "",
    gracePeriod: () => 0,
    votingEnds: () => 0,
    votingStarts: () => 0,
    readyForProcessing: () => false
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
