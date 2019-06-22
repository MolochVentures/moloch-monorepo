import React, { Component } from "react";
import { Divider, Grid, Icon, Segment, Button, Image } from "semantic-ui-react";
import { Link } from "react-router-dom";
import hood from "assets/hood.png";
import ProgressBar from "./ProgressBar";
import { Query } from "react-apollo";
import { ProposalStatus, getProposalCountdownText } from "../helpers/proposals";
import { getMoloch } from "../web3";
import { GET_PROPOSAL_DETAIL, GET_METADATA, GET_MEMBER_BY_DELEGATE_KEY } from "../helpers/graphQlQueries";
import { convertWeiToDollars } from "../helpers/currency";
import { utils } from "ethers";
import { adopt } from "react-adopt";
import Linkify from "react-linkify";
import { ToastMessage } from "rimble-ui";
import ProfileHover from "profile-hover";

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
    showToast: false,
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
    this.monitorTx(moloch.submitVote(proposal.proposalIndex, Vote.No));
    this.showToast();
  };

  handleYes = async proposal => {
    const { moloch } = this.state;
    this.monitorTx(moloch.submitVote(proposal.proposalIndex, Vote.Yes));
  };

  handleProcess = async proposal => {
    const { moloch } = this.state;
    this.monitorTx(moloch.processProposal(proposal.proposalIndex));
  };

  monitorTx = txPromise => {
    window.toastProvider.addMessage("Confirm transaction using wallet...");
    txPromise
      .then(async tx => {
        console.log("tx: ", tx);
        window.toastProvider.removeMessage();
        window.toastProvider.addMessage("Transaction submitted!", {
          secondaryMessage: "Check progress on Etherscan",
          actionHref: `https://etherscan.io/tx/${tx.hash}`,
          actionText: "Check",
          variant: "processing"
        });
        await tx.wait();
        console.log("Tx wait complete");
        window.toastProvider.removeMessage();
        window.toastProvider.addMessage("Transaction Confirmed!", {
          secondaryMessage: "View on Etherscan",
          actionHref: `https://etherscan.io/tx/${tx.hash}`,
          actionText: "View",
          variant: "success"
        });
      })
      .catch(e => {
        console.log("e: ", e);
        window.toastProvider.removeMessage();
        window.toastProvider.addMessage("Error", {
          secondaryMessage: "Error occurred while processing transaction. Please try again later.",
          variant: "error"
        });
      });
  };

  getToastMessage = () => {
    const { tx, txStatus } = this.state;
    if (!tx || !tx.hash) {
      return <ToastMessage message={"Please confirm transaction using your wallet."} />;
    }
    if (txStatus === "submitted") {
      return (
        <ToastMessage.Processing
          message={"Transaction started..."}
          secondaryMessage={"Check on its progress using Etherscan"}
          actionText={"Check"}
          actionHref={`https://etherscan.io/tx/${tx.hash}`}
        />
      );
    }
    if (txStatus === "confirmed") {
      return (
        <ToastMessage.Success
          message={"Transaction Successful"}
          secondaryMessage={"View transaction on Etherscan"}
          actionText={"View"}
          actionHref={`https://etherscan.io/tx/${tx.hash}`}
        />
      );
    }
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

          const user = member.data.members.length > 0 ? member.data.members[0] : null;
          const userHasVoted = proposal.votes.find(vote => vote.member.id === loggedInUser) ? true : false;
          const cannotVote =
            proposal.aborted ||
            userHasVoted ||
            proposal.status !== ProposalStatus.VotingPeriod ||
            (!(user && user.shares) || !(user && user.isActive));

          return (
            <div id="proposal_detail">
              <Grid columns="equal">
                <Grid.Row>
                  <Grid.Column>
                    <span className="title">{proposal.title ? proposal.title : "N/A"}</span>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <Linkify properties={{ target: "_blank" }}>
                      <div className="subtext description wordwrap">{proposal.description ? proposal.description : "N/A"}</div>
                    </Linkify>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column mobile={8}>
                    <Grid.Row>
                      <Grid.Column>
                        <p className="subtext">Applicant/Beneficiary</p>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column>
                        <ProfileHover address={proposal.applicantAddress} displayFull="true" />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid.Column>
                  <Grid.Column mobile={8}>
                    <Grid.Row>
                      <Grid.Column>
                        <p className="subtext">Proposer</p>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column>
                        <ProfileHover
                          address={proposal.memberAddress}
                          displayFull="true"
                          url={`https://molochdao.com/members/${proposal.memberAddress}}`}
                        />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column className="tributes">
                    <Segment className="pill" textAlign="center">
                      <Icon name="ethereum" />
                      {utils.formatEther(proposal.tokenTribute)} ETH
                    </Segment>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
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
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column textAlign="center" className="pill_column">
                    <span className="pill">{getProposalCountdownText(proposal)}</span>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <Divider vertical />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column className="member_list">
                    <Grid.Row>
                      <Grid.Column mobile={16} tablet={16} computer={16} className="pill_column">
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
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column textAlign="center">
                    {proposal.aborted ? <p className="amount">Aborted</p> : <ProgressBar yes={yesShares} no={noShares} />}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5}>
                    <Button className="btn" color="green" disabled={cannotVote} onClick={() => this.handleYes(proposal)}>
                      Vote Yes
                    </Button>
                  </Grid.Column>
                  <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5}>
                    <Button className="btn" color="red" disabled={cannotVote} onClick={() => this.handleNo(proposal)}>
                      Vote No
                    </Button>
                  </Grid.Column>
                  <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5}>
                    <Button
                      className="btn"
                      color="grey"
                      onClick={() => this.handleProcess(proposal)}
                      disabled={proposal.status !== ProposalStatus.ReadyForProcessing}
                    >
                      Process Proposal
                    </Button>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column mobile={16} tablet={16} computer={12}>
                    <ToastMessage.Provider ref={node => (window.toastProvider = node)} />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>
          );
        }}
      </Composed>
    );
  }
}
