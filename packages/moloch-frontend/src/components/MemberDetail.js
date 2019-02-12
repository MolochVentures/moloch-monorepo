import React from 'react';
import { Divider, Grid, Segment, Image, Icon, Label, Header } from 'semantic-ui-react';
import moment from 'moment';

import bull from 'assets/bull.png';

import { connect } from 'react-redux';
import { fetchMemberDetail } from '../action/actions';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

class MemberDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      member_detail: {
      }
    }
  }
  componentDidMount() {
    this.props.fetchMemberDetail(this.props.match.params.name)
      .then((responseJson) => {
        if (responseJson.type === 'FETCH_MEMBER_DETAIL_SUCCESS') {
          this.setState({member_detail: responseJson.items.member})
        }
      });
  }

  render() {
    return (
      <div id="member_detail">
        <p className="title"> {this.props.match.params.name} </p>
        <Divider />
        <Grid columns={16} >
          <Grid.Row className="details">
            <Grid.Column mobile={16} tablet={16} computer={6} className="user" >
              <Segment className="blurred box" style={{overflowY: 'auto'}}>
                <Grid columns="equal">
                  <Grid.Column>
                    <p className="subtext">Shares</p>
                    <p className="amount">{this.state.member_detail.shares ? this.state.member_detail.shares : 0}</p>
                  </Grid.Column>
                  <Grid.Column  textAlign="right">
                    <p className="subtext">Total USD Value</p>
                    <p className="amount">{formatter.format(this.state.member_detail.tribute ? this.state.member_detail.tribute : 0)}</p>
                  </Grid.Column>
                </Grid>
                <Grid>
                  <Grid.Column textAlign="center" className="avatar">
                    <Image centered src={bull} size='tiny' />
                  </Grid.Column>
                </Grid>
                <p className="subtext">Tribute</p>
                <Grid columns="equal" textAlign="center">
                  <Grid.Row>
                    {this.state.member_detail.assets ? this.state.member_detail.assets.map((token, idx) => {
                      return (
                        <Grid.Column key={idx}  mobile={16} tablet={16} computer={4} style={{marginBottom: 10}}>
                          <Segment className="pill" textAlign="center">
                            <Icon name="ethereum" />{token.amount} {(token.asset.length) > 5 ? token.asset.substring(0, 5) + '...' : token.asset}
                          </Segment>
                        </Grid.Column>
                      )
                    }) : <Grid.Column>No tribute to show.</Grid.Column>}
                  </Grid.Row>
                  {/* <Grid.Row>
                    {this.state.member_detail.assets.map((token, idx) => (
                      <Grid.Column key={idx}>
                        <Segment className="pill" textAlign="center">
                          <Icon name="ethereum" />{token.amount} {token.asset}
                        </Segment>
                      </Grid.Column>
                    ))}
                  </Grid.Row> */}
                </Grid>
                <Grid columns="equal" textAlign="center">
                  <Grid.Row style={{paddingBottom: 5}}>
                    <p className="subtext">Delegate Key</p>
                  </Grid.Row>
                  <Grid.Row>
                    <p className="amount delegate_key">{this.props.match.params.name}</p>
                  </Grid.Row>
                </Grid>
              </Segment>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={16} computer={10} className="proposals" >
              <Segment className="blurred box">
                <Grid columns="equal" textAlign="center">
                  <Grid.Row className="subtext" style={{fontSize: 20}}>
                    History
                  </Grid.Row>
                </Grid>
                <Grid columns="equal" className="history_detail">
                  <Grid.Row className="header">
                    <Grid.Column textAlign="center">
                      <p className="subtext">Proposal Title</p>
                    </Grid.Column>
                    <Grid.Column textAlign="center" >
                      <p className="subtext">Date</p>
                    </Grid.Column>
                    <Grid.Column textAlign="center" >
                      <p className="subtext">Shares Requested</p>
                    </Grid.Column>
                    <Grid.Column textAlign="center" >
                      <p className="subtext">Tribute Offered</p>
                    </Grid.Column>
                    <Grid.Column textAlign="center">
                      <p className="subtext">Vote</p>
                    </Grid.Column>
                    <Grid.Column textAlign="center" >
                      <p className="subtext">Status</p>
                    </Grid.Column>
                  </Grid.Row>
                  {this.state.member_detail.proposals && this.state.member_detail.proposals.length > 0 ?
                    this.state.member_detail.proposals.map((p, idx) => {
                      return (
                        <React.Fragment key={idx}>
                          <Grid.Row verticalAlign="middle">
                            <Grid.Column textAlign="center">
                              {p.vote === "yes" && <Label className="dot" circular color="green" empty />}
                              {p.vote === "no" && <Label className="dot" circular color="red" empty />}
                              {p.title}
                            </Grid.Column>
                            <Grid.Column textAlign="center">
                              <p className="subtext date">{moment(p.date).format('MM/MDD/YYYY')}</p>
                            </Grid.Column>
                            <Grid.Column textAlign="center">
                              <p className="subtext date">{p.shares ? p.shares : ''}</p>
                            </Grid.Column>
                            <Grid.Column textAlign="center">
                              <p className="subtext date">{formatter.format(p.tribute ? p.tribute : 0)}</p>
                            </Grid.Column>
                            <Grid.Column  textAlign="center">
                              <Header as="p"
                                color={p.vote === "yes" ? "green" : p.vote === "no" ? "red" : null}>
                                {p.vote.charAt(0).toUpperCase()}
                              </Header>
                            </Grid.Column>
                            <Grid.Column textAlign="center">
                              <p className="subtext date">{p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : ''}</p>
                            </Grid.Column>
                          </Grid.Row>
                          <Divider />
                        </React.Fragment>
                      )
                    }) : <>This member hasn't voted on any proposals yet.</>}
                </Grid>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

// This function is used to convert redux global state to desired props.
function mapStateToProps(state) {
  return {
    member_detail: state.memberDetail.items.member
  };
}

// This function is used to provide callbacks to container component.
function mapDispatchToProps(dispatch) {
  return {
    fetchMemberDetail: function (name) {
      return dispatch(fetchMemberDetail(name));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberDetail);
