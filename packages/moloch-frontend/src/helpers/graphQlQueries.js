import gql from "graphql-tag";

export const GET_LOGGED_IN_USER = gql`
  query User($address: String!) {
    member(id: $address) {
      id
      shares
      isActive
    }
  }
`;

export const SET_PROPOSAL_ATTRIBUTES = gql`
  mutation SetAttributes($status: String!, $title: String!, $description: String!) {
    setAttributes(status: $status, title: $title, description: $description) @client {
      status
      title
      description
    }
  }
`;