import React, { useCallback, useState, useEffect } from "react";
import { Grid, Icon, Segment, Button, Image, Loader } from "semantic-ui-react";
import { Link } from "react-router-dom";
import hood from "assets/hood.png";
import ProgressBar from "./ProgressBar";
import { useQuery } from "react-apollo";
import { ProposalStatus, getProposalCountdownText } from "../helpers/proposals";
import { getMoloch } from "../web3";
import { convertWeiToDollars, getShareValue } from "../helpers/currency";
import { utils } from "ethers";
import Linkify from "react-linkify";
import ProfileHover from "profile-hover";
import { monitorTx } from "../helpers/transaction";
import gql from "graphql-tag";

export const Vote = {
  Null: 0, // default value, counted as abstention
  Yes: 1,
  No: 2,
};

const MemberAvatar = ({ member }) => {
  return (
    <Grid.Column
      mobile={4}
      tablet={3}
      computer={3}
      textAlign="center"
      className="member_avatar"
      title={member}
    >
      <Link to={`/members/${member}`} className="uncolored">
        <Image src={hood} centered />
        <p className="name">
          {!member ? "" : member.length > 10 ? member.substring(0, 10) + "..." : member}
        </p>
      </Link>
    </Grid.Column>
  );
};

const GET_PROPOSAL_DETAIL = gql`
  query Proposal($id: String!, $delegateKey: String!) {
    proposal(id: $id) {
      id
      applicantAddress
      memberAddress
      timestamp
      tokenTribute
      sharesRequested
      processed
      yesVotes
      noVotes
      yesShares
      noShares
      proposalIndex
      votes(first: 100) {
        member {
          id
          shares
        }
        uintVote
      }
      details
      startingPeriod
      processed
      votingPeriodBegins
      votingPeriodEnds
      gracePeriodEnds
      title @client
      description @client
      readyForProcessing @client
      computedStatus @client
    }
    members(where: { delegateKey: $delegateKey }) {
      id
      shares
      isActive
      tokenTribute
      delegateKey
    }
    meta(id: "") {
      totalShares
    }
    exchangeRate @client
    guildBankValue @client
    proposalQueueLength @client
  }
`;

const ProposalDetail = ({ loggedInUser, match }) => {
  const [moloch, setMoloch] = useState();

  useEffect(() => {
    async function init() {
      const m = await getMoloch(loggedInUser);
      setMoloch(m);
    }
    init();
  }, [loggedInUser]);
  const handleNo = useCallback(
    async proposal => {
      monitorTx(moloch.submitVote(proposal.proposalIndex, Vote.No));
    },
    [moloch],
  );

  const handleYes = useCallback(
    async proposal => {
      monitorTx(moloch.submitVote(proposal.proposalIndex, Vote.Yes));
    },
    [moloch],
  );

  const handleProcess = useCallback(
    async proposal => {
      monitorTx(moloch.processProposal(proposal.proposalIndex));
    },
    [moloch],
  );

  const { loading, error, data } = useQuery(GET_PROPOSAL_DETAIL, {
    variables: { id: match.params.id, delegateKey: loggedInUser },
  });
  console.log("proposalDetail: ", data);
  if (loading) return <Loader size="massive" active />;
  if (error) throw new Error(`Error!: ${error}`);

  const {
    proposal,
    exchangeRate,
    guildBankValue,
    members,
    meta
  } = data;
  const { totalShares } = meta;

  const shareValue = getShareValue(totalShares, guildBankValue);

  const user = members.length > 0 ? members[0] : null;
  const userHasVoted = proposal.votes.find(vote => vote.member.id === loggedInUser) ? true : false;
  const cannotVote =
    proposal.aborted ||
    userHasVoted ||
    proposal.computedStatus !== ProposalStatus.VotingPeriod ||
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
              <div className="subtext description wordwrap">
                {proposal.description ? proposal.description : "N/A"}
              </div>
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
                  url={`https://molochdao.com/members/${proposal.memberAddress}`}
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
                      exchangeRate,
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
                        <MemberAvatar
                          member={vote.member.id}
                          shares={vote.member.shares}
                          key={idx}
                        />
                      ))}
                    </Grid.Row>
                  </Grid>
                ) : null}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column textAlign="center">
                {proposal.aborted ? (
                  <p className="amount">Aborted</p>
                ) : (
                  <ProgressBar yes={proposal.yesShares} no={proposal.noShares} />
                )}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid container stackable columns={3}>
                <Grid.Column textAlign="center">
                  <Button
                    className="btn"
                    color="green"
                    disabled={cannotVote}
                    onClick={() => handleYes(proposal)}
                  >
                    Vote Yes
                  </Button>
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <Button
                    className="btn"
                    color="red"
                    disabled={cannotVote}
                    onClick={() => handleNo(proposal)}
                  >
                    Vote No
                  </Button>
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <Button
                    className="btn"
                    color="grey"
                    onClick={() => handleProcess(proposal)}
                    disabled={proposal.computedStatus !== ProposalStatus.ReadyForProcessing}
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
};

export default ProposalDetail;
