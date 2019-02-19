import React, { Component } from "react";
import { Divider, Grid, Icon, Segment, Button, Image, Progress } from "semantic-ui-react";
import { Link } from "react-router-dom";
import hood from "assets/hood.png";

import ProgressBar from "./ProgressBar";

import gql from "graphql-tag";
import { withApollo } from "react-apollo";
import { getProposalDetailsFromOnChain, ProposalStatus } from "../helpers/proposals";
import { getMoloch } from "../web3";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
});

const Vote = {
  Null: 0, // default value, counted as abstention
  Yes: 1,
  No: 2
}
// const ProgressBar = ({ yes, no }) => (
//   <>
//   <div style={{ "position": "relative" }}>
//     <Progress percent={yes + no} color="red" size="big" style={{
//       "position": "absolute",
//       "top": "0",
//       "width": "100%"
//     }} />
//     <Progress percent={yes} color="green" size="big" />
//   </div>
//   <Grid columns="equal">
//     <Grid.Column floated="left">
//       {(typeof (yes) === 'number' && yes >= 0) ? yes : 0}% Yes
//       </Grid.Column>
//     <Grid.Column floated="right" textAlign="right">
//       {(typeof (no) === 'number' && no >= 0) ? no : 0}% No
//       </Grid.Column>
//   </Grid>
//   </>
// );

const MemberAvatar = ({ member, shares }) => {
  return (
    <Grid.Column mobile={4} tablet={3} computer={3} textAlign="center" className="member_avatar" title={member}>
      <Link to={`/members/${member}`} className="uncolored">
        <Image src={hood} centered />
        <p className="name">{!member ? "" : member.length > 10 ? member.substring(0, 10) + "..." : member}</p>
      </Link>
    </Grid.Column>
  );
};

