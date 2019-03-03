import { ProposalStatus } from "./helpers/proposals";
import gql from "graphql-tag";

export const defaults = {
  loggedInUser: "",
  exchangeRate: "",
  totalShares: "",
  guildBankValue: ""
};

export const resolvers = {
  Proposal: {
    status: () => ProposalStatus.Unknown,
    title: () => "",
    description: () => ""
  },
  Mutation: {
    setAttributes: (_, variables, { cache, getCacheKey }) => {
      const id = getCacheKey({ __typename: "Proposal", id: variables.id });
      const fragment = gql`
        fragment getStatus on Proposal {
          status
        }
      `;
      const proposal = cache.readFragment({ fragment, id });
      const data = { ...proposal, status: variables.status, title: variables.title, description: variables.description };
      cache.writeData({ id, data });
      return data;
    }
  }
};
