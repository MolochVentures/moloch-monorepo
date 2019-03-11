import React from "react";
import { Segment, Grid, Button, Tab } from "semantic-ui-react";
import { Route, Switch, Link } from "react-router-dom";

import ProposalDetail from "./ProposalDetail";
import ProgressBar from "./ProgressBar";
import { Query, withApollo } from "react-apollo";
import { getProposalDetailsFromOnChain, ProposalStatus, getProposalCountdownText } from "../helpers/proposals";
import {
  GET_LOGGED_IN_USER,
  SET_PROPOSAL_ATTRIBUTES,
  GET_PROPOSAL_LIST,
  GET_METADATA
} from "../helpers/graphQlQueries";
import { convertWeiToDollars } from "../helpers/currency";
import { utils } from "ethers";

const ProposalCard = ({ proposal, totalShares, shareValue, exchangeRate }) => {
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
                  {convertWeiToDollars(
                    utils
                      .bigNumberify(proposal.sharesRequested)
                      .mul(shareValue)
                      .toString(),
                    exchangeRate
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
  state = {
    proposals: [],
    loading: true,
    totalShares: 0,
    shareValue: 0,
    exchangeRate: "0"
  };

  async componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const { client } = this.props;
    this.setState({
      loading: true
    });
    const { data: proposalData } = await client.query({
      query: GET_PROPOSAL_LIST
    });

    const { data: metadata } = await client.query({
      query: GET_METADATA
    });

    try {
      await this.determineProposalStatuses(client, proposalData.proposals, metadata.currentPeriod);
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({
        loading: false,
        totalShares: +metadata.totalShares,
        shareValue: metadata.shareValue,
        exchangeRate: metadata.exchangeRate
      });
    }
  }

  determineProposalStatuses = async (client, proposals, currentPeriod) => {
    if (!proposals || proposals.length === 0) {
      return;
    }

    const fullProps = [];

    // parallelize data fetch
    await Promise.all(
      proposals.map(async proposal => {
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
      })
    );

    this.setState({
      proposals: fullProps
    });
    return;
  };

  render() {
    const { isActive } = this.props;
    const { proposals, totalShares, loading, shareValue, exchangeRate } = this.state;
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
                  <ProposalCard exchangeRate={exchangeRate} shareValue={shareValue} totalShares={totalShares} proposal={p} key={index} />
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
                <ProposalCard exchangeRate={exchangeRate} shareValue={shareValue} totalShares={totalShares} proposal={p} key={index} />
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
                  <ProposalCard exchangeRate={exchangeRate} shareValue={shareValue} totalShares={totalShares} proposal={p} key={index} />
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
                  <ProposalCard exchangeRate={exchangeRate} shareValue={shareValue} totalShares={totalShares} proposal={p} key={index} />
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

const ProposalListView = ({ loggedInUser }) => {
  return (
    <Query query={GET_LOGGED_IN_USER} variables={{ address: loggedInUser }}>
      {({ loading, error, data }) => {
        if (loading) return "Loading...";
        if (error) throw new Error(`Error!: ${error}`);
        return (
          <Switch>
            <Route exact path="/proposals" render={props => <ProposalListHOC {...props} isActive={data.member ? data.member.isActive : false} />} />
            <Route path="/proposals/:id" render={props => <ProposalDetail {...props} loggedInUser={loggedInUser} />} />
          </Switch>
        );
      }}
    </Query>
  );
};

export default ProposalListView;
