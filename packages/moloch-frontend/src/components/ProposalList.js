import React from "react";
import { Segment, Grid, Button, Tab } from "semantic-ui-react";
import { Route, Switch, Link } from "react-router-dom";

import ProposalDetail from "./ProposalDetail";
import ProgressBar from "./ProgressBar";
import { Query, withApollo } from "react-apollo";
import { getProposalDetailsFromOnChain, ProposalStatus } from "../helpers/proposals";
import { GET_LOGGED_IN_USER, SET_PROPOSAL_ATTRIBUTES, GET_CURRENT_PERIOD, GET_TOTAL_SHARES, GET_SHARE_VALUE, GET_PROPOSAL_LIST } from "../helpers/graphQlQueries";
import { currencyFormatter } from "../helpers/currency";
import { utils } from "ethers";

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
      );
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
          <span className="subtext">Grace Period Ends: </span>
          <span>
            {proposal.gracePeriod ? proposal.gracePeriod : "-"} period{proposal.gracePeriod === 1 ? null : "s"}
          </span>
        </>
      );
    default:
      return <></>;
  }
}

const ProposalCard = ({ proposal, totalShares, shareValue = 0 }) => {
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
                <p className="amount">
                  {currencyFormatter.format(
                    utils
                      .bigNumberify(proposal.sharesRequested)
                      .mul(shareValue)
                      .toString()
                  )}
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
          <ProgressBar totalShares={totalShares} yes={parseInt(proposal.yesVotes)} no={parseInt(proposal.noVotes)} />
        </Segment>
      </Link>
    </Grid.Column>
  );
};

class ProposalList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      proposals: [],
      loading: true,
      totalShares: 0
    };
  }

  async componentDidMount() {
    this.fetchData();
  }

  async fetchData(props) {
    const { client } = this.props;
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

    const { data: shareValueData } = await client.query({
      query: GET_SHARE_VALUE
    });
    try {
      await this.determineProposalStatuses(client, proposalData.proposals, currentPeriodData.currentPeriod);
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({
        loading: false,
        totalShares: +totalSharesData.totalShares,
        shareValue: shareValueData.shareValue
      });
    }
  }

  determineProposalStatuses = async (client, proposals, currentPeriod) => {
    if (!proposals || proposals.length === 0) {
      return;
    }

    const fullProps = [];

    // parallelize data fetch
    await Promise.all(proposals.map(async proposal => {
      if (proposal.status === ProposalStatus.Unknown) {
        const fullProp = await getProposalDetailsFromOnChain(proposal, currentPeriod);
        const result = await client.mutate({
          mutation: SET_PROPOSAL_ATTRIBUTES,
          variables: {
            id: proposal.id,
            status: fullProp.status,
            title: fullProp.title,
            description: fullProp.description,
            gracePeriod: fullProp.gracePeriod,
            votingEnds: `${fullProp.votingEnds}`,
            votingStarts: `${fullProp.votingStarts}`,
            readyForProcessing: fullProp.readyForProcessing
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
    }))

    this.setState({
      proposals: fullProps
    });
    return;
  };

  render() {
    const { isActive } = this.props;
    const { proposals, totalShares, loading } = this.state;
    const gracePeriod = proposals.filter(p => p.status === ProposalStatus.GracePeriod);
    const votingPeriod = proposals.filter(p => p.status === ProposalStatus.VotingPeriod);
    const inQueue = proposals.filter(p => p.status === ProposalStatus.InQueue);
    const completed = proposals.filter(
      p => p.status === ProposalStatus.Aborted || p.status === ProposalStatus.Passed || p.status === ProposalStatus.Failed
    );

    const panes = [
      {
        menuItem: `Voting Period (${loading ? "..." : votingPeriod.length})`,
        render: () => (
          <Tab.Pane attached={false}>
            {this.state.loading ? (
              <>Loading proposals...</>
            ) : (
              <Grid columns={3}>
                {votingPeriod.map((p, index) => (
                  <ProposalCard totalShares={totalShares} proposal={p} key={index} />
                ))}
              </Grid>
            )}
          </Tab.Pane>
        )
      },
      {
        menuItem: `Grace Period (${loading ? "..." : gracePeriod.length})`,
        render: () => (
          <Tab.Pane attached={false}>
            <Grid columns={3}>
              {gracePeriod.map((p, index) => (
                <ProposalCard totalShares={totalShares} proposal={p} key={index} />
              ))}
            </Grid>
          </Tab.Pane>
        )
      },
      {
        menuItem: `In Queue (${loading ? "..." : inQueue.length})`,
        render: () => (
          <Tab.Pane attached={false}>
            {this.state.loading ? (
              <>Loading proposals...</>
            ) : (
              <Grid columns={3}>
                {inQueue.map((p, index) => (
                  <ProposalCard totalShares={totalShares} proposal={p} key={index} />
                ))}
              </Grid>
            )}
          </Tab.Pane>
        )
      },
      {
        menuItem: `Completed (${loading ? "..." : completed.length})`,
        render: () => (
          <Tab.Pane attached={false}>
            {this.state.loading ? (
              <>Loading proposals...</>
            ) : (
              <Grid columns={3}>
                {completed.map((p, index) => (
                  <ProposalCard totalShares={totalShares} proposal={p} key={index} />
                ))}
              </Grid>
            )}
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
          <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
        </>
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
