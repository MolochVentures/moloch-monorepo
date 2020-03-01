import {
  passedVotingAndGrace,
} from "./helpers/proposals";
import { getToken, getMoloch, getMedianizer, getMolochPool } from "./web3";
import { bigNumberify } from "ethers/utils";
import gql from "graphql-tag";

const GET_CURRENT_PERIOD = gql`
  query Metadata {
    molochPeriod @client
  }
`;

export const resolvers = {
  Query: {
    guildBankValue: async () => {
      const token = await getToken();
      const value = (await token.balanceOf(process.env.REACT_APP_GUILD_BANK_ADDRESS)).toString();
      return value;
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
    molochPeriod: async () => {
      const moloch = await getMoloch();
      const period = (await moloch.getCurrentPeriod()).toString();
      return period;
    }
  },
  Proposal: {
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
    readyForProcessing: (proposal, _args, { cache }) => {
      const { currentPeriod } = cache.readQuery({ query: GET_CURRENT_PERIOD });
      if (passedVotingAndGrace(proposal, currentPeriod) && !proposal.processed) {
        return true;
      }
      return false;
    },
  },
};
