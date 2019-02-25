import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Proposal {
    status: Boolean
  }

  extend type Query {
    proposalsWithStatus: [Proposal]
  }
`;