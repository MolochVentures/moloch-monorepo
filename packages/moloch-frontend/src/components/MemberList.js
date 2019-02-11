import React from 'react';
import { Grid, Image, Divider } from 'semantic-ui-react';
import { Switch, Route, Link } from 'react-router-dom';

import MemberDetail from './MemberDetail';
import bull from 'assets/bull.png';
import hood from 'assets/hood.png';

import { connect } from 'react-redux';
import { fetchMembers, fetchConfigFounders, fetchMemberDetail } from '../action/actions';

const MemberAvatar = ({ address, shares }) => (
  <Grid.Column mobile={5} tablet={3} computer={3} textAlign="center" className="member_avatar" title={address}  >
    <Link to={`/members/${address}`} className="uncolored">
      <Image src={hood} centered size='tiny' />
      <p className="name">{!address ? '' : (address.length > 10 ? address.substring(0, 10) + '...' : address)}</p>
      <p className="subtext">{shares} shares</p>
    </Link>
  </Grid.Column>
);

const MemberList = (props) => {
  return (
    <div id="member_list">
      <Grid columns={16} verticalAlign="middle">
        <Grid.Column mobile={16} tablet={6} computer={6} textAlign="left" className="member_list_header">
          <p className="subtext">{props.totalMembers} Members</p>
          <p className="title">Ranking</p>
        </Grid.Column>

        {/* <Grid.Column mobile={16} tablet={10} computer={10} textAlign="right" className="submit_button">
          <Link to='/membershipproposalsubmission' className="link">
            <Button size='large' color='red' disabled={(props.user.status === 'founder') ? true : false}>Membership Proposal</Button>
          </Link>
        </Grid.Column> */}
      </Grid>

      {props.user.status === 'founder' || props.user.status === 'active' ?
        <Grid>
          <Grid.Column textAlign="center">
            <Link to={`/members/${props.user.address}`} className="uncolored">
              <Image centered src={bull} size='tiny' />
              <p className="name">{!props.user.address ? '' : (props.user.address.length > 10 ? props.user.address.substring(0, 10) + '...' : props.user.address)}</p>
              <p className="subtext">{props.user.shares} shares</p>
            </Link>
          </Grid.Column>
        </Grid> : null
      }
      <Grid className="member_item">
        <Grid.Row>
          <p style={{ paddingLeft: '1rem' }}>Elders (100+ shares)</p>
        </Grid.Row>
        <Divider />
        <Grid.Row className="members_row" centered>
          {props.elders.length > 0 ?
            props.elders.map((elder, idx) => <MemberAvatar {...elder} key={idx} />) : <>No elders to show.</>}
        </Grid.Row>
      </Grid>
      <Grid className="member_item">
        <Grid.Row>
          <p style={{ paddingLeft: '1rem' }}>Contributors</p>
        </Grid.Row>
        <Divider />
        <Grid.Row className="members_row" centered>
          {props.members.length > 0 ?
            props.members.map((contributor, idx) => <MemberAvatar {...contributor} key={idx} />) : <>No contributors to show.</>}
        </Grid.Row>
      </Grid>
    </div>
  )
};

class MemberListView extends React.Component {
  constructor(props) {
    let loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
    super(props);
    this.state = {
      totalMembers: 0,
      user: {
        name: loggedUser.address,
        shares: 0,
        status: ''
      }
    }
  }
  componentDidMount() {
    let loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
    this.props.fetchMembers()
      .then((responseJson) => {
        this.setState({ totalMembers: this.state.totalMembers + responseJson.items.length })
      });
    this.props.fetchConfigFounders()
      .then((responseJson) => {
        this.setState({ totalMembers: this.state.totalMembers + responseJson.items.length })
      });

    this.props.fetchMemberDetail(loggedUser.address)
      .then((responseJson) => {
        if (responseJson.type === 'FETCH_MEMBER_DETAIL_SUCCESS') {
          let user = this.state.user;
          user.shares = responseJson.items.member.shares;
          user.status = responseJson.items.member.status;
          this.setState({ user: user });
        }
      })
  }
  render() {
    return (
      <Switch>

        <Route exact path="/members" render={(props) => <MemberList members={this.props.members} elders={this.props.elders} totalMembers={this.state.totalMembers} user={this.state.user} />} />
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
      return dispatch(fetchMemberDetail(id))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberListView);
