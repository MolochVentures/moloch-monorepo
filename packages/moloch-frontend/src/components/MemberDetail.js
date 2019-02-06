import React from 'react';
import { Divider, Grid, Segment, Image, Icon, Label, Header } from 'semantic-ui-react';
import moment from 'moment';

import bull from 'assets/bull.png';

import { connect } from 'react-redux';
import { fetchMemberDetail } from '../action/actions';

class MemberDetail extends React.Component {

  componentDidMount() {
    this.props.fetchMemberDetail(this.props.match.params.name);
  }

  render() {
    return (
      <div id="member_detail">
        <p className="title"> {this.props.match.params.name} </p>
        <Divider />
        <Grid columns={16}>
          <Grid.Row className="details">
            <Grid.Column mobile={16} tablet={16} computer={6} className="user" >
              <Segment className="blurred box">
                <Grid columns="equal">
                  <Grid.Column>
                    <p className="subtext">Total USD Value</p>
                    <p className="amount">$ {this.props.member_detail.tribute ? this.props.member_detail.tribute : 0}</p>
                  </Grid.Column>
                  <Grid.Column textAlign="right">
                    <p className="subtext">Voting Share</p>
                    <p className="amount">{this.props.member_detail.shares ? this.props.member_detail.shares : 0}</p>
                  </Grid.Column>
                </Grid>
                <Grid>
                  <Grid.Column textAlign="center" className="avatar">
                    <Image centered src={bull} size='tiny' />
                  </Grid.Column>
                </Grid>
                <p className="subtext">Token Tribute</p>
                <Grid columns="equal">
                  <Grid.Row>
                    {this.props.member_detail.assets ? this.props.member_detail.assets.map((token, idx) => {
                      return (
                        <Grid.Column key={idx}>
                          <Segment className="pill" textAlign="center">
                            <Icon name="ethereum" />{token.amount} {(token.asset.length) > 5 ? token.asset.substring(0, 5) + '...' : token.asset}
                          </Segment>
                        </Grid.Column>
                      )
                    }) : null}
                  </Grid.Row>
                  {/* <Grid.Row>
                    {this.props.member_detail.assets.map((token, idx) => (
                      <Grid.Column key={idx}>
                        <Segment className="pill" textAlign="center">
                          <Icon name="ethereum" />{token.amount} {token.asset}
                        </Segment>
                      </Grid.Column>
                    ))}
                  </Grid.Row> */}
                </Grid>
              </Segment>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={16} computer={10} className="proposals" >
              <Segment className="blurred box">
                <Grid columns="equal">
                  <Grid.Row className="header">
                    <Grid.Column textAlign="left">
                      <p className="subtext">Proposal</p>
                    </Grid.Column>
                    <Grid.Column textAlign="center">
                      <p className="subtext">Date</p>
                    </Grid.Column>
                    <Grid.Column textAlign="right">
                      <p className="subtext">Action</p>
                    </Grid.Column>
                  </Grid.Row>
                  {this.props.member_detail.proposals && this.props.member_detail.proposals.length > 0 ?
                    this.props.member_detail.proposals.map((p, idx) => {
                      return (
                        <React.Fragment key={idx}>
                          <Grid.Row verticalAlign="middle">
                            <Grid.Column textAlign="left">
                              {p.vote === "yes" && <Label className="dot" circular color="green" empty />}
                              {p.vote === "no" && <Label className="dot" circular color="red" empty />}
                              {/* {p.status === "Submitted" && <Label className="dot" circular color="grey" empty />} */}
                              {p.title}
                            </Grid.Column>
                            <Grid.Column textAlign="center">
                              <p className="subtext date">{moment(p.date).format('MM/MDD/YYYY')}</p>
                            </Grid.Column>
                            <Grid.Column textAlign="right">
                              <Header as="p"
                                color={p.vote === "yes" ? "green" : p.vote === "no" ? "red" : null}>
                                {p.vote.charAt(0).toUpperCase() + p.vote.slice(1)}
                              </Header>
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
      dispatch(fetchMemberDetail(name));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberDetail);
