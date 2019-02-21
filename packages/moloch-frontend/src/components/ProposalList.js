import React from "react";
import { Segment, Grid, Button } from "semantic-ui-react";
import { Route, Switch, Link } from "react-router-dom";

import ProposalDetail from "./ProposalDetail";
import ProgressBar from "./ProgressBar";
import { Query, withApollo } from "react-apollo";
import gql from "graphql-tag";
import { getProposalDetailsFromOnChain, ProposalStatus } from "../helpers/proposals";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
});

const proposalData = [{
  id: 1,
  timestamp: '2019-02-21',
  proposalIndex: 0,
  delegateKey: 123456789,
  member: {
    id: 1,
    delegateKey: 987654321,
    shares: 100,
    isActive: true,
    highestIndexYesVote: 25,
    tokenTribute: 1000,
    didRagequit: false,
    votes: [{
      id: 1,
      timestamp: '2019-02-20',
      proposalIndex: 0,
      delegateKey: 23456789,
      memberAddress: 0x001,
      uintVote: 1,
      proposal: {
        id: 1,
        timestamp: '2019-02-21',
        proposalIndex: 0,
        delegateKey: 123456789,
        member: {
          id: 1,
          delegateKey: 987654321,
          shares: 100,
          isActive: true,
          highestIndexYesVote: 25,
          tokenTribute: 1000,
          didRagequit: false,
          votes: [{
            id: 1,
            timestamp: '2019-02-20',
            proposalIndex: 0,
            delegateKey: 23456789,
            memberAddress: 0x001,
            uintVote: 1,
            proposal: {},
            member: {
              id: 2,
              delegateKey: 1234,
              shares: 100,
              isActive: true,
              highestIndexYesVote: 25,
              tokenTribute: 1000,
              didRagequit: false,
              votes: [{
                id: 1,
                timestamp: '2019-02-20',
                proposalIndex: 0,
                delegateKey: 23456789,
                memberAddress: 0x001,
                uintVote: 1,
                proposal: {},
                member: {}
              }],
              submissions: [{}]
            }
          }],
          submissions: [{}]
        },
        memberAddress: 0x002,
        applicant: {
          id: 1,
          timestamp: '2019-02-01',
          proposalIndex: 1,
          delegateKey: 1111111,
          member: {
            id: 2,
            delegateKey: 2344,
            shares: 100,
            isActive: true,
            highestIndexYesVote: 25,
            tokenTribute: 1000,
            didRagequit: false,
            votes: [{
              id: 1,
              timestamp: '2019-02-20',
              proposalIndex: 0,
              delegateKey: 23456789,
              memberAddress: 0x001,
              uintVote: 1,
              proposal: {},
              member: {}
            }],
            submissions: [{}]
          },
          memberAddress: 0x003,
          applicantAddress: 1,
          tokenTribute: 2000,
          sharesRequested: 90,
          didPass: true,
          aborted: false,
          votes: [{
            id: 1,
            timestamp: '2019-02-10',
            proposalIndex: 1,
            delegateKey: 99999,
            memberAddress: 0x001,
            uintVote: 1,
            proposal: {},
            member: {}
          }],
          proposal: {}
        },
        applicantAddress: 2,
        tokenTribute: 1000,
        sharesRequested: 200,
        yesVotes: 10,
        noVotes: 20,
        processed: false,
        didPass: false,
        aborted: false,
        votes: [{
          id: 1,
          timestamp: '2019-02-10',
          proposalIndex: 1,
          delegateKey: 99999,
          memberAddress: 0x001,
          uintVote: 1,
          proposal: {},
          member: {}
        }],
        details: 'test only',
        maxTotalSharesAtYesVote: 2000,
      },
      member: {
        id: 2,
        delegateKey: 4544,
        shares: 100,
        isActive: true,
        highestIndexYesVote: 25,
        tokenTribute: 1000,
        didRagequit: false,
        votes: [{
          id: 1,
          timestamp: '2019-02-20',
          proposalIndex: 0,
          delegateKey: 23456789,
          memberAddress: 0x001,
          uintVote: 1,
          proposal: {},
          member: {}
        }],
        submissions: [{}]
      }
    }],
    submissions: [{}]
  },
  memberAddress: 0x002,
  applicant: {
    id: 1,
    timestamp: '2019-02-01',
    proposalIndex: 1,
    delegateKey: 1111111,
    member: {
      id: 2,
      delegateKey: 12323,
      shares: 100,
      isActive: true,
      highestIndexYesVote: 25,
      tokenTribute: 1000,
      didRagequit: false,
      votes: [{
        id: 1,
        timestamp: '2019-02-20',
        proposalIndex: 0,
        delegateKey: 23456789,
        memberAddress: 0x001,
        uintVote: 1,
        proposal: {},
        member: {}
      }],
      submissions: [{}]
    },
    memberAddress: 0x003,
    applicantAddress: 1,
    tokenTribute: 2000,
    sharesRequested: 90,
    didPass: true,
    aborted: false,
    votes: [{
      id: 1,
      timestamp: '2019-02-10',
      proposalIndex: 1,
      delegateKey: 99999,
      memberAddress: 0x001,
      uintVote: 1,
      proposal: {},
      member: {}
    }],
    proposal: {}
  },
  applicantAddress: 2,
  tokenTribute: 1000,
  sharesRequested: 200,
  yesVotes: 10,
  noVotes: 20,
  processed: false,
  didPass: false,
  aborted: false,
  votes: [{
    id: 1,
    timestamp: '2019-02-10',
    proposalIndex: 1,
    delegateKey: 99999,
    memberAddress: 0x001,
    uintVote: 1,
    proposal: {
      id: 1,
      timestamp: '2019-02-21',
      proposalIndex: 0,
      delegateKey: 123456789,
      member: {
        id: 1,
        delegateKey: 987654321,
        shares: 100,
        isActive: true,
        highestIndexYesVote: 25,
        tokenTribute: 1000,
        didRagequit: false,
        votes: [{
          id: 1,
          timestamp: '2019-02-20',
          proposalIndex: 0,
          delegateKey: 23456789,
          memberAddress: 0x001,
          uintVote: 1,
          proposal: {},
          member: {
            id: 2,
            delegateKey: 12334,
            shares: 100,
            isActive: true,
            highestIndexYesVote: 25,
            tokenTribute: 1000,
            didRagequit: false,
            votes: [{
              id: 1,
              timestamp: '2019-02-20',
              proposalIndex: 0,
              delegateKey: 23456789,
              memberAddress: 0x001,
              uintVote: 1,
              proposal: {},
              member: {}
            }],
            submissions: [{}]
          }
        }],
        submissions: [{}]
      },
      memberAddress: 0x002,
      applicant: {
        id: 1,
        timestamp: '2019-02-01',
        proposalIndex: 1,
        delegateKey: 1111111,
        member: {
          id: 2,
          delegateKey: 3434,
          shares: 100,
          isActive: true,
          highestIndexYesVote: 25,
          tokenTribute: 1000,
          didRagequit: false,
          votes: [{
            id: 1,
            timestamp: '2019-02-20',
            proposalIndex: 0,
            delegateKey: 23456789,
            memberAddress: 0x001,
            uintVote: 1,
            proposal: {},
            member: {}
          }],
          submissions: [{}]
        },
        memberAddress: 0x003,
        applicantAddress: 1,
        tokenTribute: 2000,
        sharesRequested: 90,
        didPass: true,
        aborted: false,
        votes: [{
          id: 1,
          timestamp: '2019-02-10',
          proposalIndex: 1,
          delegateKey: 99999,
          memberAddress: 0x001,
          uintVote: 1,
          proposal: {},
          member: {}
        }],
        proposal: {}
      },
      applicantAddress: 2,
      tokenTribute: 1000,
      sharesRequested: 200,
      yesVotes: 10,
      noVotes: 20,
      processed: false,
      didPass: false,
      aborted: false,
      votes: [{
        id: 1,
        timestamp: '2019-02-10',
        proposalIndex: 1,
        delegateKey: 99999,
        memberAddress: 0x001,
        uintVote: 1,
        proposal: {},
        member: {}
      }],
      details: 'test only',
      maxTotalSharesAtYesVote: 2000,
    },
    member: {
      id: 1,
      delegateKey: 987654321,
      shares: 100,
      isActive: true,
      highestIndexYesVote: 25,
      tokenTribute: 1000,
      didRagequit: false,
      votes: [{
        id: 1,
        timestamp: '2019-02-20',
        proposalIndex: 0,
        delegateKey: 23456789,
        memberAddress: 0x001,
        uintVote: 1,
        proposal: {
          id: 1,
          timestamp: '2019-02-21',
          proposalIndex: 0,
          delegateKey: 123456789,
          member: {
            id: 1,
            delegateKey: 987654321,
            shares: 100,
            isActive: true,
            highestIndexYesVote: 25,
            tokenTribute: 1000,
            didRagequit: false,
            votes: [{
              id: 1,
              timestamp: '2019-02-20',
              proposalIndex: 0,
              delegateKey: 23456789,
              memberAddress: 0x001,
              uintVote: 1,
              proposal: {},
              member: {
                id: 2,
                delegateKey: 1234,
                shares: 100,
                isActive: true,
                highestIndexYesVote: 25,
                tokenTribute: 1000,
                didRagequit: false,
                votes: [{
                  id: 1,
                  timestamp: '2019-02-20',
                  proposalIndex: 0,
                  delegateKey: 23456789,
                  memberAddress: 0x001,
                  uintVote: 1,
                  proposal: {},
                  member: {}
                }],
                submissions: [{}]
              }
            }],
            submissions: [{}]
          },
          memberAddress: 0x002,
          applicant: {
            id: 1,
            timestamp: '2019-02-01',
            proposalIndex: 1,
            delegateKey: 1111111,
            member: {
              id: 2,
              delegateKey: 2344,
              shares: 100,
              isActive: true,
              highestIndexYesVote: 25,
              tokenTribute: 1000,
              didRagequit: false,
              votes: [{
                id: 1,
                timestamp: '2019-02-20',
                proposalIndex: 0,
                delegateKey: 23456789,
                memberAddress: 0x001,
                uintVote: 1,
                proposal: {},
                member: {}
              }],
              submissions: [{}]
            },
            memberAddress: 0x003,
            applicantAddress: 1,
            tokenTribute: 2000,
            sharesRequested: 90,
            didPass: true,
            aborted: false,
            votes: [{
              id: 1,
              timestamp: '2019-02-10',
              proposalIndex: 1,
              delegateKey: 99999,
              memberAddress: 0x001,
              uintVote: 1,
              proposal: {},
              member: {}
            }],
            proposal: {}
          },
          applicantAddress: 2,
          tokenTribute: 1000,
          sharesRequested: 200,
          yesVotes: 10,
          noVotes: 20,
          processed: false,
          didPass: false,
          aborted: false,
          votes: [{
            id: 1,
            timestamp: '2019-02-10',
            proposalIndex: 1,
            delegateKey: 99999,
            memberAddress: 0x001,
            uintVote: 1,
            proposal: {},
            member: {}
          }],
          details: 'test only',
          maxTotalSharesAtYesVote: 2000,
        },
        member: {
          id: 2,
          delegateKey: 4544,
          shares: 100,
          isActive: true,
          highestIndexYesVote: 25,
          tokenTribute: 1000,
          didRagequit: false,
          votes: [{
            id: 1,
            timestamp: '2019-02-20',
            proposalIndex: 0,
            delegateKey: 23456789,
            memberAddress: 0x001,
            uintVote: 1,
            proposal: {},
            member: {}
          }],
          submissions: [{}]
        }
      }],
      submissions: [{}]}
  }],
  details: 'test only',
  maxTotalSharesAtYesVote: 2000,
}]

