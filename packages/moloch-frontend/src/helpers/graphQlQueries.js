import gql from "graphql-tag";

export const GET_EXCHANGE_RATE = gql`
  query ExchangeRate {
    exchangeRate @client
  }
`

export const GET_TOTAL_SHARES = gql`
  query TotalShares {
    totalShares @client
  }
`

export const GET_GUILD_BANK_VALUE = gql`
  query GuildBankValue {
    guildBankValue @client
  }
`

export const GET_LOGGED_IN_USER = gql`
  query User($address: String!) {
    member(id: $address) {
      id
      shares
      isActive
    }
  }
`;

export const GET_MEMBERS = gql`
  {
    members(where: { shares_gt: 0, isActive: true }) {
      id
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