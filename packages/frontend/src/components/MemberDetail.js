import React from "react";
import { Divider, Grid, Segment, Image, Icon, Label, Header, Loader } from "semantic-ui-react";
import { Link } from "react-router-dom";
import ProfileHover from "profile-hover";

import bull from "assets/bull.png";
import hood from "assets/hood.png";

import { useQuery } from "react-apollo";
import { Vote } from "./ProposalDetail";
import { utils } from "ethers";
import { convertWeiToDollars, getShareValue } from "../helpers/currency";
import { getProposalCountdownText } from "../helpers/proposals";
import { formatEthAddress } from "../helpers/address";
import gql from "graphql-tag";

const GET_MEMBER_DETAIL_WITH_VOTES = gql`
  query Member($address: String!) {
    member(id: $address) {
      id
      shares
      isActive
      tokenTribute
      delegateKey
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
    exchangeRate @client
    totalShares @client
    guildBankValue @client
    currentPeriod @client
    proposalQueueLength @client
  }
`;

const MemberDetail = ({ loggedInUser, member, shareValue, exchangeRate }) => (
  <Segment className="blurred box">
    <Grid container columns={1}>
      <Grid.Row>
        <Grid container columns={2}>
          <Grid.Column>
            <p className="subtitle">Shares</p>
            <p className="amount">{member.shares}</p>
          </Grid.Column>
          <Grid.Column textAlign="right">
            <p className="subtitle">Total Value</p>
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
        </Grid>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column textAlign="center" className="avatar">
          <Image
            centered
            src={loggedInUser === member.id || loggedInUser === member.delegateKey ? bull : hood}
            size="tiny"
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <p className="subtitle">Tribute</p>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Segment className="pill" textAlign="center">
            <Icon name="ethereum" />
            {utils.formatEther(member.tokenTribute)} ETH
          </Segment>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <p className="subtitle">Delegate Key</p>
        </Grid.Column>
        <Grid.Column>
          <ProfileHover address={member.delegateKey} displayFull="true">
            <p className="title">{member.delegateKey}</p>
          </ProfileHover>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>
);

const ProposalDetail = ({ proposals }) => (
  <Segment className="blurred box">
    <Grid columns="equal" textAlign="center">
      <Grid.Row className="subtext" style={{ fontSize: 20 }}>
        History
      </Grid.Row>
    </Grid>
    <Grid columns="equal">
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

const MemberDetailView = ({ loggedInUser, match }) => {
  const { loading, error, data } = useQuery(GET_MEMBER_DETAIL_WITH_VOTES, {
    variables: { address: loggedInUser },
  });
  if (loading) return <Loader size="massive" active />;
  if (error) throw new Error(error);

  const { totalShares, guildBankValue, member, exchangeRate } = data;

  const shareValue = getShareValue(totalShares, guildBankValue);
  return (
    <div id="member_detail">
      <Divider />
      <Grid container>
        <Grid.Row>
          <Grid.Column mobile={16} tablet={16} computer={6}>
            <p className="title">
              <a
                href={`https://etherscan.io/address/${match.params.name}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formatEthAddress(match.params.name)}
              </a>
            </p>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className="details">
          <Grid.Column mobile={16} tablet={16} computer={6} className="user">
            <MemberDetail
              loggedInUser={loggedInUser}
              member={member}
              shareValue={shareValue}
              exchangeRate={exchangeRate}
            />
          </Grid.Column>
          <Grid.Column mobile={16} tablet={16} computer={10} className="proposals">
            <ProposalDetail proposals={member.votes} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default MemberDetailView;
