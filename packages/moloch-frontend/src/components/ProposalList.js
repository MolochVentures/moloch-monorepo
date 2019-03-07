import React from "react";
import { Segment, Grid, Button } from "semantic-ui-react";
import { Route, Switch, Link } from "react-router-dom";

import ProposalDetail from "./ProposalDetail";
import ProgressBar from "./ProgressBar";
import { Query, withApollo } from "react-apollo";
import gql from "graphql-tag";
import { getProposalDetailsFromOnChain, ProposalStatus } from "../helpers/proposals";
import { GET_LOGGED_IN_USER, SET_PROPOSAL_ATTRIBUTES, GET_CURRENT_PERIOD, GET_TOTAL_SHARES } from "../helpers/graphQlQueries";
import { formatter } from "../helpers/currency";

function getProposalCountdownText(proposal) {
  switch (proposal.status) {
    case ProposalStatus.InQueue:
      return (
        <>
          <span className="subtext">Voting Begins: </span>
          <span>
            {proposal.votingStarts ? proposal.votingStarts : "-"} period{proposal.votingStarts === 1 ? null : "s"}
          </span>
        </>
      )
    case ProposalStatus.VotingPeriod:
      return (
        <>
          <span className="subtext">Voting Ends: </span>
          <span>
            {proposal.votingEnds ? proposal.votingEnds : "-"} period{proposal.votingEnds === 1 ? null : "s"}
          </span>
        </>
      );
    case ProposalStatus.GracePeriod:
      return (
        <>
          <span className="subtext">Voting Ends: </span>
          <span>
            {proposal.gracePeriod ? proposal.gracePeriod : "-"} period{proposal.gracePeriod === 1 ? null : "s"}
          </span>
        </>
      );
    default:
      return <></>;
  }
}

const ProposalCard = ({ proposal, totalShares }) => {
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
                <p className="subtext">Shares Requested</p>
                <p className="amount">{proposal.sharesRequested}</p>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <p className="subtext">Total Value</p>
                <p className="amount">{formatter.format(0)}</p>
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
          <ProgressBar totalShares={totalShares} yes={parseInt(proposal.yesVotes)} no={parseInt(proposal.noVotes)} />
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
class ProposalList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      proposals: [],
      loading: true,
      totalShares: 0
    };

    this.fetchData(props);
  }

  async fetchData(props) {
    const { client } = props;
    this.setState({
      loading: true
    });
    const { data: proposalData } = await client.query({
      query: GET_PROPOSAL_LIST
    });

    const { data: currentPeriodData } = await client.query({
      query: GET_CURRENT_PERIOD
    });

    const { data: totalSharesData } = await client.query({
      query: GET_TOTAL_SHARES
    });
    try {
      await this.determineProposalStatuses(client, proposalData.proposals, currentPeriodData.currentPeriod);
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({
        loading: false,
        totalShares: +totalSharesData.totalShares
      });
    }
  }

  determineProposalStatuses = async (client, proposals, currentPeriod) => {
    if (!proposals || proposals.length === 0) {
      return;
    }

    const fullProps = [];
    for (const proposal of proposals) {
      if (proposal.status === ProposalStatus.Unknown) {
        const fullProp = await getProposalDetailsFromOnChain(proposal, currentPeriod);
        console.log("fullProp: ", fullProp);
        const result = await client.mutate({
          mutation: SET_PROPOSAL_ATTRIBUTES,
          variables: {
            id: proposal.id,
            status: fullProp.status,
            title: fullProp.title,
            description: fullProp.description || "",
            gracePeriod: fullProp.gracePeriod || "",
            votingEnds: `${fullProp.votingEnds}` || "",
            votingStarts: `${fullProp.votingStarts}` || "",
            readyForProcessing: fullProp.readyForProcessing || ""
          }
        });
        fullProps.push({
          ...proposal,
          status: result.data.setAttributes.status,
          title: result.data.setAttributes.title,
          description: result.data.setAttributes.description,
          gracePeriod: result.data.setAttributes.gracePeriod,
          votingEnds: result.data.setAttributes.votingEnds,
          votingStarts: result.data.setAttributes.votingStarts,
          readyForProcessing: result.data.setAttributes.readyForProcessing
        });
      } else {
        fullProps.push(proposal);
      }
    }

    this.setState({
      proposals: fullProps
    });
    return;
  };

  render() {
    const { isActive } = this.props;
    const { proposals, totalShares } = this.state;
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
              <Link to={isActive ? "/proposalsubmission" : "/proposals"} className="link">
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
                  <ProposalCard totalShares={totalShares} proposal={p} key={index} />
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
                  <ProposalCard totalShares={totalShares} proposal={p} key={index} />
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
                  <ProposalCard totalShares={totalShares} proposal={p} key={index} />
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
                  <ProposalCard totalShares={totalShares} proposal={p} key={index} />
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

const ProposalListView = props => {
  return (
    <Query query={GET_LOGGED_IN_USER} variables={{ address: props.loggedInUser }}>
      {({ loading, error, data }) => {
        if (loading) return "Loading...";
        if (error) throw new Error(`Error!: ${error}`);
        return (
          <Switch>
            <Route exact path="/proposals" render={() => <ProposalListHOC isActive={data.member ? data.member.isActive : false} />} />
            <Route path="/proposals/:id" component={ProposalDetail} />
          </Switch>
        );
      }}
    </Query>
  );
};

export default ProposalListView;
