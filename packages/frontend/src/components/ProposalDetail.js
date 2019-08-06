import React, { Component } from "react";
import { Grid, Icon, Segment, Button, Image } from "semantic-ui-react";
import { Link } from "react-router-dom";
import hood from "assets/hood.png";
import ProgressBar from "./ProgressBar";
import { Query } from "react-apollo";
import { ProposalStatus, getProposalCountdownText } from "../helpers/proposals";
import { getMoloch } from "../web3";
import { GET_PROPOSAL_DETAIL, GET_METADATA, GET_MEMBER_BY_DELEGATE_KEY } from "../helpers/graphQlQueries";
import { convertWeiToDollars, getShareValue } from "../helpers/currency";
import { utils } from "ethers";
import { adopt } from "react-adopt";
import Linkify from "react-linkify";
import ProfileHover from "profile-hover";
import { monitorTx } from "../helpers/transaction";

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
  member: ({ render, delegateKey }) => (
    <Query query={GET_MEMBER_BY_DELEGATE_KEY} variables={{ delegateKey }}>
      {render}
    </Query>
  )
});

export default class ProposalDetail extends Component {
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
    exchangeRate: "0",
    tx: {},
    txStatus: "submitted"
  };

  async componentDidMount() {
    const { loggedInUser } = this.props;
    const moloch = await getMoloch(loggedInUser);
    this.setState({
      moloch
    });
  }

  handleNo = async proposal => {
    const { moloch } = this.state;
    monitorTx(moloch.submitVote(proposal.proposalIndex, Vote.No));
  };

  handleYes = async proposal => {
    const { moloch } = this.state;
    monitorTx(moloch.submitVote(proposal.proposalIndex, Vote.Yes));
  };

  handleProcess = async proposal => {
    const { moloch } = this.state;
    monitorTx(moloch.processProposal(proposal.proposalIndex));
  };

  render() {
    const { loggedInUser } = this.props;

    return (
      <Composed id={this.props.match.params.id} delegateKey={loggedInUser}>
        {({ proposalDetail, metadata, member }) => {
          console.log("proposalDetail: ", proposalDetail);
          if (proposalDetail.loading || metadata.loading || member.loading) return <Segment className="blurred box">Loading...</Segment>;
          if (proposalDetail.error) throw new Error(`Error!: ${proposalDetail.error}`);
          if (metadata.error) throw new Error(`Error!: ${metadata.error}`);
          if (member.error) throw new Error(`Error!: ${member.error}`);

          const { proposal } = proposalDetail.data;
          const { exchangeRate, totalShares, guildBankValue } = metadata.data;
          const shareValue = getShareValue(totalShares, guildBankValue)

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

          const user = member.data.members.length > 0 ? member.data.members[0] : null;
          const userHasVoted = proposal.votes.find(vote => vote.member.id === loggedInUser) ? true : false;
          const cannotVote =
            proposal.aborted ||
            userHasVoted ||
            proposal.status !== ProposalStatus.VotingPeriod ||
            (!(user && user.shares) || !(user && user.isActive));

          return (
            <div id="proposal_detail">
              <Grid container>
                <Grid.Column>
                  <Grid.Row>
                    <span className="title">{proposal.title ? proposal.title : "N/A"}</span>
                  </Grid.Row>
                  <Grid.Row>
                    <Linkify properties={{ target: "_blank" }}>
                      <div className="subtext description wordwrap">{proposal.description ? proposal.description : "N/A"}</div>
                    </Linkify>
                  </Grid.Row>
                </Grid.Column>
              </Grid>
              <Grid container stackable columns={2} divided>
                <Grid.Column>
                  <Grid container>
                    <Grid container stackable columns={2} doubling>
                      <Grid.Column>
                        <p className="subtext">Applicant/Beneficiary</p>
                        <ProfileHover address={proposal.applicantAddress} displayFull="true" />
                      </Grid.Column>
                      <Grid.Column>
                        <p className="subtext">Proposer</p>
                        <ProfileHover
                          address={proposal.memberAddress}
                          displayFull="true"
                          url={`https://molochdao.com/members/${proposal.memberAddress}}`}
                        />
                      </Grid.Column>
                    </Grid>
                    <Grid.Row className="tributes">
                      <Segment className="pill" textAlign="center">
                        <Icon name="ethereum" />
                        {utils.formatEther(proposal.tokenTribute)} ETH
                      </Segment>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid container columns={2}>
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
                    </Grid.Row>
                  </Grid>
                </Grid.Column>
                <Grid.Column>
                  <Grid container>
                    <Grid.Row textAlign="center" className="pill_column">
                      <Grid.Column textAlign="center" className="pill_column">
                        <span className="pill">{getProposalCountdownText(proposal)}</span>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column className="member_list">
                        {proposal.votes.length > 0 ? (
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
                    <Grid.Row>
                      <Grid.Column textAlign="center">
                        {proposal.aborted ? <p className="amount">Aborted</p> : <ProgressBar yes={yesShares} no={noShares} />}
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid container stackable columns={3}>
                        <Grid.Column textAlign="center">
                          <Button className="btn" color="green" disabled={cannotVote} onClick={() => this.handleYes(proposal)}>
                            Vote Yes
                          </Button>
                        </Grid.Column>
                        <Grid.Column textAlign="center">
                          <Button className="btn" color="red" disabled={cannotVote} onClick={() => this.handleNo(proposal)}>
                            Vote No
                          </Button>
                        </Grid.Column>
                        <Grid.Column textAlign="center">
                          <Button
                            className="btn"
                            color="grey"
                            onClick={() => this.handleProcess(proposal)}
                            disabled={proposal.status !== ProposalStatus.ReadyForProcessing}
                          >
                            Process Proposal
                          </Button>
                        </Grid.Column>
                      </Grid>
                    </Grid.Row>
                  </Grid>
                </Grid.Column>
              </Grid>
            </div>
          );
        }}
      </Composed>
    );
  }
}
