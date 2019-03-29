import React from "react";
import { Segment, Grid, Button, Tab, Icon } from "semantic-ui-react";
import { Route, Switch, Link } from "react-router-dom";

import ProposalDetail, { Vote } from "./ProposalDetail";
import ProgressBar from "./ProgressBar";
import { Query } from "react-apollo";
import { ProposalStatus, getProposalCountdownText } from "../helpers/proposals";
import { GET_METADATA, GET_MEMBER_BY_DELEGATE_KEY, GET_COMPLETED_PROPOSAL_LIST, GET_ACTIVE_PROPOSAL_LIST } from "../helpers/graphQlQueries";
import { utils } from "ethers";
import { adopt } from "react-adopt";

const ProposalCard = ({ proposal }) => {
  let id = proposal.id;

  const yesShares = proposal.votes.reduce((totalVotes, vote) => {
    if (vote.uintVote === Vote.Yes) {
      return (totalVotes += parseInt(vote.member.shares));
    } else {
      return totalVotes;
    }
  }, 0);

  const noShares = proposal.votes.reduce((totalVotes, vote) => {
    if (vote.uintVote === Vote.No) {
      return (totalVotes += parseInt(vote.member.shares));
    } else {
      return totalVotes;
    }
  }, 0);

  return (
    <Grid.Column mobile={16} tablet={8} computer={5}>
      <Link to={{ pathname: `/proposals/${id}` }} className="uncolored">
        <Segment className="blurred box">
          <p className="name">{proposal.title ? proposal.title : "N/A"}</p>
          <p className="subtext description">{proposal.description ? proposal.description : "N/A"}</p>
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
                <p className="amount">{parseFloat(utils.formatEther(proposal.tokenTribute)).toFixed(2)}</p>
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
            <ProgressBar yes={yesShares} no={noShares} />
          )}
        </Segment>
      </Link>
    </Grid.Column>
  );
};

const Composed = adopt({
  activeProposalsResult: ({ render }) => <Query query={GET_ACTIVE_PROPOSAL_LIST}>{render}</Query>,
  completedProposalsResult: ({ render }) => <Query query={GET_COMPLETED_PROPOSAL_LIST}>{render}</Query>,
  metadata: ({ render }) => <Query query={GET_METADATA}>{render}</Query>
});

const ProposalList = ({ isActive }) => (
  <Composed>
    {({ activeProposalsResult, completedProposalsResult, metadata }) => {
      if (metadata.loading) return <Segment className="blurred box">Loading...</Segment>;
      if (activeProposalsResult.loading) {
        activeProposalsResult.data = { proposals: [] };
      }

      if (completedProposalsResult.loading) {
        completedProposalsResult.data = { proposals: [] };
      }

      if (activeProposalsResult.error) throw new Error(`Error!: ${activeProposalsResult.error}`);
      if (completedProposalsResult.error) throw new Error(`Error!: ${completedProposalsResult.error}`);
      if (metadata.error) throw new Error(`Error!: ${metadata.error}`);

      const { proposals } = activeProposalsResult.data;
      const { proposals: completedProposals } = completedProposalsResult.data;
      const { shareValue, exchangeRate, totalShares } = metadata.data;

      // sort in descending order of index
      const sortProposals = (a, b) => b.proposalIndex - a.proposalIndex;

      const gracePeriod = proposals.filter(p => p.status === ProposalStatus.GracePeriod).sort(sortProposals);
      const votingPeriod = proposals.filter(p => p.status === ProposalStatus.VotingPeriod).sort(sortProposals);
      const inQueue = proposals.filter(p => p.status === ProposalStatus.InQueue).sort(sortProposals);
      const readyForProcessing = proposals.filter(p => p.status === ProposalStatus.ReadyForProcessing).sort(sortProposals);

      const panes = [
        {
          menuItem: `Voting Period (${activeProposalsResult.loading ? "..." : votingPeriod.length})`,
          render: () => (
            <Tab.Pane attached={false}>
              <Grid columns={3}>
                {votingPeriod.map((p, index) => (
                  <ProposalCard exchangeRate={exchangeRate} shareValue={shareValue} totalShares={+totalShares} proposal={p} key={index} />
                ))}
              </Grid>
            </Tab.Pane>
          )
        },
        {
          menuItem: `Grace Period (${activeProposalsResult.loading ? "..." : gracePeriod.length})`,
          render: () => (
            <Tab.Pane attached={false}>
              <Grid columns={3}>
                {gracePeriod.map((p, index) => (
                  <ProposalCard exchangeRate={exchangeRate} shareValue={shareValue} totalShares={+totalShares} proposal={p} key={index} />
                ))}
              </Grid>
            </Tab.Pane>
          )
        },
        {
          menuItem: `Ready For Processing (${activeProposalsResult.loading ? "..." : readyForProcessing.length})`,
          render: () => (
            <Tab.Pane attached={false}>
              <Grid columns={3}>
                {readyForProcessing.map((p, index) => (
                  <ProposalCard exchangeRate={exchangeRate} shareValue={shareValue} totalShares={+totalShares} proposal={p} key={index} />
                ))}
              </Grid>
            </Tab.Pane>
          )
        },
        {
          menuItem: `Completed (${completedProposalsResult.loading ? "..." : completedProposals.length})`,
          render: () => (
            <Tab.Pane attached={false}>
              <Grid columns={3}>
                {completedProposals.map((p, index) => (
                  <ProposalCard exchangeRate={exchangeRate} shareValue={shareValue} totalShares={+totalShares} proposal={p} key={index} />
                ))}
              </Grid>
            </Tab.Pane>
          )
        },
        {
          menuItem: `In Queue (${activeProposalsResult.loading ? "..." : inQueue.length})`,
          render: () => (
            <Tab.Pane attached={false}>
              <Grid columns={3}>
                {inQueue.map((p, index) => (
                  <ProposalCard exchangeRate={exchangeRate} shareValue={shareValue} totalShares={+totalShares} proposal={p} key={index} />
                ))}
              </Grid>
            </Tab.Pane>
          )
        }
      ];

      return (
        <div id="proposal_list">
          <>
            <Grid columns={16} verticalAlign="middle">
              <Grid.Column mobile={16} tablet={8} computer={4} textAlign="right" floated="right" className="submit_button">
                <Link to={isActive ? "/proposalsubmission" : "/proposals"} className="link">
                  <Button size="large" color="red" disabled={!isActive}>
                    New Proposal
                  </Button>
                </Link>
              </Grid.Column>
            </Grid>
            <Tab menu={{ secondary: true, pointing: true, vertical: true }} panes={panes} />
          </>
        </div>
      );
    }}
  </Composed>
);

const ProposalListView = ({ loggedInUser }) => {
  return (
    <Query query={GET_MEMBER_BY_DELEGATE_KEY} variables={{ delegateKey: loggedInUser }}>
      {({ loading, error, data }) => {
        if (loading) return "Loading...";
        if (error) throw new Error(`Error!: ${error}`);
        const member = data.members.length > 0 ? data.members[0] : null;
        return (
          <Switch>
            <Route exact path="/proposals" render={props => <ProposalList {...props} isActive={member ? member.isActive : false} />} />
            <Route path="/proposals/:id" render={props => <ProposalDetail {...props} loggedInUser={loggedInUser} />} />
          </Switch>
        );
      }}
    </Query>
  );
};

export default ProposalListView;
