import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Proposal {
    title: String
    description: String
    readyForProcessing: Bool
  }

  extend type Query {
    exchangeRate: String
    guildBankValue: String
    proposalQueueLength: String
    totalPoolShares: String
    poolValue: String
    molochPeriod: Int
    computedStatus: String
  }
`;