const ProposalCard = ({ proposal }) => {
  let id = proposal.id;
  return (
    <Grid.Column mobile={16} tablet={8} computer={5}>
      <Link to={{ pathname: `/proposals/${id}` }} className="uncolored">
        <Segment className="blurred box">
          <p className="name">{proposal.id ? proposal.id : "N/A"}</p>
          <p className="subtext description">{proposal.details ? proposal.details : "N/A"}</p>
          <Grid columns="equal" className="value_shares">
            <Grid.Row>
              <Grid.Column textAlign="center">
                <p className="subtext">Shares</p>
                <p className="amount">{proposal.sharesRequested}</p>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <p className="subtext">Total USD Value</p>
                <p className="amount">{formatter.format(proposal.tokenTribute)}</p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Grid columns="equal" className="deadlines">
            <Grid.Row>
              <Grid.Column textAlign="center">
                <Segment className="voting pill" textAlign="center">
                  {proposal.votingEnded ? (
                    <span className="subtext">Voting Ended</span>
                  ) : (
                      <>
                      <span className="subtext">Voting Ends: </span>
                      <span>
                        {/* {proposal.votingEnds ? proposal.votingEnds : "-"} period$ */}
                        {proposal.votingEnds} day
                        {proposal.votingEnds === 1 ? null : "s"}
                      </span>
                      </>
                    )}
                </Segment>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <Segment className="grace pill" textAlign="center">
                  {proposal.graceEnded ? (
                    <span className="subtext">Grace Ended</span>
                  ) : (
                      <>
                      <span className="subtext">Grace Period Ends: </span>
                      <span>
                        {/* {proposal.gracePeriod ? proposal.gracePeriod : "-"} period$ */}
                        {proposal.gracePeriod} day
                        {proposal.gracePeriod === 1 ? null : "s"}
                      </span>
                      </>
                    )}
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <ProgressBar yes={parseInt(proposal.yesVotes)} no={parseInt(proposal.noVotes)} barSize="small" />
        </Segment>
      </Link>
    </Grid.Column>
  );
};

