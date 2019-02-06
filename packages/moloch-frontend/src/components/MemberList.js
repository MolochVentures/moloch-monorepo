import React from 'react';
import { Grid, Image, Divider, Button } from 'semantic-ui-react';
import { Switch, Route, Link } from 'react-router-dom';

import MemberDetail from './MemberDetail';
import bull from 'assets/bull.png';
import hood from 'assets/hood.png';

import { connect } from 'react-redux';
import { fetchMembers, fetchConfigFounders, fetchMemberDetail } from '../action/actions';

const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
const user = {
  "name": (loggedUser ? loggedUser.address : ''),
  "shares": (loggedUser ? loggedUser.shares : '')
};

const MemberAvatar = ({ name, shares }) => (
  <Grid.Column mobile={5} tablet={3} computer={3} textAlign="center" className="member_avatar" title={name}  >
    <Link to={`/members/${name}`} className="uncolored">
      <Image src={hood} centered size='tiny' />
      <p className="name">{!name ? '' : (name.length > 10 ? name.substring(0, 10) + '...' : name)}</p>
      <p className="subtext">{shares} shares</p>
    </Link>
  </Grid.Column>
);

const MemberList = (props) => (
  <div id="member_list">
    <Grid columns={16} verticalAlign="middle">
      <Grid.Column mobile={16} tablet={6} computer={6} textAlign="left" className="member_list_header">
        <p className="subtext">{props.totalMembers} Members</p>
        <p className="title">Ranking</p>
      </Grid.Column>

      <Grid.Column mobile={16} tablet={10} computer={10} textAlign="right" className="submit_button">
        <Link to='/membershipproposalsubmission' className="link">
          <Button size='large' color='red'>Membership Proposal</Button>
        </Link>
      </Grid.Column>
    </Grid>

    <Grid>
      <Grid.Column textAlign="center">
        <Link to={`/members/${user.name}`} className="uncolored">
          <Image centered src={bull} size='tiny' />
          <p className="name">{!user.name ? '' : (user.name.length > 10 ? user.name.substring(0, 10) + '...' : user.name)}</p>
          <p className="subtext">{user.shares} shares</p>
        </Link>
      </Grid.Column>
    </Grid>
    <Grid className="member_item">
      <Grid.Row>
        <p>Elders</p>
      </Grid.Row>
      <Divider />
      <Grid.Row className="members_row" centered>
        {props.elders.map((elder, idx) => <MemberAvatar {...elder} key={idx} />)}
      </Grid.Row>
    </Grid>
    <Grid className="member_item">
      <Grid.Row>
        <p>Contributors</p>
      </Grid.Row>
      <Divider />
      <Grid.Row className="members_row" centered>
        {props.members.map((contributor, idx) => <MemberAvatar {...contributor} key={idx} />)}
      </Grid.Row>
    </Grid>
  </div>
);

class MemberListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      totalMembers: 0
    }
  }
  componentDidMount() {
    this.props.fetchMembers()
      .then((responseJson)=>{
        this.setState({totalMembers: this.state.totalMembers+responseJson.items.length})
      });
    this.props.fetchConfigFounders()
    .then((responseJson)=>{
      this.setState({totalMembers: this.state.totalMembers+responseJson.items.length})
    });
  }
  render() {
    return (
      <Switch>

        <Route exact path="/members" render={(props) => <MemberList members={this.props.members} elders={this.props.elders} totalMembers={this.state.totalMembers} />} />
        <Route path="/members/:name" component={MemberDetail} />
      </Switch>
    )
  }
}

// This function is used to convert redux global state to desired props.
function mapStateToProps(state) {
  return {
    members: state.members.items,
    elders: state.founders.items
  };
}

// This function is used to provide callbacks to container component.
function mapDispatchToProps(dispatch) {
  return {
    fetchMembers: function () {
      return dispatch(fetchMembers());
    },
    fetchConfigFounders: function () {
      return dispatch(fetchConfigFounders());
    },
    fetchMemberDetail: function (id) {
      dispatch(fetchMemberDetail(id))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberListView);
