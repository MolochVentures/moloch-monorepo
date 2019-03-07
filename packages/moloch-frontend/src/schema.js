import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Proposal {
    status: String,
    title: String,
    description: String,
    gracePeriod: String,
    votingEnds: String,
    votingStarts: String,
    readyForProcessing: Bool
  }

  extend type Query {
    proposalsWithStatus: [Proposal]
  }
`;