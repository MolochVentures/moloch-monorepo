import React from "react";
import { Segment, Grid, Button, Tab, Icon, Loader } from "semantic-ui-react";
import { Route, Switch, Link } from "react-router-dom";

import ProposalDetail from "./ProposalDetail";
import ProgressBar from "./ProgressBar";
import { useQuery } from "react-apollo";
import { ProposalStatus, getProposalCountdownText } from "../helpers/proposals";
import { utils } from "ethers";
import gql from "graphql-tag";
import { getShareValue } from "helpers/currency";

const ProposalCard = ({ proposal }) => {
  let id = proposal.id;

  return (
    <Grid.Column mobile={16} tablet={8} computer={5}>
      <Link to={{ pathname: `/proposals/${id}` }} className="uncolored">
        <Segment>
          <p className="name">{proposal.title ? proposal.title : "N/A"}</p>
          <p className="subtext description">
            {proposal.description ? proposal.description : "N/A"}
          </p>
          <Grid columns="equal" className="value_shares">
            <Grid.Row>
              <Grid.Column textAlign="center">
                <p className="subtext">Shares Requested</p>
                <p className="amount">{proposal.sharesRequested}</p>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <p className="subtext">
                  Tribute <Icon name="ethereum" />
                </p>
                <p className="amount">
                  {parseFloat(utils.formatEther(proposal.tokenTribute)).toFixed(2)}
                </p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Grid columns="equal" className="deadlines">
            <Grid.Row>
              <Grid.Column textAlign="center">
                <Segment className="voting pill" textAlign="center">
                  {getProposalCountdownText(proposal)}
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          {proposal.aborted ? (
            <Grid columns="equal" className="deadlines">
              <Grid.Row>
                <Grid.Column textAlign="center">
                  <p className="amount">Aborted</p>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          ) : (
            <ProgressBar yes={proposal.yesShares} no={proposal.noShares} />
          )}
        </Segment>
      </Link>
    </Grid.Column>
  );
};

