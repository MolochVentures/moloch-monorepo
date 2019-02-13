import React from "react";
import { Divider, Segment, Grid, Progress, Button } from "semantic-ui-react";
import { Route, Switch, Link } from "react-router-dom";

import ProposalDetail from "./ProposalDetail";
import { connect } from "react-redux";
import { fetchProposals, fetchMemberDetail } from "../action/actions";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { getMoloch } from "../web3";

const molochAbi = require('../abi/Moloch.abi.json')

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
});

const ProgressBar = ({ yes, no }) => (
  <>
    <div style={{ position: "relative" }}>
      <Progress
        percent={yes + no}
        color="red"
        size="small"
        style={{
          position: "absolute",
          top: "0",
          width: "100%"
        }}
      />
      <Progress percent={yes} color="green" size="small" />
    </div>
    <Grid columns="equal">
      <Grid.Column floated="left">{typeof yes === "number" ? yes : 0}% Yes</Grid.Column>
      <Grid.Column floated="right" textAlign="right">
        {typeof no === "number" ? no : 0}% No
      </Grid.Column>
    </Grid>
  </>
);

const ProposalCard = ({ proposal }) => {
  let id = proposal.id;
  return (
    <Grid.Column mobile={16} tablet={8} computer={5}>
      <Link
        to={{ pathname: `/proposals/${id}` }}
        className="uncolored"
      >
        <Segment className="blurred box">
          <p className="name">Title Goes Here</p>
          <p className="subtext description">Description Goes Here</p>
          <Grid columns="equal" className="value_shares">
            <Grid.Row>
              <Grid.Column textAlign="center">
                <p className="subtext">Shares</p>
                <p className="amount">{proposal.sharesRequested}</p>
              </Grid.Column>
              <Divider vertical />
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
                  <span className="subtext">Voting Ends: </span>
                  <span>
                    1 day
                  </span>
                </Segment>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <Segment className="grace pill" textAlign="center">
                  <span className="subtext">Grace Period: </span>
                  <span>
                    1 day
                  </span>
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <ProgressBar yes={proposal.yesVotes} no={proposal.noVotes} />
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
  state = {
    proposals: []
  }

  async componentDidUpdate() {
    const { proposals } = this.state
    if (proposals.length === 0) {
      return
    }

    console.log('proposals: ', proposals);

    const moloch = getMoloch()
    const currentPeriod = await moloch.methods.getCurrentPeriod().call()
    console.log('currentPeriod: ', currentPeriod);

    const firstProposal = await moloch.methods.proposalQueue(proposals[0].proposalIndex).call()
    console.log('firstProposal: ', firstProposal);
    // if (firstProposal)
  }

  render() {
    const { isActive } = this.props
    return (
      <Query query={GET_PROPOSAL_LIST}>
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) throw new Error(`Error!: ${error}`);

          if (this.state.proposals.length === 0) { 
            this.setState({
              proposals: data.proposals
            })
          }
  
          return (
            <div id="proposal_list">
              {/* {data.proposals.length > 0 ? null : (
                <>
                  <Grid columns={16} verticalAlign="middle">
                    <Grid.Column mobile={16} tablet={8} computer={8} textAlign="left">
                      <>No proposals to show.</>
                    </Grid.Column>
                    <Grid.Column mobile={16} tablet={8} computer={4} textAlign="right" floated="right" className="submit_button">
                      <Link
                        to={
                          props.userShare && (props.memberStatus === "active" || props.memberStatus === "founder")
                            ? "/membershipproposalsubmission"
                            : "/proposals"
                        }
                        className="link"
                      >
                        <Button
                          size="large"
                          color="red"
                          disabled={!isActive}
                        >
                          New Proposal
                        </Button>
                      </Link>
                    </Grid.Column>
                  </Grid>
                </>
              )} */}
              <React.Fragment>
                {data.proposals.length > 0 ? (
                  <>
                    <Grid columns={16} verticalAlign="middle">
                      <Grid.Column mobile={16} tablet={8} computer={8} textAlign="left">
                        <p className="subtext">
                          {data.proposals.length} Proposal{data.proposals.length > 1 ? "s" : ""}
                        </p>
                        <p className="title">In Progress</p>
                      </Grid.Column>
                      <Grid.Column mobile={16} tablet={8} computer={4} textAlign="right" floated="right" className="submit_button">
                        <Link
                          to={isActive ? "/membershipproposalsubmission" : "/proposals"}
                          className="link"
                        >
                          <Button
                            size="large"
                            color="red"
                            disabled={!isActive}
                          >
                            New Proposal
                          </Button>
                        </Link>
                      </Grid.Column>
                    </Grid>
                    <Grid columns={3}>
                      {data.proposals.map((p, index) => (
                        <ProposalCard proposal={p} key={index} />
                      ))}
                    </Grid>
                  </>
                ) : null}
              </React.Fragment>
              {/* {
                Object.keys(props.proposals).map((key, idx) =>
                  <React.Fragment key={idx}>
                    {props.proposals[key].length > 0 && key !== 'inProgress' ?
                      <>
                        <Grid columns={16} verticalAlign="middle">
                          <Grid.Column mobile={16} tablet={8} computer={8} textAlign="left">
                            <p className="subtext">{props.proposals[key].length} Proposal{props.proposals[key].length > 1 ? 's' : ''}</p>
                            <p className="title">{(key.charAt(0).toUpperCase() + key.slice(1)).match(/[A-Z][a-z]+|[0-9]+/g).join(" ")}</p>
                          </Grid.Column>
                          {showBtnKey === key && props.proposals['inProgress'].length === 0 ?
                            <Grid.Column mobile={16} tablet={8} computer={4} textAlign="right" floated="right" className="submit_button">
                              <Link to={props.userShare && (props.memberStatus === 'active' || props.memberStatus === 'founder') ? '/membershipproposalsubmission' : '/proposals'} className="link">
                                <Button size='large' color='red' disabled={props.userShare && (props.memberStatus === 'active' || props.memberStatus === 'founder') ? false : true}>New Proposal</Button>
                              </Link>
                            </Grid.Column> 
                            : null}
                        </Grid>
                        <Grid columns={3} >
                          {props.proposals[key].map((p, index) => <ProposalCard proposal={p} key={index} />)}
                      </Grid> </>  : null}
                  </React.Fragment>
                )} */}
            </div>
          );
        }}
      </Query>
    );
  }
}

const GET_LOGGED_IN_USER = gql`
  query User($address: String!) {
    member(id: $address) {
      id
      shares
      isActive
    }
  }
`;
class ProposalListView extends React.Component {
  render() {
    let loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    return (
      <Query query={GET_LOGGED_IN_USER} variables={{ address: loggedUser.address }}>
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) throw new Error(`Error!: ${error}`);
          return (
            <Switch>
              <Route exact path="/proposals" render={() => <ProposalList isActive={data.member.isActive} />} />
              <Route path="/proposals/:id" component={ProposalDetail} />
            </Switch>
          );
        }}
      </Query>
    );
  }
}

// This function is used to convert redux global state to desired props.
function mapStateToProps(state) {
  return {
    proposals: state.proposals.items ? state.proposals.items : {}
  };
}

// This function is used to provide callbacks to container component.
function mapDispatchToProps(dispatch) {
  return {
    fetchProposals: function(params) {
      dispatch(fetchProposals(params));
    },
    fetchMemberDetail: function(id) {
      return dispatch(fetchMemberDetail(id));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProposalListView);