const GET_LOGGED_IN_USER = gql`
  query User($address: String!) {
    member(id: $address) {
      id
      shares
      isActive
    }
  }
`;
const GET_PROPOSAL_DETAIL = gql`
  query Proposal($id: String!) {
    proposal(id: $id) {
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
      votes {
        member {
          id
          shares
        }
        uintVote
      }
    }
  }
`;
class ProposalDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      proposal: {
        tokenTribute: 0,
        sharesRequested: 0,
        votingEnded: true,
        graceEnded: true,
        yesVotes: 0,
        noVotes: 0,
        status: ProposalStatus.InQueue
      },
      user: {
        id: 0,
        shares: 0,
        isActive: false
      },
      moloch: null,
      limitTo: 4,
      type: '', //member or project
      userShare: 0,
      totalShares: 0,
      votedYes: 0,
      votedNo: 0,
      isAccepted: false,
      status: '',
      gracePeriod: 0,
      end: 0,
      memberStatus: ''
    };

    this.fetchData(props);
  }

  async componentDidMount() {
    const moloch = await getMoloch();
    this.setState({
      moloch
    });
  }

  async fetchData(props) {
    const { client } = props;
    const proposalResult = await client.query({
      query: GET_PROPOSAL_DETAIL,
      variables: { id: this.props.match.params.id }
    });

    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    const userResult = await client.query({
      query: GET_LOGGED_IN_USER,
      variables: { address: loggedUser.address }
    });
    this.setState({
      user: userResult.data.member
    });

    const proposal = await getProposalDetailsFromOnChain(proposalResult.data.proposal);
    this.setState({
      proposal
    });
  }

  loadData(responseJson) {
    let proposal = responseJson.items.member ? responseJson.items.member : responseJson.items;
    this.setState({ proposal_detail: proposal, isAccepted: proposal.status === "accepted" || proposal.status === "active" || proposal.status === 'passed' ? true : false, gracePeriod: (proposal.gracePeriod ? proposal.gracePeriod : 0), end: (proposal.end ? proposal.end : 0) });
    let voters = this.state.proposal_detail.voters ? this.state.proposal_detail.voters : [];
    let userHasVoted = voters.find(voter => voter.member === this.state.loggedUser) ? true : false;
    this.setState({ userHasVoted });
    this.calculateVote(voters);
  }

  handleNo = () => {
    const { proposal, moloch, user } = this.state
    moloch.methods.submitVote(proposal.proposalIndex, Vote.No).send({ from: user.id })
    this.setState({
      userHasVoted: true
    })

    
    // Add the voter to the voters of the proposal.
    // let voters = {
    //   member: JSON.parse(localStorage.getItem("loggedUser")).address,
    //   vote: 'no',
    //   shares: this.state.userShare
    // };
    // this.setState({ userHasVoted: true });
    // let name = (this.state.type === 'member') ? 'Membership proposal voted' : 'Project proposal voted';
    // this.sendProposalUpdate(name, voters);
  }

  handleYes = () => {
    const { proposal, moloch, user } = this.state
    moloch.methods.submitVote(proposal.proposalIndex, Vote.Yes).send({ from: user.id })
    this.setState({
      userHasVoted: true
    })

    
    // Add the voter to the voters of the proposal.
    // let voters = {
    //   member: JSON.parse(localStorage.getItem("loggedUser")).address,
    //   vote: 'yes',
    //   shares: this.state.userShare
    // };
    // this.setState({ userHasVoted: true });
    // let name = (this.state.type === 'member') ? 'Membership proposal voted' : 'Project proposal voted';
    // this.sendProposalUpdate(name, voters);
  }
  
  calculateVote(voters) {
    // calculate votes
    let totalNumberVotedYes = 0;
    let totalNumberVotedNo = 0;
    if (voters) {
      // eslint-disable-next-line array-callback-return
      voters.map((voter, idx) => {
        if (voter.shares) {
          switch (voter.vote) {
            case 'yes':
              totalNumberVotedYes += voter.shares;
              break;
            case 'no':
              totalNumberVotedNo += voter.shares;
              break;
            default:
              break;
          }
        }
      });
      let percentYes = Math.ceil((totalNumberVotedYes / this.state.totalShares) * 100)
      let percentNo = Math.ceil((totalNumberVotedNo / this.state.totalShares) * 100);
      
      this.setState({
        votedYes: percentYes,
        votedNo: percentNo
      });
    }
  }

  handleProcess = () => {
    const { proposal, moloch, user } = this.state
    moloch.methods.processProposal(proposal.proposalIndex).send({ from: user.id })
  }

  render() {
    return (
      <div id="proposal_detail">
        <Grid centered columns={16}>
          <Segment className="transparent box segment" textAlign="center">
            <Grid centered columns={14}>
              <Grid.Column mobile={16} tablet={16} computer={12}>
                <span className="title">{this.state.proposal.title ? this.state.proposal.title : "N/A"}</span>
              </Grid.Column>
            </Grid>
            <Grid centered columns={14}>
              <Grid.Column mobile={16} tablet={16} computer={4}>
                <div className="subtext description">{this.state.proposal.description ? this.state.proposal.description : "N/A"}</div>
                <Grid columns="equal" className="tokens" textAlign="center">
                  <Grid.Row>
                    <Grid.Column className="tributes"mobile={16} tablet={16} computer={8} style={{ marginBottom: 10 }}>
                      <Segment className="pill" textAlign="center">
                        <Icon name="ethereum" />
                        {this.state.proposal.tokenTribute} ETH
                      </Segment>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Grid columns="equal">
                  <Grid.Column>
                    <p className="subtext voting">Shares</p>
                    <p className="amount">{this.state.proposal.sharesRequested}</p>
                  </Grid.Column>
                  <Grid.Column textAlign="right">
                    <p className="subtext">Total USD Value</p>
                    <p className="amount">{formatter.format(0)}</p>
                  </Grid.Column>
                </Grid>
              </Grid.Column>

              <Grid.Column mobile={16} tablet={16} computer={2}>
                <Divider vertical />
              </Grid.Column>

              <Grid.Column mobile={16} tablet={16} computer={6}>
                <Grid columns={16}>
                  <Grid.Column textAlign="left" mobile={16} tablet={8} computer={8} className="pill_column">
                    <span className="pill">
                      {this.state.proposal.votingEnded ? (
                        <span className="subtext">Voting Ended</span>
                      ) : (
                        <>
                          <span className="subtext">Voting Ends: </span>
                          <span>
                            {this.state.proposal.votingEnds ? this.state.proposal.votingEnds : "-"} period
                            {this.state.proposal.votingEnds === 1 ? null : "s"}
                          </span>
                        </>
                      )}
                    </span>
                  </Grid.Column>
                  <Grid.Column textAlign="right" className="pill_column grace" mobile={16} tablet={8} computer={8}>
                    <span className="pill">
                      {this.state.proposal.graceEnded ? (
                        <span className="subtext">Grace Ended</span>
                      ) : (
                        <>
                          <span className="subtext">Grace Period Ends: </span>
                          <span>
                            {this.state.proposal.gracePeriod ? this.state.proposal.gracePeriod : "-"} period
                            {this.state.proposal.gracePeriod === 1 ? null : "s"}
                          </span>
                        </>
                      )}
                    </span>
                  </Grid.Column>
                </Grid>
                <Grid columns={16} className="member_list">
                  <Grid.Row>
                    <Grid.Column mobile={16} tablet={16} computer={16} className="pill_column">
                      {this.state.proposal.votes && this.state.proposal.votes.length > 0 ? (
                        <Grid>
                          <Grid.Row className="members_row">
                            {/* centered */}
                            {this.state.proposal.votes.map((vote, idx) => <MemberAvatar member={vote.member.id} shares={vote.member.shares} key={idx} />)}
                          </Grid.Row>
                        </Grid>
                      ) : null}
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Grid>
                  <Grid.Column>
                    <ProgressBar yes={parseInt(this.state.proposal.yesVotes)} no={parseInt(this.state.proposal.noVotes)} />
                  </Grid.Column>
                </Grid>
                <Grid columns="equal" centered>
                  <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5}>
                    <Button
                      className="btn"
                      color="grey"
                      disabled={
                        this.state.userHasVoted ||
                        this.state.proposal.status !== ProposalStatus.VotingPeriod ||
                        (!(this.state.user && this.state.user.shares) || !(this.state.user && this.state.user.isActive))
                      }
                      onClick={this.handleNo}
                    >
                      Vote No
                    </Button>
                  </Grid.Column>
                  <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5}>
                    <Button
                      className="btn"
                      color="grey"
                      disabled={
                        this.state.userHasVoted ||
                        this.state.proposal.status !== ProposalStatus.VotingPeriod ||
                        (!(this.state.user && this.state.user.shares) || !(this.state.user && this.state.user.isActive))
                      }
                      onClick={this.handleYes}
                    >
                      Vote Yes
                    </Button>
                  </Grid.Column>
                  <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5}>
                    <Button className="btn" color="grey" onClick={this.handleProcess} disabled={!this.state.proposal.readyForProcessing}>
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
  }
}

export default withApollo(ProposalDetail);
