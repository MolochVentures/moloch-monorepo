import React, { Component } from "react";
import { Divider, Grid, Icon, Segment, Button, Image } from "semantic-ui-react";
import { Link } from "react-router-dom";
import hood from "assets/hood.png";

import ProgressBar from "./ProgressBar";

import { withApollo } from "react-apollo";
import { getProposalDetailsFromOnChain, ProposalStatus, getProposalCountdownText } from "../helpers/proposals";
import { getMoloch } from "../web3";
import { SET_PROPOSAL_ATTRIBUTES, GET_PROPOSAL_DETAIL, GET_METADATA, GET_MEMBERS } from "../helpers/graphQlQueries";
import { convertWeiToDollars } from "../helpers/currency";
import { utils } from "ethers";

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

    this.fetchData(props);
  }

  async componentDidMount() {
    const { loggedInUser } = this.props;
    const moloch = await getMoloch(loggedInUser);
    this.setState({
      moloch
    });
  }

  async fetchData() {
    const { client, loggedInUser } = this.props;

    const { data: proposalResult } = await client.query({
      query: GET_PROPOSAL_DETAIL,
      variables: { id: this.props.match.params.id }
    });

    const { data: metadata } = await client.query({
      query: GET_METADATA
    });

    const userResult = await client.query({
      query: GET_MEMBERS
    });

    const member = userResult.data.members.find(m => m.delegateKey === loggedInUser)

    let proposal = proposalResult.proposal;
    if (proposal.status === ProposalStatus.Unknown) {
      const fullProp = await getProposalDetailsFromOnChain(proposal, metadata.currentPeriod);
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
      proposal = {
        ...proposal,
        status: result.data.setAttributes.status,
        title: result.data.setAttributes.title,
        description: result.data.setAttributes.description,
        gracePeriod: result.data.setAttributes.gracePeriod,
        votingEnds: result.data.setAttributes.votingEnds,
        votingStarts: result.data.setAttributes.votingStarts,
        readyForProcessing: result.data.setAttributes.readyForProcessing
      };
    }

    const userHasVoted = proposal.votes.find(vote => vote.member.id === loggedInUser) ? true : false;

    this.setState({
      proposal,
      user: member,
      shareValue: metadata.shareValue,
      exchangeRate: metadata.exchangeRate,
      userHasVoted
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
    const { shareValue, proposal, user, exchangeRate, userHasVoted } = this.state;

     const yesShares = proposal.votes.reduce((totalVotes, vote) => {
        if (vote.uintVote === Vote.Yes) {
          return totalVotes += parseInt(vote.member.shares)
        } else {
          return totalVotes
        }
      }, 0)
    
    const noShares = proposal.votes.reduce((totalVotes, vote) => {
        if (vote.uintVote === Vote.No) {
          return totalVotes += parseInt(vote.member.shares)
        } else {
          return totalVotes
        }
      }, 0)

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
                    <Button className="btn" color="grey" onClick={this.handleProcess} disabled={proposal.status !== ProposalStatus.ReadyForProcessing}>
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
