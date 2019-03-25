import React, { Component } from "react";
import { Divider, Grid, Icon, Segment, Button, Image } from "semantic-ui-react";
import { Link } from "react-router-dom";
import hood from "assets/hood.png";

import ProgressBar from "./ProgressBar";

import { withApollo, Query } from "react-apollo";
import { ProposalStatus, getProposalCountdownText } from "../helpers/proposals";
import { getMoloch } from "../web3";
import { GET_PROPOSAL_DETAIL, GET_METADATA, GET_MEMBERS } from "../helpers/graphQlQueries";
import { convertWeiToDollars } from "../helpers/currency";
import { utils } from "ethers";
import { adopt } from "react-adopt";

export const Vote = {
  Null: 0, // default value, counted as abstention
  Yes: 1,
  No: 2
};

const MemberAvatar = ({ member }) => {
  return (
    <Grid.Column mobile={4} tablet={3} computer={3} textAlign="center" className="member_avatar" title={member}>
      <Link to={`/members/${member}`} className="uncolored">
        <Image src={hood} centered />
        <p className="name">{!member ? "" : member.length > 10 ? member.substring(0, 10) + "..." : member}</p>
      </Link>
    </Grid.Column>
  );
};

const Composed = adopt({
  proposalDetail: ({ render, id }) => (
    <Query query={GET_PROPOSAL_DETAIL} variables={{ id }}>
      {render}
    </Query>
  ),
  metadata: ({ render }) => <Query query={GET_METADATA}>{render}</Query>,
  // TODO: dont query all members
  members: ({ render }) => <Query query={GET_MEMBERS}>{render}</Query>
});

class ProposalDetail extends Component {
  state = {
    proposal: {
      tokenTribute: 0,
      sharesRequested: 0,
      votingEnded: true,
      graceEnded: true,
      yesVotes: 0,
      noVotes: 0,
      status: ProposalStatus.InQueue,
      votes: []
    },
    user: {
      id: 0,
      shares: 0,
      isActive: false
    },
    moloch: null,
    shareValue: "0",
    exchangeRate: "0"
  };

  async componentDidMount() {
    const { loggedInUser } = this.props;
    const moloch = await getMoloch(loggedInUser);
    this.setState({
      moloch
    });
  }

  handleNo = async () => {
    const { proposal, moloch } = this.state;
    await moloch.submitVote(proposal.proposalIndex, Vote.No);
    this.setState({
      userHasVoted: true
    });
  };

  handleYes = async () => {
    const { proposal, moloch } = this.state;
    await moloch.submitVote(proposal.proposalIndex, Vote.Yes);
    this.setState({
      userHasVoted: true
    });
  };

  handleProcess = async () => {
    const { proposal, moloch } = this.state;
    await moloch.processProposal(proposal.proposalIndex);
  };

  render() {
    const { loggedInUser } = this.props;

    return (
      <Composed id={this.props.match.params.id}>
        {({ proposalDetail, metadata, members }) => {
          if (proposalDetail.loading || metadata.loading || members.loading) return <Segment className="blurred box">Loading...</Segment>;
          if (proposalDetail.error) throw new Error(`Error!: ${proposalDetail.error}`);
          if (metadata.error) throw new Error(`Error!: ${metadata.error}`);
          if (members.error) throw new Error(`Error!: ${members.error}`);

          const { proposal } = proposalDetail.data;
          const { shareValue, exchangeRate } = metadata.data;

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

          const user = members.data.members.find(m => m.delegateKey === loggedInUser);
          const userHasVoted = proposal.votes.find(vote => vote.member.id === loggedInUser) ? true : false;
          const cannotVote = userHasVoted || proposal.status !== ProposalStatus.VotingPeriod || (!(user && user.shares) || !(user && user.isActive));

          return (
            <div id="proposal_detail">
              <Grid centered columns={16}>
                <Segment className="transparent box segment" textAlign="center">
                  <Grid centered columns={14}>
                    <Grid.Column mobile={16} tablet={16} computer={12}>
                      <span className="title">{proposal.title ? proposal.title : "N/A"}</span>
                    </Grid.Column>
                  </Grid>
                  <Grid centered columns={14}>
                    <Grid.Column mobile={16} tablet={16} computer={4}>
                      <div className="subtext description">{proposal.description ? proposal.description : "N/A"}</div>
                      <Grid columns="equal" className="tokens">
                        <Grid.Row>
                          <Grid.Column className="tributes">
                            <Segment className="pill" textAlign="center">
                              <Icon name="ethereum" />
                              {utils.formatEther(proposal.tokenTribute)} ETH
                            </Segment>
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                      <Grid columns="equal">
                        <Grid.Column>
                          <p className="subtext voting">Shares</p>
                          <p className="amount">{proposal.sharesRequested}</p>
                        </Grid.Column>
                        <Grid.Column textAlign="right">
                          <p className="subtext">Total USD Value</p>
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
                      </Grid>
                    </Grid.Column>

                    <Grid.Column mobile={16} tablet={16} computer={2}>
                      <Divider vertical />
                    </Grid.Column>

                    <Grid.Column mobile={16} tablet={16} computer={6}>
                      <Grid columns={16}>
                        <Grid.Column textAlign="center" mobile={16} tablet={16} computer={16} className="pill_column">
                          <span className="pill">{getProposalCountdownText(proposal)}</span>
                        </Grid.Column>
                      </Grid>
                      <Grid columns={16} className="member_list">
                        <Grid.Row>
                          <Grid.Column mobile={16} tablet={16} computer={16} className="pill_column">
                            {proposal.votes && proposal.votes.length > 0 ? (
                              <Grid>
                                <Grid.Row className="members_row">
                                  {/* centered */}
                                  {proposal.votes.map((vote, idx) => (
                                    <MemberAvatar member={vote.member.id} shares={vote.member.shares} key={idx} />
                                  ))}
                                </Grid.Row>
                              </Grid>
                            ) : null}
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                      <Grid>
                        <Grid.Column>
                          <ProgressBar yes={yesShares} no={noShares} />
                        </Grid.Column>
                      </Grid>
                      <Grid columns="equal" centered>
                        <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5}>
                          <Button className="btn" color="grey" disabled={cannotVote} onClick={this.handleNo}>
                            Vote No
                          </Button>
                        </Grid.Column>
                        <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5}>
                          <Button className="btn" color="grey" disabled={cannotVote} onClick={this.handleYes}>
                            Vote Yes
                          </Button>
                        </Grid.Column>
                        <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5}>
                          <Button
                            className="btn"
                            color="grey"
                            onClick={this.handleProcess}
                            disabled={proposal.status !== ProposalStatus.ReadyForProcessing}
                          >
                            Process Proposal
                          </Button>
                        </Grid.Column>
                      </Grid>
                    </Grid.Column>
                  </Grid>
                </Segment>
              </Grid>
            </div>
          );
        }}
      </Composed>
    );
  }
}

export default withApollo(ProposalDetail);
