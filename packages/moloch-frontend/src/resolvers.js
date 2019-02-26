import { ProposalStatus } from "./helpers/proposals";
import gql from "graphql-tag";

export const defaults = {
  loggedInUser: ""
};

export const resolvers = {
  Proposal: {
    status: () => ProposalStatus.Unknown
  },
  Mutation: {
    setStatus: (_, variables, { cache, getCacheKey }) => {
      const id = getCacheKey({ __typename: 'Proposal', id: variables.id })
      const fragment = gql`
        fragment getStatus on Proposal {
          status
        }
      `;
      const proposal = cache.readFragment({ fragment, id });
      const data = { ...proposal, status: variables.status };
      cache.writeData({ id, data });
      return data;
    },
  }
}