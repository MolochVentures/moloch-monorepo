import gql from "graphql-tag";

export const GET_EXCHANGE_RATE = gql`
  query ExchangeRate {
    exchangeRate @client
  }
`;

export const GET_TOTAL_SHARES = gql`
  query TotalShares {
    totalShares @client
  }
`;

export const GET_GUILD_BANK_VALUE = gql`
  query GuildBankValue {
    guildBankValue @client
  }
`;

export const GET_SHARE_VALUE = gql`
  query ShareValue {
    shareValue @client
  }
`;

export const GET_CURRENT_PERIOD = gql`
  query CurrentPeriod {
    currentPeriod @client
  }
`;

export const GET_METADATA = gql`
  query Metadata {
    exchangeRate @client
    totalShares @client
    guildBankValue @client
    shareValue @client
    currentPeriod @client
    totalPoolShares @client
  }
`;

export const GET_MEMBER_DETAIL = gql`
  query Member($address: String!) {
    member(id: $address) {
      id
      shares
      isActive
      tokenTribute
      delegateKey
    }
  }
`;

export const GET_MEMBER_BY_DELEGATE_KEY = gql`
  query Member($delegateKey: String!) {
    members(where: { delegateKey: $delegateKey }) {
      id
      shares
      isActive
      tokenTribute
      delegateKey
    }
  }
`;

export const GET_MEMBER_DETAIL_WITH_VOTES = gql`
  query Member($address: String!) {
    member(id: $address) {
      id
      shares
      isActive
      tokenTribute
      delegateKey
      votes {
        uintVote
          proposal {
          id
          timestamp
          tokenTribute
          sharesRequested
          processed
          didPass
          aborted
          yesVotes
          noVotes
          proposalIndex
          details
          status @client
          title @client
          description @client
          gracePeriod @client
          votingEnds @client
          votingStarts @client
          readyForProcessing @client
        }
      }
    }
  }
`;

export const GET_MEMBERS = gql`
  {
    members(first: 100, where: { shares_gt: 0, isActive: true }) {
      id
      shares
      isActive
      tokenTribute
      delegateKey
    }
  }
`;

// TODO filter this to get current proposals?
export const GET_PROPOSALS = gql`
  {
    proposals(first: 100) {
      id
    }
  }
`;

export const GET_ACTIVE_PROPOSAL_LIST = gql`
  {
    proposals(first: 100, orderBy: proposalIndex, orderDirection: desc, where: { processed: false }) {
      id
      timestamp
      tokenTribute
      sharesRequested
      processed
      didPass
      aborted
      yesVotes
      noVotes
      proposalIndex
      votes(first: 100) {
        member {
          shares
        }
        uintVote
      }
      details
      startingPeriod
      processed
      status @client
      title @client
      description @client
      gracePeriod @client
      votingEnds @client
      votingStarts @client
      readyForProcessing @client
    }
  }
`;

export const GET_COMPLETED_PROPOSAL_LIST = gql`
  {
    proposals(first: 100, orderBy: proposalIndex, orderDirection: desc, where: { processed: true } ) {
      id
      timestamp
      tokenTribute
      sharesRequested
      processed
      didPass
      aborted
      yesVotes
      noVotes
      proposalIndex
      votes(first: 100) {
        member {
          shares
        }
        uintVote
      }
      details
      startingPeriod
      processed
      status @client
      title @client
      description @client
      gracePeriod @client
      votingEnds @client
      votingStarts @client
      readyForProcessing @client
    }
  }
`;

export const GET_PROPOSAL_HISTORY = gql`
  query Proposals($id: String!) {
    votes(first: 100, where: { memberAddress: $id }) {
      uintVote
      proposal {
        id
        timestamp
        tokenTribute
        sharesRequested
        processed
        didPass
        aborted
        yesVotes
        noVotes
        proposalIndex
        details
        startingPeriod
        processed
        status @client
        title @client
        description @client
        gracePeriod @client
        votingEnds @client
        votingStarts @client
        readyForProcessing @client
      }
    }
  }
`;

export const GET_PROPOSAL_DETAIL = gql`
  query Proposal($id: String!) {
    proposal(id: $id) {
      id
      applicantAddress
      memberAddress
      timestamp
      tokenTribute
      sharesRequested
      processed
      didPass
      aborted
      yesVotes
      noVotes
      proposalIndex
      votes(first: 100) {
        member {
          id
          shares
        }
        uintVote
      }
      details
      startingPeriod
      processed
      status @client
      title @client
      description @client
      gracePeriod @client
      votingEnds @client
      votingStarts @client
      readyForProcessing @client
    }
  }
`;

export const SET_PROPOSAL_ATTRIBUTES = gql`
  mutation SetAttributes(
    $status: String!, 
    $title: String!, 
    $description: String!, 
    $gracePeriod: Number!, 
    $votingEnds: Number!, 
    $votingStarts: Number!, 
    $readyForProcessing: Bool!
  ) {
    setAttributes(
      status: $status, 
      title: $title, 
      description: $description, 
      gracePeriod: $gracePeriod, 
      votingEnds: $votingEnds, 
      votingStarts: $votingStarts, 
      readyForProcessing: $readyForProcessing
    ) @client {
      status
      title
      description
      gracePeriod
      votingEnds
      votingStarts
      readyForProcessing
    }
  }
`;
