import {
  determineProposalStatus,
  inGracePeriod,
  VOTING_PERIOD_LENGTH,
  GRACE_PERIOD_LENGTH,
  inVotingPeriod,
  inQueue,
  passedVotingAndGrace,
} from "./helpers/proposals";
import gql from "graphql-tag";
import { GET_METADATA } from "./helpers/graphQlQueries";
import { getToken, getMoloch, getMedianizer, getMolochPool } from "./web3";
import { bigNumberify } from "ethers/utils";

export const resolvers = {
  Query: {
    guildBankValue: async () => {
      const token = await getToken();
      const value = (await token.balanceOf(process.env.REACT_APP_GUILD_BANK_ADDRESS)).toString();
      return value;
    },
    totalShares: async () => {
      const moloch = await getMoloch();
      const shares = (await moloch.totalShares()).toString();
      return shares;
    },
    currentPeriod: async () => {
      const moloch = await getMoloch();
      const period = (await moloch.getCurrentPeriod()).toString();
      return period;
    },
    exchangeRate: async () => {
      const medianizer = await getMedianizer();
      const rate = (await medianizer.compute())[0];
      return bigNumberify(rate).toString();
    },
    proposalQueueLength: async () => {
      const moloch = await getMoloch();
      const length = (await moloch.getProposalQueueLength()).toString();
      return length;
    },
    totalPoolShares: async () => {
      const molochPool = await getMolochPool();
      const shares = (await molochPool.totalPoolShares()).toString();
      return shares;
    },
    poolValue: async () => {
      const token = await getToken();
      const value = (await token.balanceOf(process.env.REACT_APP_MOLOCH_POOL_ADDRESS)).toString();
      return value;
    },
  },
  Proposal: {
    status: (proposal, _args, { cache }) => {
      const { currentPeriod } = cache.readQuery({ query: GET_METADATA });
      return determineProposalStatus(proposal, +currentPeriod);
    },
    title: proposal => {
      try {
        const details = JSON.parse(proposal.details);
        if (details.title === "") {
          return "N/A";
        }
        return details.title || proposal.details || "";
      } catch (e) {
        // special cases for malformed proposals, remove this once proposal is stale
        if (
          proposal.details ===
          "{	itle:Member Proposal: DCInvestor,description:https://paper.dropbox.com/doc/MGP3-ETH2.0-Test-Runner--AcFiUF_av4SF5CHOuS4qSH0WAg-DZu4VRgbP1LZeUimS1k3L}"
        ) {
          return "Moloch Grant Proposal: ETH 2.0 Test Runner";
        }
        if (
          proposal.details ===
          "{title:Member Proposal: Anon,description:https://etherpad.net/p/anon_moloch_proposal}"
        ) {
          return "Member Proposal: Anon";
        }
        console.log(
          `Could not parse title from proposal.proposalIndex: ${proposal.proposalIndex} proposal.details: ${proposal.details}`,
        );
        return proposal.details || "";
      }
    },
    description: proposal => {
      try {
        const details = JSON.parse(proposal.details);
        return details.description || "";
      } catch (e) {
        if (
          proposal.details ===
          "{	itle:Member Proposal: DCInvestor,description:https://paper.dropbox.com/doc/MGP3-ETH2.0-Test-Runner--AcFiUF_av4SF5CHOuS4qSH0WAg-DZu4VRgbP1LZeUimS1k3L}"
        ) {
          return "https://paper.dropbox.com/doc/MGP3-ETH2.0-Test-Runner--AcFiUF_av4SF5CHOuS4qSH0WAg-DZu4VRgbP1LZeUimS1k3L";
        }
        if (
          proposal.details ===
          "{title:Member Proposal: Anon,description:https://etherpad.net/p/anon_moloch_proposal}"
        ) {
          return "https://paper.dropbox.com/doc/Moloch-Membership-Proposal-Anon--AikVeiZ0g9W9RmVffxagvno1AQ-9iJOOAxRinM6KwWWKSJpG";
        }
        console.log(
          `Could not parse description from proposal.proposalIndex: ${proposal.proposalIndex} proposal.details: ${proposal.details}`,
        );
        return "";
      }
    },
    gracePeriod: (proposal, _args, { cache }) => {
      const { currentPeriod } = cache.readQuery({ query: GET_METADATA });
      if (inGracePeriod(proposal, currentPeriod)) {
        return (
          +proposal.startingPeriod + VOTING_PERIOD_LENGTH + GRACE_PERIOD_LENGTH - currentPeriod
        );
      }
      return 0;
    },
    votingEnds: (proposal, _args, { cache }) => {
      const { currentPeriod } = cache.readQuery({ query: GET_METADATA });
      if (inVotingPeriod(proposal, currentPeriod)) {
        return proposal.startingPeriod + VOTING_PERIOD_LENGTH - currentPeriod;
      }
      return 0;
    },
    votingStarts: (proposal, _args, { cache }) => {
      const { currentPeriod } = cache.readQuery({ query: GET_METADATA });
      if (inQueue(proposal, currentPeriod)) {
        return proposal.startingPeriod - currentPeriod;
      }
      return 0;
    },
    readyForProcessing: (proposal, _args, { cache }) => {
      const { currentPeriod } = cache.readQuery({ query: GET_METADATA });
      if (passedVotingAndGrace(proposal, currentPeriod) && !proposal.processed) {
        return true;
      }
      return false;
    },
  },
  Mutation: {
    setAttributes: (_, variables, { cache }) => {
      const id = `Proposal:${variables.id}`;
      const fragment = gql`
        fragment getMeta on Proposal {
          status
          title
          description
          gracePeriod
          votingEnds
          votingStarts
          readyForProcessing
        }
      `;
      const proposal = cache.readFragment({ fragment, id });
      const data = {
        ...proposal,
        status: variables.status,
        title: variables.title,
        description: variables.description,
        gracePeriod: variables.gracePeriod,
        votingEnds: variables.votingEnds,
        votingStarts: variables.votingStarts,
        readyForProcessing: variables.readyForProcessing,
      };
      cache.writeData({ id, data });
      return data;
    },
  },
};
