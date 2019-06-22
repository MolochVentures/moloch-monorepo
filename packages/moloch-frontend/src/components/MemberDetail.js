import React from "react";
import { Divider, Grid, Segment, Image, Icon, Label, Header } from "semantic-ui-react";
import { Link } from "react-router-dom";
import ProfileHover from "profile-hover";

import bull from "assets/bull.png";
import hood from "assets/hood.png";

import { Query } from "react-apollo";
import { Vote } from "./ProposalDetail";
import { utils } from "ethers";
import { convertWeiToDollars } from "../helpers/currency";
import { adopt } from "react-adopt";
import { GET_METADATA, GET_MEMBER_DETAIL_WITH_VOTES } from "../helpers/graphQlQueries";
import { getProposalCountdownText } from "../helpers/proposals";

const Composed = adopt({
  memberDetail: ({ render, name }) => (
    <Query query={GET_MEMBER_DETAIL_WITH_VOTES} variables={{ address: name }}>
      {render}
    </Query>
  ),
  metadata: ({ render }) => <Query query={GET_METADATA}>{render}</Query>
});

const MemberDetail = ({ loggedInUser, member, shareValue, exchangeRate }) => (
  <Segment className="blurred box">
    <Grid columns="equal">
      <Grid.Row>
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
              exchangeRate
            )}
          </p>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column textAlign="center" className="avatar">
          <Image centered src={loggedInUser === member.id || loggedInUser === member.delegateKey ? bull : hood} size="tiny" />
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
        <Grid.Column mobile={16} tablet={4}>
          <p className="subtitle">Delegate Key</p>
        </Grid.Column>
        <Grid.Column tablet={8}>
          <p className="subtitle">{member.delegateKey}</p>
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
                    {p.uintVote === Vote.Yes && <Label className="dot" circular color="green" empty />}
                    {/* TODO: is this right? */}
                    {(p.uintVote === Vote.No || p.uintVote === Vote.Null) && <Label className="dot" circular color="red" empty />}
                    {p.proposal.title}
                  </Link>
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <p className="subtext date">{new Date(p.proposal.timestamp * 1000).toISOString().slice(0, 10)}</p>
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <p className="subtext date">{p.proposal.sharesRequested}</p>
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <p className="subtext date">{utils.formatEther(p.proposal.tokenTribute)}</p>
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <Header as="p" color={p.uintVote === Vote.Yes ? "green" : p.uintVote === Vote.No ? "red" : null}>
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
          <Grid.Column textAlign="center">This member hasn't voted on any proposals yet.</Grid.Column>
        </Grid.Row>
      )}
    </Grid>
  </Segment>
);

const MemberDetailView = props => (
  <Composed name={props.match.params.name}>
    {({ memberDetail, metadata }) => {
      if (memberDetail.loading || metadata.loading) return <Segment className="blurred box">Loading...</Segment>;
      if (memberDetail.error) throw new Error(`Error!: ${memberDetail.error}`);
      if (metadata.error) throw new Error(`Error!: ${metadata.error}`);
      return (
        <div id="member_detail">
          <Divider />
          <Grid columns={16}>
            <Grid.Row>
              <Grid.Column mobile={16} tablet={16} computer={6}>
                <ProfileHover address={props.match.params.name} displayFull="true">
                  <p className="title">{props.match.params.name}</p>
                </ProfileHover>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row className="details">
              <Grid.Column mobile={16} tablet={16} computer={6} className="user">
                <MemberDetail
                  loggedInUser={props.loggedInUser}
                  member={memberDetail.data.member}
                  shareValue={metadata.data.shareValue}
                  exchangeRate={metadata.data.exchangeRate}
                />
              </Grid.Column>
              <Grid.Column mobile={16} tablet={16} computer={10} className="proposals">
                <ProposalDetail proposals={memberDetail.data.member.votes} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    }}
  </Composed>
);

export default MemberDetailView;