const GET_PROPOSAL_LIST = gql`
  {
    proposals(orderBy: proposalIndex, orderDirection: desc) {
      id
      timestamp
      tokenTribute
      sharesRequested
      processed
      didPass
      aborted
      yesVotes
      noVotes
      proposalIndex
    }
  }
`;
class ProposalList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      proposals: [],
      loading: true
    };

    this.fetchData(props);
  }

  async fetchData(props) {
    const { client } = props;
    this.setState({
      loading: true
    });
    const result = await client.query({
      query: GET_PROPOSAL_LIST
    });
    console.log('result', result)
    try {
      await this.determineProposalStatuses(result.data.proposals);
    } catch (e) {
      console.error(e)
    } finally {
      this.setState({
        loading: false
      });
    }
  }

  determineProposalStatuses = async proposals => {
    if (proposals.length === 0) {
      return;
    }

    const fullProps = [];
    for (const proposal of proposals) {
      const fullProp = await getProposalDetailsFromOnChain(proposal);
      fullProps.push(fullProp);
    }

    this.setState({
      proposals: fullProps
    });
    console.log('PROPOSALS:', this.state.proposals)
    return;
  };

  render() {
    const { isActive } = this.props;
    const { proposals } = this.state;
    const votingPeriod = proposalData;
    // let gracePeriod = [{ "address": "0xcc18ceaeebaa398759edd1828ad7414d31df7c1c", "nonce": 761117, "title": "Member B", "description": "Test 2", "sharesRequested": 2, "tribute": 115.289636344, "yesVotes": 20, "noVotes": 10, "assets": [{ "asset": "ETH", "symbol": "ETH", "amount": "1", "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png/%22%7D],/%22name/%22:/%220xcc18ceaeebaa398759edd1828ad7414d31df7c1c/%22,/%22proposals/%22:[%7B/%22id/%22:/%220xcc18ceaeebaa398759edd1828ad7414d31df7c1c/%22,/%22title/%22:/%22Member B", "vote": "owner", "date": "2019-02-08T00:00:00.000Z" }, { "id": "496399e5-8d2c-f9dc-f67c-33c4eb7e78bc", "title": "Project A", "vote": "owner", "date": "2019-02-11T00:00:00.000Z" }, { "id": "4ff6851b-d145-1d0d-2ec6-ed546bbd0c24", "title": "Project B", "date": "2019-02-11T00:00:00.000Z", "shares": 0, "tribute": 120.940450457, "vote": "owner", "status": "pending" }], "period": "dc96ba99-abb0-ed22-1779-107e13c128bc", "status": "inqueue", "voters": [{ "member": "0xc7e4214148387adc9b3ec63e956df206292a4f8a", "vote": "yes", "shares": 10 }], "votingEnds": 10, "gracePeriod": 10 }]
    const gracePeriod = proposals.filter(p => p.status === ProposalStatus.GracePeriod);
    // const votingPeriod = proposals.filter(p => p.status === ProposalStatus.VotingPeriod);
    const inQueue = proposals.filter(p => p.status === ProposalStatus.InQueue);
    const completed = proposals.filter(
      p => p.status === ProposalStatus.Aborted || p.status === ProposalStatus.Passed || p.status === ProposalStatus.Failed
    );
    return (
      <div id="proposal_list">
        <React.Fragment>
          <Grid columns={16} verticalAlign="middle">
            <Grid.Column mobile={16} tablet={8} computer={4} textAlign="right" floated="right" className="submit_button">
              <Link to={isActive ? "/membershipproposalsubmission" : "/proposals"} className="link">
                <Button size="large" color="red" disabled={!isActive}>
                  New Proposal
                </Button>
              </Link>
            </Grid.Column>
          </Grid>
          {this.state.loading ? (
            <>Loading proposals...</>
          ) : (
              <>
              {/* Grace Period */}
              {gracePeriod.length > 0 ?
                <Grid columns={16} verticalAlign="middle">
                  <Grid.Column mobile={16} tablet={8} computer={8} textAlign="left">
                    <p className="subtext">
                      {gracePeriod.length} Proposal{gracePeriod.length > 1 || gracePeriod.length === 0 ? "s" : ""}
                    </p>
                    <p className="title">In Grace Period</p>
                  </Grid.Column>
                </Grid> : null}
              <Grid columns={3}>
                {gracePeriod.map((p, index) => (
                  <ProposalCard proposal={p} key={index} />
                ))}
              </Grid>
              {/* Voting Period */}
              {votingPeriod.length > 0 ?
                <Grid columns={16} verticalAlign="middle">
                  <Grid.Column mobile={16} tablet={8} computer={8} textAlign="left">
                    <p className="subtext">
                      {votingPeriod.length} Proposal{votingPeriod.length > 1 || votingPeriod.length === 0 ? "s" : ""}
                    </p>
                    <p className="title">In Voting Period</p>
                  </Grid.Column>
                </Grid> : null}
              <Grid columns={3}>
                {votingPeriod.map((p, index) => (
                  <ProposalCard proposal={p} key={index} />
                ))}
              </Grid>
              {/* In Queue */}
              {inQueue.length > 0 ?
                <Grid columns={16} verticalAlign="middle">
                  <Grid.Column mobile={16} tablet={8} computer={8} textAlign="left">
                    <p className="subtext">
                      {inQueue.length} Proposal{inQueue.length > 1 || inQueue.length === 0 ? "s" : ""}
                    </p>
                    <p className="title">In Queue</p>
                  </Grid.Column>
                </Grid> : null}
              <Grid columns={3}>
                {inQueue.map((p, index) => (
                  <ProposalCard proposal={p} key={index} />
                ))}
              </Grid>
              {/* Completed */}
              {completed.length > 0 ?
                <Grid columns={16} verticalAlign="middle">
                  <Grid.Column mobile={16} tablet={8} computer={8} textAlign="left">
                    <p className="subtext">
                      {completed.length} Proposal{completed.length > 1 || completed.length === 0 ? "s" : ""}
                    </p>
                    <p className="title">Completed</p>
                  </Grid.Column>
                </Grid> : null}
              <Grid columns={3}>
                {completed.map((p, index) => (
                  <ProposalCard proposal={p} key={index} />
                ))}
              </Grid>
              </>
            )}
        </React.Fragment>
      </div>
    );
  }
}
const ProposalListHOC = withApollo(ProposalList);

const GET_LOGGED_IN_USER = gql`
  query User($address: String!) {
    member(id: $address) {
      id
      shares
      isActive
    }
  }
`;
const ProposalListView = () => {
  let loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  return (
    <Query query={GET_LOGGED_IN_USER} variables={{ address: loggedUser.address }}>
      {({ loading, error, data }) => {
        if (loading) return "Loading...";
        if (error) throw new Error(`Error!: ${error}`);
        return (
          <Switch>
            <Route exact path="/proposals" render={() => <ProposalListHOC isActive={data.member ? data.member.isActive : false} />} />
            <Route path="/proposals/:id" component={ProposalDetail} />
          </Switch>
        );
      }}
    </Query>
  );
};

export default ProposalListView;
