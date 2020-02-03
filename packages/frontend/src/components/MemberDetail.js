import React from "react";
import { Divider, Grid, Segment, Label, Header, Loader } from "semantic-ui-react";
import { Link } from "react-router-dom";
import ProfileHover from "profile-hover";

import { useQuery } from "react-apollo";
import { Vote } from "./ProposalDetail";
import { utils } from "ethers";
import { convertWeiToDollars, getShareValue } from "../helpers/currency";
import { getProposalCountdownText } from "../helpers/proposals";
import gql from "graphql-tag";

const GET_MEMBER_DETAIL = gql`
  query Member($address: String!) {
    member(id: $address) {
      id
      shares
      isActive
      tokenTribute
      delegateKey
    }
  }
`;

const GET_MEMBER_VOTES = gql`
  query Member($address: String!) {
    member(id: $address) {
      id
      votes {
        uintVote
        proposal {
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
          details
          status @client
          title @client
          description @client
          gracePeriod @client
          votingEnds @client
          votingStarts @client
          readyForProcessing @client
        }
      }
    }
  }
`;

const GET_METADATA = gql`
  {
    exchangeRate @client
    totalShares @client
    guildBankValue @client
    currentPeriod @client
    proposalQueueLength @client
  }
`;

const MemberDetail = ({ memberAddress, shareValue, exchangeRate }) => {
  const { loading, error, data } = useQuery(GET_MEMBER_DETAIL, {
    variables: { address: memberAddress },
  });
  if (loading) {
    return <Loader size="massive" active />;
  }
  if (error) throw new Error(error);
  const { member } = data;

  return (
    <div id="member_detail">
      <Segment className="blurred box">
        <Grid columns={1}>
          <Grid.Row>
            <ProfileHover
              address={memberAddress}
              showName="true"
              displayFull="true"
              href="/members/${memberAddress}"
            />
          </Grid.Row>
          <Grid.Row>
            <Segment raised>
              <Grid columns={2}>
                <Grid.Row>
                  <Grid.Column>
                    <p className="subtitle">Shares</p>
                  </Grid.Column>
                  <Grid.Column textAlign="right">
                    <p className="amount">{member.shares}</p>
                  </Grid.Column>
                </Grid.Row>
                <Divider />
                <Grid.Row>
                  <Grid.Column>
                    <p className="subtitle">Total Value</p>
                  </Grid.Column>
                  <Grid.Column textAlign="right">
                    <p className="amount">
                      {convertWeiToDollars(
                        utils
                          .bigNumberify(member.shares)
                          .mul(shareValue)
                          .toString(),
                        exchangeRate,
                      )}
                    </p>
                  </Grid.Column>
                </Grid.Row>
                <Divider />
                <Grid.Row>
                  <Grid.Column>
                    <p className="subtitle">Tribute</p>
                  </Grid.Column>
                  <Grid.Column textAlign="right">
                    <p className="amount">
                      {utils.formatEther(member.tokenTribute)} DAI
                </p>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <p className="subtitle">Delegate Key</p>
            </Grid.Column>
            <Grid.Column>
              <h4 className="delegateKey">{member.delegateKey}</h4>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>
  );
};

const ProposalDetail = ({ memberAddress }) => {
  const { loading, error, data } = useQuery(GET_MEMBER_VOTES, {
    variables: { address: memberAddress },
  });
  if (loading) {
    return <Loader size="massive" active />;
  }
  if (error) throw new Error(error);
  const { member } = data;
  const proposals = member.votes;
  return (
    <Segment className="blurred box">
      <Grid columns="equal" textAlign="center">
        <Grid.Row className="subtext" style={{ fontSize: 20 }}>
          <h1 className="Title">History</h1>
        </Grid.Row>
      </Grid>
      <Grid columns="6">
        <Grid.Row className="header">
          <Grid.Column textAlign="center">
            <p className="subtext">Proposal Title</p>
          </Grid.Column>
          <Grid.Column textAlign="center">
            <p className="subtext">Date</p>
          </Grid.Column>
          <Grid.Column textAlign="center">
            <p className="subtext">Shares Requested</p>
          </Grid.Column>
          <Grid.Column textAlign="center">
            <p className="subtext">Tribute Offered</p>
          </Grid.Column>
          <Grid.Column textAlign="center">
            <p className="subtext">Vote</p>
          </Grid.Column>
          <Grid.Column textAlign="center">
            <p className="subtext">Status</p>
          </Grid.Column>
        </Grid.Row>
        {proposals && proposals.length > 0 ? (
          proposals.map((p, idx) => {
            return (
              <React.Fragment key={idx}>
                <Grid.Row verticalAlign="middle">
                  <Grid.Column textAlign="center">
                    <Link to={{ pathname: `/proposals/${p.proposal.id}` }} className="uncolored">
                      {p.uintVote === Vote.Yes && (
                        <Label className="dot" circular color="green" empty />
                      )}
                      {/* TODO: is this right? */}
                      {(p.uintVote === Vote.No || p.uintVote === Vote.Null) && (
                        <Label className="dot" circular color="red" empty />
                      )}
                      {p.proposal.title}
                    </Link>
                  </Grid.Column>
                  <Grid.Column textAlign="center">
                    <p className="subtext date">
                      {new Date(p.proposal.timestamp * 1000).toISOString().slice(0, 10)}
                    </p>
                  </Grid.Column>
                  <Grid.Column textAlign="center">
                    <p className="subtext date">{p.proposal.sharesRequested}</p>
                  </Grid.Column>
                  <Grid.Column textAlign="center">
                    <p className="subtext date">{utils.formatEther(p.proposal.tokenTribute)}</p>
                  </Grid.Column>
                  <Grid.Column textAlign="center">
                    <Header
                      as="p"
                      color={
                        p.uintVote === Vote.Yes ? "green" : p.uintVote === Vote.No ? "red" : null
                      }
                    >
                      {p.uintVote === Vote.Yes ? "Y" : p.uintVote === Vote.No ? "N" : ""}
                    </Header>
                  </Grid.Column>
                  <Grid.Column textAlign="center">
                    <p className="subtext date">{getProposalCountdownText(p.proposal)}</p>
                  </Grid.Column>
                </Grid.Row>
                <Divider />
              </React.Fragment>
            );
          })
        ) : (
            <Grid.Row verticalAlign="middle">
              <Grid.Column textAlign="center">
                {`This member hasn't voted on any proposals yet.`}
              </Grid.Column>
            </Grid.Row>
          )}
      </Grid>
    </Segment>
  );
};

const MemberDetailView = ({ loggedInUser, match }) => {
  const { loading, error, data } = useQuery(GET_METADATA);
  if (loading) return <Loader size="massive" active />;
  if (error) throw new Error(error);
  const { totalShares, guildBankValue, exchangeRate } = data;

  const shareValue = getShareValue(totalShares, guildBankValue);
  return (
    <div id="member_detail">
      <Grid container>
        <Grid.Row className="details">
          <Grid.Column mobile={16} tablet={16} computer={6} className="user">
            <MemberDetail
              loggedInUser={loggedInUser}
              memberAddress={match.params.name}
              shareValue={shareValue}
              exchangeRate={exchangeRate}
            />
          </Grid.Column>
          <Grid.Column mobile={16} tablet={16} computer={10} className="proposals">
            <ProposalDetail memberAddress={match.params.name} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default MemberDetailView;
