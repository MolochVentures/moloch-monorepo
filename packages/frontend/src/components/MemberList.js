import React from "react";
import { Grid, Image, Segment } from "semantic-ui-react";
import { Switch, Route, Link } from "react-router-dom";

import MemberDetail from "./MemberDetail";
import user from "assets/user.png";

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
  >
    <div className="profile">
      <Link to={`/members/${address}`} className="uncolored">
        <ProfileHover address={address} showName="true" />
      </Link>
    </div>
      <p className="uncolored">{shares} shares</p>
  </Grid.Column >
);

const LoggedInUser = ({ loggedInUser }) => {
  const { loading, error, data } = useQuery(GET_MEMBER_DETAIL, {
    variables: { address: loggedInUser },
  });
  if (loading) return "...";
  if (error) throw new Error(error);

  const { member } = data;
  return member && member.isActive ? (
    <Link to={`/members/${member.id}`} className="uncolored">
      <Image centered src={user} size="tiny" />
      <p className="name">
        {!member.id ? "" : member.id.length > 10 ? member.id.substring(0, 10) + "..." : member.id}
      </p>
      <p className="subtext">{member.shares ? member.shares : 0} shares</p>
    </Link>
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
      <h4>REGISTERD MEMBERS: {members}</h4>
      <Grid container columns={16} verticalAlign="center" className="memberListGrid">
        <Grid.Column
          mobile={16}
          tablet={6}
          computer={6}
          textAlign="left"
          className="member_list_header"
        >
        </Grid.Column>
      </Grid>

      <Segment id="EldersSegment">
        <Grid>
          <Grid.Row>
            <h3 style={{ paddingLeft: "1rem" }}>ELDERS (100+ SHARES)</h3>
          </Grid.Row>
          <Grid.Row className="members_row">
            <Elders />
          </Grid.Row>
        </Grid>
      </Segment>

      <Segment id="ContributorsSegment">
        <Grid>
          <Grid.Row>
            <h3 style={{ paddingLeft: "1rem" }}>CONTRIBUTORS</h3>
          </Grid.Row>
          <Grid.Row className="members_row">
            <Contributors />
          </Grid.Row>
        </Grid>
      </Segment>
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
