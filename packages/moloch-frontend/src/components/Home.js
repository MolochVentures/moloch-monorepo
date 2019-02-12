import React from 'react';
import { Grid, Button, Segment } from "semantic-ui-react";
import { Link } from 'react-router-dom';
import Graph from './Graph';
import moment from 'moment';

import { connect } from 'react-redux';
import { fetchMemberDetail, fetchMembersWithShares, fetchProposals, getAssetAmount } from '../action/actions';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

const GET_MEMBERS = gql`
  {
    members(where: { shares_gt: 0, isActive: true }) {
      id
    }
  }
`
const NumMembers = () => (
  <Query query={GET_MEMBERS}>
    {({ loading, error, data }) => {
      let members
      if (error) {
        members = 'NA'
        console.error(`Could not load members: ${error}`)
      } else if (loading) {
        members = '-'
      } else {
        members = data.members.length
      }
      return (
        <Link to='/members' className="link">
          <Button size='large' color='grey' className='btn_link'>{members} Members</Button>
        </Link>
      );
    }}
  </Query>
);

// TODO filter this to get current proposals?
const GET_PROPOSALS = gql`
  {
    proposals {
      id
    }
  }
`
const NumProposals = () => (
  <Query query={GET_PROPOSALS}>
    {({ loading, error, data }) => {
      let proposals
      if (error) {
        proposals = 'NA'
        console.error(`Could not load proposals: ${error}`)
      } else if (loading) {
        proposals = '-'
      } else {
        proposals = data.proposals.length
      }
      return (
        <Link to='/proposals' className="link">
          <Button size='large' color='grey' className='btn_link'>{proposals} Proposals</Button>
        </Link>
      );
    }}
  </Query>
);

class HomePage extends React.Component {
  state = {
    ethAmount: 0
  }

  componentDidMount() {
    if (localStorage.getItem('loggedUser')) {
      let loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
      this.props.fetchMemberDetail(loggedUser.address)
        .then((responseJson) => {
          if (responseJson.type === 'FETCH_MEMBER_DETAIL_SUCCESS') {
            loggedUser.shares = responseJson.items.member.shares;
            loggedUser.status = responseJson.items.member.status;
            localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
          }
        })
    }

    this.props.getAssetAmount()
      .then((responseJson) => {
        this.setState({ ethAmount: (responseJson.items) ? (responseJson.items.amount ? responseJson.items.amount : 0) : 0 })
      })
  }

  render() {
    return (
      <div id="homepage">
        <Grid columns={16} verticalAlign="middle">
          <Grid.Column mobile={16} tablet={6} computer={4} className="guild_value" >
            <Link to='/guildbank' className="text_link">
              <p className="subtext">Guild Bank Value</p>
              <p className="amount">{formatter.format(this.state.ethAmount)}</p>
            </Link>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={10} computer={8} textAlign="center" className="browse_buttons" >
            <NumMembers />
            <NumProposals />
          </Grid.Column>

          <Grid.Column computer={4} />

          <Grid.Column width={16}>
            <Segment className="blurred box">
              <Grid columns="equal" className="graph_values">
                <Grid.Column textAlign="left">
                  <p className="subtext">Total Shares</p>
                  <p className="amount">378</p>
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <p className="subtext">Total ETH</p>
                  <p className="amount">541</p>
                </Grid.Column>
                <Grid.Column textAlign="right">
                  <p className="subtext">Share Value</p>
                  <p className="amount">128 USD</p>
                </Grid.Column>
              </Grid>
              <div className="graph">
                <Graph></Graph>
              </div>
            </Segment>
          </Grid.Column>
        </Grid>

      </div>
    )
  }
}

// This function is used to convert redux global state to desired props.
function mapStateToProps(state) {
  return {};
}

// This function is used to provide callbacks to container component.
function mapDispatchToProps(dispatch) {
  return {
    fetchMemberDetail: function (id) {
      return dispatch(fetchMemberDetail(id));
    },
    fetchMembersWithShares: function () {
      return dispatch(fetchMembersWithShares());
    },
    fetchProposals: function (params) {
      return dispatch(fetchProposals(params));
    },
    getAssetAmount: function () {
      return dispatch(getAssetAmount());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);