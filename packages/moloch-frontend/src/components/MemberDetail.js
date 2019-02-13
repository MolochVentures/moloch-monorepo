import React from "react";
import { Divider, Grid, Segment, Image, Icon, Label, Header } from "semantic-ui-react";
import moment from "moment";

import bull from "assets/bull.png";

import { connect } from "react-redux";
import { fetchMemberDetail } from "../action/actions";
import gql from "graphql-tag";
import { Query } from "react-apollo";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
});

const GET_MEMBER_DETAIL = gql`
  query Member($id: String!) {
    member(id: $id) {
      id
      shares
      tokenTribute
    }
  }
`;
const MemberDetail = ({ name }) => (
  <Query query={GET_MEMBER_DETAIL} variables={{ id: name }}>
    {({ loading, error, data }) => {
      if (loading) return (
        <Segment className="blurred box">
          Loading...
        </Segment>
      );
      if (error) throw new Error(`Error!: ${error}`);

      return (
        <Segment className="blurred box">
          <Grid columns="equal">
            <Grid.Column>
              <p className="subtext">Shares</p>
              <p className="amount">{data.member.shares}</p>
            </Grid.Column>
            <Grid.Column textAlign="right">
              <p className="subtext">Total USD Value</p>
              <p className="amount">{0}</p>
            </Grid.Column>
          </Grid>
          <Grid>
            <Grid.Column textAlign="center" className="avatar">
              <Image centered src={bull} size="tiny" />
            </Grid.Column>
          </Grid>
          <p className="subtext">Tribute</p>
          <Grid columns="equal">
            <Grid.Row>
              <Grid.Column>
                <Segment className="pill" textAlign="center">
                  <Icon name="ethereum" />
                  {data.member.tokenTribute} ETH
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      );
    }}
  </Query>
);

const GET_PROPOSAL_HISTORY = gql`
  query Proposals($id: String!) {
    proposals(where: { memberAddress: $id }) {
      id
      timestamp
      tokenTribute
      sharesRequested
      processed
      didPass
      aborted
      votes {
        id
        uintVote
      }
    }
  }
`;
const ProposalDetail = ({ name }) => (
  <Query query={GET_PROPOSAL_HISTORY} variables={{ id: name }}>
    {({ loading, error, data }) => {
      if (loading) return (
        <Segment className="blurred box">
          Loading...
        </Segment>
      );
      if (error) throw new Error(`Error!: ${error}`);
      console.log('data: ', data);
      return (
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
            {data.proposals && data.proposals.length > 0 ? (
              data.proposals.map((p, idx) => {
                return (
                  <React.Fragment key={idx}>
                    <Grid.Row verticalAlign="middle">
                      <Grid.Column textAlign="center">
                        {p.votes.uintVote === 2 && <Label className="dot" circular color="green" empty />}
                        {/* TODO: is this right? */}
                        {p.votes.uintVote < 2 && <Label className="dot" circular color="red" empty />}
                        TODO: Where is the title?
                      </Grid.Column>
                      <Grid.Column textAlign="center">
                        <p className="subtext date">{new Date(p.timestamp * 1000).toIsoString()}</p>
                      </Grid.Column>
                      <Grid.Column textAlign="center">
                        <p className="subtext date">{p.sharesRequested}</p>
                      </Grid.Column>
                      <Grid.Column textAlign="center">
                        <p className="subtext date">{p.tokenTribute}</p>
                      </Grid.Column>
                      <Grid.Column textAlign="center">
                        <Header as="p" color={p.vote === 2 ? "green" : p.vote === 1 ? "red" : null}>
                          {p.vote === 2 ? "Y" : p.vote === 1 ? "N" : ""}
                        </Header>
                      </Grid.Column>
                      <Grid.Column textAlign="center">
                        <p className="subtext date">{p.aborted ? "Aborted" : (p.processed ? (p.didPass ? "Passed" : "Failed") : "Pending")}</p>
                      </Grid.Column>
                    </Grid.Row>
                    <Divider />
                  </React.Fragment>
                );
              })
            ) : (
              <>This member hasn't voted on any proposals yet.</>
            )}
          </Grid>
        </Segment>
      );
    }}
  </Query>
);

const MemberDetailView = props => (
  <div id="member_detail">
    <p className="title"> {props.match.params.name} </p>
    <Divider />
    <Grid columns={16}>
      <Grid.Row className="details">
        <Grid.Column mobile={16} tablet={16} computer={6} className="user">
          <MemberDetail name={props.match.params.name} />
        </Grid.Column>
        <Grid.Column mobile={16} tablet={16} computer={10} className="proposals">
          <ProposalDetail name={props.match.params.name} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
);

export default MemberDetailView