const GET_COMPLETED_PROPOSAL_LIST = gql`
  query Feed($offset: Int, $limit: Int) {
    proposals(
      first: $limit
      skip: $offset
      orderBy: proposalIndex
      orderDirection: desc
      where: { processed: true }
    ) {
      id
      timestamp
      tokenTribute
      sharesRequested
      processed
      didPass
      aborted
      yesVotes
      noVotes
      yesShares
      noShares
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

const GET_ACTIVE_PROPOSAL_LIST = gql`
  {
    proposals(
      first: 100
      orderBy: proposalIndex
      orderDirection: desc
      where: { processed: false }
    ) {
      id
      timestamp
      tokenTribute
      sharesRequested
      processed
      didPass
      aborted
      yesVotes
      noVotes
      yesShares
      noShares
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
    exchangeRate @client
    totalShares @client
    guildBankValue @client
    currentPeriod @client
  }
`;

let finishedLoadingRecords = false;
const ProposalList = ({ isActive }) => {
  const { loading, error, data } = useQuery(GET_ACTIVE_PROPOSAL_LIST);
  const {
    loading: completedLoading,
    error: completedError,
    data: completedData,
    fetchMore: completedFetchMore,
  } = useQuery(GET_COMPLETED_PROPOSAL_LIST, {
    variables: {
      offset: 0,
      limit: 100,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (loading) return <Loader size="massive" active />;
  if (error) throw new Error(error);
  if (completedError) throw new Error(completedError);
  const { proposals, exchangeRate, totalShares, guildBankValue } = data;
  const shareValue = getShareValue(totalShares, guildBankValue);

  let completedProposals = [];
  if (!completedLoading) {
    completedProposals = completedData.proposals;
    if (!finishedLoadingRecords) {
      console.log(
        `Loading more completed proposal records... offset: ${completedData.proposals.length}`,
      );
      completedFetchMore({
        variables: {
          offset: completedData.proposals.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          console.log(
            `fetchMoreResult.proposals.length: ${fetchMoreResult.proposals.length}, prev.proposals.length: ${prev.proposals.length}`,
          );
          if (fetchMoreResult.proposals.length === 0) {
            console.log(`Finished loading`);
            finishedLoadingRecords = true;
          }
          return Object.assign({}, prev, {
            proposals: [...prev.proposals, ...fetchMoreResult.proposals],
          });
        },
      });
    }
  }

  // sort in descending order of index
  const sortProposals = (a, b) => b.proposalIndex - a.proposalIndex;

  const gracePeriod = proposals
    .filter(p => p.status === ProposalStatus.GracePeriod)
    .sort(sortProposals);
  const votingPeriod = proposals
    .filter(p => p.status === ProposalStatus.VotingPeriod)
    .sort(sortProposals);
  const inQueue = proposals.filter(p => p.status === ProposalStatus.InQueue).sort(sortProposals);
  const readyForProcessing = proposals
    .filter(p => p.status === ProposalStatus.ReadyForProcessing)
    .sort(sortProposals);

  const panes = [
    {
      menuItem: `Voting Period (${votingPeriod.length})`,
      render: () => (
        <Tab.Pane attached={false}>
          <Grid columns={3}>
            {votingPeriod.map((p, index) => (
              <ProposalCard
                exchangeRate={exchangeRate}
                shareValue={shareValue}
                totalShares={+totalShares}
                proposal={p}
                key={index}
              />
            ))}
          </Grid>
        </Tab.Pane>
      ),
    },
    {
      menuItem: `Grace Period (${gracePeriod.length})`,
      render: () => (
        <Tab.Pane attached={false}>
          <Grid columns={3}>
            {gracePeriod.map((p, index) => (
              <ProposalCard
                exchangeRate={exchangeRate}
                shareValue={shareValue}
                totalShares={+totalShares}
                proposal={p}
                key={index}
              />
            ))}
          </Grid>
        </Tab.Pane>
      ),
    },
    {
      menuItem: `Ready For Processing (${readyForProcessing.length})`,
      render: () => (
        <Tab.Pane attached={false}>
          <Grid columns={3}>
            {readyForProcessing.map((p, index) => (
              <ProposalCard
                exchangeRate={exchangeRate}
                shareValue={shareValue}
                totalShares={+totalShares}
                proposal={p}
                key={index}
              />
            ))}
          </Grid>
        </Tab.Pane>
      ),
    },
    {
      menuItem: `In Queue (${inQueue.length})`,
      render: () => (
        <Tab.Pane attached={false}>
          <Grid columns={3}>
            {inQueue.map((p, index) => (
              <ProposalCard
                exchangeRate={exchangeRate}
                shareValue={shareValue}
                totalShares={+totalShares}
                proposal={p}
                key={index}
              />
            ))}
          </Grid>
        </Tab.Pane>
      ),
    },
    {
      menuItem: `Completed (${completedLoading ? "..." : completedProposals.length})`,
      render: () => (
        <Tab.Pane attached={false}>
          {completedLoading ? (
            <Loader size="massive" active />
          ) : (
            <Grid columns={3}>
              {completedProposals.map((p, index) => (
                <ProposalCard
                  exchangeRate={exchangeRate}
                  shareValue={shareValue}
                  totalShares={+totalShares}
                  proposal={p}
                  key={index}
                />
              ))}
            </Grid>
          )}
        </Tab.Pane>
      ),
    },
  ];

  return (
    <div id="proposal_list">
      <>
        <Grid columns={16} verticalAlign="middle">
          <Grid.Column
            mobile={16}
            tablet={8}
            computer={4}
            textAlign="right"
            floated="right"
            className="submit_button"
          >
            <Link to={isActive ? "/proposalsubmission" : "/proposals"} className="link">
              <Button size="large" color="red" disabled={!isActive}>
                New Proposal
              </Button>
            </Link>
          </Grid.Column>
        </Grid>
        <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
      </>
    </div>
  );
};

const GET_MEMBER_BY_DELEGATE_KEY = gql`
  query Member($delegateKey: String!) {
    members(where: { delegateKey: $delegateKey }) {
      id
      shares
      isActive
      tokenTribute
      delegateKey
    }
    exchangeRate @client
    totalShares @client
    guildBankValue @client
    currentPeriod @client
    proposalQueueLength @client
  }
`;

const ProposalListView = ({ loggedInUser }) => {
  const { loading, error, data } = useQuery(GET_MEMBER_BY_DELEGATE_KEY, {
    variables: { delegateKey: loggedInUser },
  });
  if (loading) return <Loader size="massive" active />;
  if (error) throw new Error(error);
  const member = data.members.length > 0 ? data.members[0] : null;
  return (
    <Switch>
      <Route
        exact
        path="/proposals"
        render={props => <ProposalList {...props} isActive={member ? member.isActive : false} />}
      />
      <Route
        path="/proposals/:id"
        render={props => <ProposalDetail {...props} loggedInUser={loggedInUser} />}
      />
    </Switch>
  );
};

export default ProposalListView;
