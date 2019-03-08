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

export const GET_SHARE_VALUE = gql`
  query ShareValue {
    shareValue @client
  }
`

export const GET_CURRENT_PERIOD = gql`
  query CurrentPeriod {
    currentPeriod @client
  }
`

export const GET_METADATA = gql`
  query GetMetadata {
    exchangeRate @client
    totalShares @client
    guildBankValue @client
    shareValue @client
    currentPeriod @client
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

// TODO filter this to get current proposals?
export const GET_PROPOSALS = gql`
  {
    proposals {
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