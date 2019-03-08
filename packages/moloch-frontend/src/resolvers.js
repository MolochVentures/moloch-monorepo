import { ProposalStatus } from "./helpers/proposals";
import gql from "graphql-tag";

export const resolvers = {
  Proposal: {
    status: () => ProposalStatus.Unknown,
    title: () => "",
    description: () => "",
    gracePeriod: () => "",
    votingEnds: () => "",
    votingStarts: () => "",
    readyForProcessing: () => false
  },
  Mutation: {
    setAttributes: (_, variables, { cache, getCacheKey }) => {
      const id = getCacheKey({ __typename: "Proposal", id: variables.id });
      console.log('variables: ', variables);
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
      console.log('proposal: ', proposal);
      const data = {
        ...proposal,
        status: variables.status,
        title: variables.title || "",
        description: variables.description || "",
        gracePeriod: variables.gracePeriod || "",
        votingEnds: variables.votingEnds || "",
        votingStarts: variables.votingStarts || "",
        readyForProcessing: variables.readyForProcessing || false
      };
      console.log('data: ', data);
      cache.writeData({ id, data });
      return data;
    }
  }
};
