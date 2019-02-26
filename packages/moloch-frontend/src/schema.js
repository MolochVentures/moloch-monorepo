import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Proposal {
    status: String
  }

  extend type Query {
    proposalsWithStatus: [Proposal]
  }
`;