import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    loggedInUser: String!
  }

  extend type Launch {
    loggedInUser: String!
  }

  extend type Mutation {
    logIn(user: String!): [Launch]
  }
`;