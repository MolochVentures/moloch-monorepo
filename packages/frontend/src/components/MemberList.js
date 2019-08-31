import React from "react";
import { Grid, Image, Divider } from "semantic-ui-react";
import { Switch, Route, Link } from "react-router-dom";

import MemberDetail from "./MemberDetail";
import bull from "assets/bull.png";
import hood from "assets/black-flower.jpg";

import { useQuery } from "react-apollo";
import gql from "graphql-tag";
import { GET_MEMBERS, GET_MEMBER_DETAIL } from "../helpers/graphQlQueries";

import ProfileHover from "profile-hover";

const MemberAvatar = ({ address, shares }) => (
  <Grid.Column
    mobile={5}
    tablet={3}
    computer={3}
    textAlign="center"
    className="member_avatar"
    title={address}
  >
    <ProfileHover address={address} noTheme>
      <Link to={`/members/${address}`} className="uncolored">
        <Image src={hood} centered size="tiny" />
        <p className="name">
          {!address ? "" : address.length > 10 ? address.substring(0, 10) + "..." : address}
        </p>
        <p className="subtext">{shares} shares</p>
      </Link>
    </ProfileHover>
  </Grid.Column>
);

const LoggedInUser = ({ loggedInUser }) => {
  const { loading, error, data } = useQuery(GET_MEMBER_DETAIL, {
    variables: { address: loggedInUser },
  });
  if (loading) return "...";
  if (error) throw new Error(error);

  const { member } = data;
  return member && member.isActive ? (
    <ProfileHover address={loggedInUser} noTheme>
      <Link to={`/members/${member.id}`} className="uncolored">
        <Image centered src={bull} size="tiny" />
        <p className="name">
          {!member.id ? "" : member.id.length > 10 ? member.id.substring(0, 10) + "..." : member.id}
        </p>
        <p className="subtext">{member.shares ? member.shares : 0} shares</p>
      </Link>
    </ProfileHover>
  ) : (
    <div />
  );
};

const GET_ELDERS = gql`
  {
    members(
      first: 100
      where: { shares_gte: 100, isActive: true }
      orderBy: shares
      orderDirection: desc
    ) {
      id
      shares
    }
  }
`;
const Elders = () => {
  const { loading, error, data } = useQuery(GET_ELDERS);
  if (loading) return "...";
  if (error) throw new Error(error);
  return data.members.length > 0 ? (
    data.members.map((elder, idx) => (
      <MemberAvatar address={elder.id} shares={elder.shares} key={idx} />
    ))
  ) : (
    <>No elders to show.</>
  );
};

const GET_NON_ELDERS = gql`
  {
    members(
      first: 100
      where: { shares_gt: 0, shares_lt: 100, isActive: true }
      orderBy: shares
      orderDirection: desc
    ) {
      id
      shares
    }
  }
`;
const Contributors = () => {
  const { loading, error, data } = useQuery(GET_NON_ELDERS);
  if (loading) return "...";
  if (error) throw new Error(error);
  return data.members.length > 0 ? (
    data.members.map((contributor, idx) => (
      <MemberAvatar address={contributor.id} shares={contributor.shares} key={idx} />
    ))
  ) : (
    <>No contributors to show.</>
  );
};

const MemberList = props => {
  const { loading, error, data } = useQuery(GET_MEMBERS);
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
        <Grid.Column
          mobile={16}
          tablet={6}
          computer={6}
          textAlign="left"
          className="member_list_header"
        >
          <p className="subtext">{members} Members</p>
        </Grid.Column>
      </Grid>

      <Grid>
        <Grid.Column textAlign="center">
          <LoggedInUser {...props} />
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
};

const MemberListView = higherProps => (
  <Switch>
    <Route
      exact
      path="/members"
      render={props => <MemberList {...props} loggedInUser={higherProps.loggedInUser} />}
    />
    <Route
      path="/members/:name"
      render={props => <MemberDetail {...props} loggedInUser={higherProps.loggedInUser} />}
    />
  </Switch>
);

export default MemberListView;
