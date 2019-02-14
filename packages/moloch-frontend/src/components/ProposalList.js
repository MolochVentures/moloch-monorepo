import React from "react";
import { Segment, Grid, Button } from "semantic-ui-react";
import { Route, Switch, Link } from "react-router-dom";

import ProposalDetail from "./ProposalDetail";
import ProgressBar from "./ProgressBar";
import { Query, withApollo } from "react-apollo";
import gql from "graphql-tag";
import { getProposalDetailsFromOnChain, ProposalStatus } from "../helpers/proposals";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
});

const ProposalCard = ({ proposal }) => {
  let id = proposal.id;
  return (
    <Grid.Column mobile={16} tablet={8} computer={5}>
      <Link to={{ pathname: `/proposals/${id}` }} className="uncolored">
        <Segment className="blurred box">
          <p className="name">{proposal.title ? proposal.title : "N/A"}</p>
          <p className="subtext description">{proposal.description ? proposal.description : "N/A"}</p>
          <Grid columns="equal" className="value_shares">
            <Grid.Row>
              <Grid.Column textAlign="center">
                <p className="subtext">Shares</p>
                <p className="amount">{proposal.sharesRequested}</p>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <p className="subtext">Total USD Value</p>
                <p className="amount">{formatter.format(0)}</p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Grid columns="equal" className="deadlines">
            <Grid.Row>
              <Grid.Column textAlign="center">
                <Segment className="voting pill" textAlign="center">
                  {proposal.votingEnded ? (
                    <span className="subtext">Voting Ended</span>
                  ) : (
                    <>
                      <span className="subtext">Voting Ends: </span>
                      <span>
                        {proposal.votingEnds ? proposal.votingEnds : "-"} period$
                        {proposal.votingEnds === 1 ? null : "s"}
                      </span>
                    </>
                  )}
                </Segment>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <Segment className="grace pill" textAlign="center">
                  {proposal.graceEnded ? (
                    <span className="subtext">Grace Ended</span>
                  ) : (
                    <>
                      <span className="subtext">Grace Period Ends: </span>
                      <span>
                        {proposal.gracePeriod ? proposal.gracePeriod : "-"} period$
                        {proposal.gracePeriod === 1 ? null : "s"}
                      </span>
                    </>
                  )}
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <ProgressBar yes={parseInt(proposal.yesVotes)} no={parseInt(proposal.noVotes)} />
        </Segment>
      </Link>
    </Grid.Column>
  );
};

const GET_PROPOSAL_LIST = gql`
  {
    proposals(orderBy: proposalIndex, orderDirection: desc) {
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
    }
  }
`;
class ProposalList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      proposals: [],
      loading: true
    };

    this.fetchData(props);
  }

  async fetchData(props) {
    const { client } = props;
    this.setState({
      loading: true
    });
    const result = await client.query({
      query: GET_PROPOSAL_LIST
    });
    try {
      await this.determineProposalStatuses(result.data.proposals);
    } catch(e) {
      console.error(e)
    } finally {
      this.setState({
        loading: false
      });
    }
  }

  determineProposalStatuses = async proposals => {
    if (proposals.length === 0) {
      return;
    }

    const fullProps = [];
    for (const proposal of proposals) {
      const fullProp = await getProposalDetailsFromOnChain(proposal);
      fullProps.push(fullProp);
    }

    this.setState({
      proposals
    });
    return;
  };

  render() {
    const { isActive } = this.props;
    const { proposals } = this.state;
    const gracePeriod = proposals.filter(p => p.status === ProposalStatus.GracePeriod);
    const votingPeriod = proposals.filter(p => p.status === ProposalStatus.VotingPeriod);
    const inQueue = proposals.filter(p => p.status === ProposalStatus.InQueue);
    const completed = proposals.filter(
      p => p.status === ProposalStatus.Aborted || p.status === ProposalStatus.Passed || p.status === ProposalStatus.Failed
    );
    return (
      <div id="proposal_list">
        <React.Fragment>
          <Grid columns={16} verticalAlign="middle">
            <Grid.Column mobile={16} tablet={8} computer={4} textAlign="right" floated="right" className="submit_button">
              <Link to={isActive ? "/membershipproposalsubmission" : "/proposals"} className="link">
                <Button size="large" color="red" disabled={!isActive}>
                  New Proposal
                </Button>
              </Link>
            </Grid.Column>
          </Grid>
          {this.state.loading ? (
            <>Loading proposals...</>
          ) : (
            <>
              {/* Grace Period */}
              <Grid columns={16} verticalAlign="middle">
                <Grid.Column mobile={16} tablet={8} computer={8} textAlign="left">
                  <p className="subtext">
                    {gracePeriod.length} Proposal{gracePeriod.length > 1 || gracePeriod.length === 0 ? "s" : ""}
                  </p>
                  <p className="title">In Grace Period</p>
                </Grid.Column>
              </Grid>
              <Grid columns={3}>
                {gracePeriod.map((p, index) => (
                  <ProposalCard proposal={p} key={index} />
                ))}
              </Grid>
              {/* Voting Period */}
              <Grid columns={16} verticalAlign="middle">
                <Grid.Column mobile={16} tablet={8} computer={8} textAlign="left">
                  <p className="subtext">
                    {votingPeriod.length} Proposal{votingPeriod.length > 1 || votingPeriod.length === 0 ? "s" : ""}
                  </p>
                  <p className="title">In Voting Period</p>
                </Grid.Column>
              </Grid>
              <Grid columns={3}>
                {votingPeriod.map((p, index) => (
                  <ProposalCard proposal={p} key={index} />
                ))}
              </Grid>
              {/* In Queue */}
              <Grid columns={16} verticalAlign="middle">
                <Grid.Column mobile={16} tablet={8} computer={8} textAlign="left">
                  <p className="subtext">
                    {inQueue.length} Proposal{inQueue.length > 1 || inQueue.length === 0 ? "s" : ""}
                  </p>
                  <p className="title">In Queue</p>
                </Grid.Column>
              </Grid>
              <Grid columns={3}>
                {inQueue.map((p, index) => (
                  <ProposalCard proposal={p} key={index} />
                ))}
              </Grid>
              {/* Completed */}
              <Grid columns={16} verticalAlign="middle">
                <Grid.Column mobile={16} tablet={8} computer={8} textAlign="left">
                  <p className="subtext">
                    {completed.length} Proposal{completed.length > 1 || completed.length === 0 ? "s" : ""}
                  </p>
                  <p className="title">Completed</p>
                </Grid.Column>
              </Grid>
              <Grid columns={3}>
                {completed.map((p, index) => (
                  <ProposalCard proposal={p} key={index} />
                ))}
              </Grid>
            </>
          )}
        </React.Fragment>
      </div>
    );
  }
}
const ProposalListHOC = withApollo(ProposalList);

const GET_LOGGED_IN_USER = gql`
  query User($address: String!) {
    member(id: $address) {
      id
      shares
      isActive
    }
  }
`;
const ProposalListView = () => {
  let loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  return (
    <Query query={GET_LOGGED_IN_USER} variables={{ address: loggedUser.address }}>
      {({ loading, error, data }) => {
        if (loading) return "Loading...";
        if (error) throw new Error(`Error!: ${error}`);
        return (
          <Switch>
            <Route exact path="/proposals" render={() => <ProposalListHOC isActive={data.member.isActive} />} />
            <Route path="/proposals/:id" component={ProposalDetail} />
          </Switch>
        );
      }}
    </Query>
  );
};

export default ProposalListView;
