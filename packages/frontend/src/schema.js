import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Proposal {
    status: String
    title: String
    description: String
    gracePeriod: Number
    votingEnds: Number
    votingStarts: Number
    readyForProcessing: Bool
  }

  extend type Query {
    proposalsWithStatus: [Proposal]
    guildBankValue: String
    totalShares: String
    currentPeriod: String
    exchangeRate: String
    proposalQueueLength: String
    totalPoolShares: String
    poolValue: String
  }
`;