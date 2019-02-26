import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Proposal {
    status: String,
    title: String,
    description: String
  }

  extend type Query {
    proposalsWithStatus: [Proposal]
  }
`;