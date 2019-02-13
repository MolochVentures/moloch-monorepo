import React from "react";
import { Grid, Image, Divider } from "semantic-ui-react";
import { Switch, Route, Link } from "react-router-dom";

import MemberDetail from "./MemberDetail";
import bull from "assets/bull.png";
import hood from "assets/hood.png";

import { Query } from "react-apollo";
import gql from "graphql-tag";

const MemberAvatar = ({ address, shares }) => (
  <Grid.Column mobile={5} tablet={3} computer={3} textAlign="center" className="member_avatar" title={address}>
    <Link to={`/members/${address}`} className="uncolored">
      <Image src={hood} centered size="tiny" />
      <p className="name">{!address ? "" : address.length > 10 ? address.substring(0, 10) + "..." : address}</p>
      <p className="subtext">{shares} shares</p>
    </Link>
  </Grid.Column>
);

const GET_LOGGED_IN_USER = gql`
  query User($address: String!) {
    member(id: $address) {
      id
      shares
      isActive
    }
  }
`;
const LoggedInUser = () => {
  let loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  return (
    <Query query={GET_LOGGED_IN_USER} variables={{ address: loggedUser.address }}>
      {({ loading, error, data }) => {
        if (loading) return "...";
        if (error) throw new Error(`Error!: ${error}`);
        return data.member && data.member.isActive ? (
          <Link to={`/members/${data.member.id}`} className="uncolored">
            <Image centered src={bull} size="tiny" />
            <p className="name">{!data.member.id ? "" : data.member.id.length > 10 ? data.member.id.substring(0, 10) + "..." : data.member.id}</p>
            <p className="subtext">{data.member.shares ? data.member.shares : 0} shares</p>
          </Link>
        ) : (
          <div />
        );
      }}
    </Query>
  );
};

const GET_ELDERS = gql`
  {
    members(where: { shares_gte: 100, isActive: true }) {
      id
      shares
    }
  }
`;
const Elders = () => (
  <Query query={GET_ELDERS}>
    {({ loading, error, data }) => {
      if (loading) return "...";
      if (error) throw new Error(`Error!: ${error}`);
      return data.members.length > 0 ? (
        data.members.map((elder, idx) => <MemberAvatar address={elder.id} shares={elder.shares} key={idx} />)
      ) : (
        <>No elders to show.</>
      );
    }}
  </Query>
);

const GET_NON_ELDERS = gql`
  {
    members(where: { shares_lt: 100, isActive: true }) {
      id
      shares
    }
  }
`;
const Contributors = () => (
  <Query query={GET_NON_ELDERS}>
    {({ loading, error, data }) => {
      if (loading) return "...";
      if (error) throw new Error(`Error!: ${error}`);
      return data.members.length > 0 ? (
        data.members.map((contributor, idx) => <MemberAvatar address={contributor.id} shares={contributor.shares} key={idx} />)
      ) : (
        <>No contributors to show.</>
      );
    }}
  </Query>
);

const GET_MEMBERS = gql`
  {
    members(where: { shares_gt: 0, isActive: true }) {
      id
    }
  }
`;
const MemberList = () => (
  <Query query={GET_MEMBERS}>
    {({ loading, error, data }) => {
      let members;
      if (error) {
        members = "NA";
        console.error(`Could not load members: ${error}`);
      } else if (loading) {
        members = "-";
      } else {
        members = data.members.length;
      }
      return (
        <div id="member_list">
          <Grid columns={16} verticalAlign="middle">
            <Grid.Column mobile={16} tablet={6} computer={6} textAlign="left" className="member_list_header">
              <p className="subtext">{members} Members</p>
              <p className="title">Ranking</p>
            </Grid.Column>

            {/* <Grid.Column mobile={16} tablet={10} computer={10} textAlign="right" className="submit_button">
              <Link to='/membershipproposalsubmission' className="link">
                <Button size='large' color='red' disabled={(props.user.status === 'founder') ? true : false}>Membership Proposal</Button>
              </Link>
            </Grid.Column> */}
          </Grid>

          <Grid>
            <Grid.Column textAlign="center">
              <LoggedInUser />
            </Grid.Column>
          </Grid>
          <Grid className="member_item">
            <Grid.Row>
              <p style={{ paddingLeft: "1rem" }}>Elders (100+ shares)</p>
            </Grid.Row>
            <Divider />
            <Grid.Row className="members_row" centered>
              <Elders />
            </Grid.Row>
          </Grid>
          <Grid className="member_item">
            <Grid.Row>
              <p style={{ paddingLeft: "1rem" }}>Contributors</p>
            </Grid.Row>
            <Divider />
            <Grid.Row className="members_row" centered>
              <Contributors />
            </Grid.Row>
          </Grid>
        </div>
      );
    }}
  </Query>
);

const MemberListView = () => (
  <Switch>
    <Route exact path="/members" render={() => <MemberList />} />
    <Route path="/members/:name" component={MemberDetail} />
  </Switch>
);

export default MemberListView;
