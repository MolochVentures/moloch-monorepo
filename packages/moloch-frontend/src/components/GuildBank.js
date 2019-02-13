import React from 'react';
import { Grid, Image, Divider, Button } from 'semantic-ui-react';

import xIcon from 'assets/0xIcon.png';
import aragonIcon from 'assets/aragonIcon.png';
import bitcoinIcon from 'assets/bitcoinIcon.png';
import district0xIcon from 'assets/district0xIcon.png';
import ethereumIcon from 'assets/ethereumIcon.png';
import funfairIcon from 'assets/funfairIcon.png';
import makerIcon from 'assets/makerIcon.png';
import spankchainIcon from 'assets/spankchainIcon.png';
import stellarIcon from 'assets/stellarIcon.png';
import stormIcon from 'assets/stormIcon.png';

import { connect } from 'react-redux';
import { fetchMemberDetail, postEvents, getAssetInfo } from '../action/actions';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

const CurrencyElement = ({ symbol, amount, logo, price }) => (
  <Grid.Column mobile={5} tablet={3} computer={3} textAlign="center" className="currency_element" >
    <div style={{ backgroundColor: 'transparent' }}>
      <div style={{ backgroundColor: 'white', width: 50, height: 50, margin: '0 auto', borderRadius: '50%' }}>
        <Image src={logo} centered size='tiny' circular />
      </div>
    </div>
    <p className="name">{symbol}</p>
    <p className="shares">{amount}</p>
    <p className="subtext">{formatter.format(price)}</p>
  </Grid.Column>
);


class GuildBank extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isActive: false,
      loggedUser: ''
    };
    this.redeemToken = this.redeemToken.bind(this);
  }

  componentDidMount() {
    let user = JSON.parse(localStorage.getItem('loggedUser'));
    this.setState({ loggedUser: user.address });
    this.props.fetchMemberDetail(user.address)
      .then((responseJson) => {
        if (responseJson.type === 'FETCH_MEMBER_DETAIL_SUCCESS') {
          if (responseJson.items.member.status && responseJson.items.member.shares && responseJson.items.member.shares > 0) {
            switch (responseJson.items.member.status) {
              case 'passed':
                this.setState({ isActive: true });
                break;
              default:
                break;
            }
          }
        }
      });
    this.props.getAssetInfo();
  }

  redeemToken() {
    let postData = JSON.stringify({
      'id': '',
      'name': 'Redeem loot token',
      'payload': {
        address: this.state.loggedUser
      }
    });
    this.props.postEvents(postData)
      .then((responseJson) => {
        let message = '';
        switch (responseJson.type) {
          case 'POST_EVENTS_SUCCESS':
            message = 'You have successfully redeem the token.';
            this.setState({ isActive: false });
            break;
          case 'POST_EVENTS_FAILURE':
            message = responseJson.error.message;
            break;
          default:
            message = 'Please try again later.'
            break;
        }
        alert(message);
      });
  }

  render() {
    return (
      <div id="guild_bank">
        <Grid>
          <Grid.Column textAlign="center" className="guild_value">
            <p className="subtext">Guild Bank Value</p>
            <p className="amount">$53,640,918</p>
            <Button size='large' color='grey' disabled={this.state.isActive ? false : true} onClick={this.redeemToken}>Redeem Loot Token</Button>
          </Grid.Column>
        </Grid>

        <Grid>
          <Grid.Row>
          </Grid.Row>
          <Divider />
          <Grid.Row centered>
            {this.props.assetInfo.map((elder, idx) => <CurrencyElement {...elder} key={idx} />)}
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

// This function is used to convert redux global state to desired props.
function mapStateToProps(state) {
  return {
    assetInfo: state.assetInfo.items
  };
}

// This function is used to provide callbacks to container component.
function mapDispatchToProps(dispatch) {
  return {
    fetchMemberDetail: function (id) {
      return dispatch(fetchMemberDetail(id));
    },
    postEvents: function (data) {
      return dispatch(postEvents(data));
    },
    getAssetInfo: function () {
      return dispatch(getAssetInfo())
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GuildBank);
