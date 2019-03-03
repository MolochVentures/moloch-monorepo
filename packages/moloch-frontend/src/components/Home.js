import React from "react";
import { Grid, Button, Segment, Modal, Form } from "semantic-ui-react";
import { Link } from "react-router-dom";
import gql from "graphql-tag";
import { Query, withApollo } from "react-apollo";
import { getToken, getMedianizer, getWeb3, getMoloch } from "../web3";
import { GET_EXCHANGE_RATE, GET_TOTAL_SHARES, GET_GUILD_BANK_VALUE } from "../helpers/graphQlQueries";
import { utils } from "ethers";

const GET_MEMBERS = gql`
  {
    members(where: { shares_gt: 0, isActive: true }) {
      id
    }
  }
`;
const NumMembers = () => (
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
        <Link to="/members" className="link">
          <Button size="large" color="grey" className="btn_link">
            {members} Members
          </Button>
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
`;
const NumProposals = () => (
  <Query query={GET_PROPOSALS}>
    {({ loading, error, data }) => {
      let proposals;
      if (error) {
        proposals = "NA";
        console.error(`Could not load proposals: ${error}`);
      } else if (loading) {
        proposals = "-";
      } else {
        proposals = data.proposals.length;
      }
      return (
        <Link to="/proposals" className="link">
          <Button size="large" color="grey" className="btn_link">
            {proposals} Proposals
          </Button>
        </Link>
      );
    }}
  </Query>
);

class HomePage extends React.Component {
  state = {
    approval: "",
    token: null,
    userAddress: null,
    exchangeRate: 0,
    totalShares: "0",
    guildBankValue: "0"
  };

  async componentDidMount() {
    const { client } = this.props;
    const token = await getToken();

    let { data: exchangeRateData } = await client.query({
      query: GET_EXCHANGE_RATE
    });
    let rate = exchangeRateData.exchangeRate;
    if (!rate) {
      const medianizer = await getMedianizer();
      rate = (await medianizer.compute())[0];
      client.writeData({
        data: {
          exchangeRate: rate
        }
      });
    }

    let { data: sharesData } = await client.query({
      query: GET_TOTAL_SHARES
    });
    let shares = sharesData.totalShares;
    if (!shares) {
      const moloch = await getMoloch();
      shares = await moloch.totalShares();
      console.log("shares: ", shares.toString());
      client.writeData({
        data: {
          totalShares: shares.toString()
        }
      });
    }

    const eth = getWeb3();
    let { data: guildBankData } = await client.query({
      query: GET_GUILD_BANK_VALUE
    });
    let guildBankValue = guildBankData.guildBankValue;
    if (!guildBankValue) {
      guildBankValue = await eth.getBalance(process.env.REACT_APP_GUILD_BANK_ADDRESS);
      client.writeData({
        data: {
          guildBankValue: guildBankValue.toString()
        }
      });
    }

    this.setState({
      eth,
      token,
      exchangeRate: rate,
      totalShares: shares.toString(),
      guildBankValue: guildBankValue.toString()
    });
  }

  handleChange = e => this.setState({ approval: e.target.value });

  handleSubmit = () => {
    const { loggedInUser } = this.props;
    const { approval, token } = this.state;
    token.methods.approve(process.env.REACT_APP_MOLOCH_ADDRESS, approval).send({ from: loggedInUser });
  };

  render() {
    const { approval, exchangeRate, totalShares, guildBankValue, eth } = this.state;
    return (
      <div id="homepage">
        <Grid columns={16} verticalAlign="middle">
          <Grid.Column mobile={16} tablet={6} computer={4} className="guild_value">
            <Link to="/guildbank" className="text_link">
              <p className="subtext">Guild Bank Value</p>
              <p className="amount">${parseFloat(utils.formatEther(utils.bigNumberify(guildBankValue).mul(exchangeRate))).toFixed(2)}</p>
            </Link>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={10} computer={8} textAlign="center" className="browse_buttons">
            <NumMembers />
            <NumProposals />
          </Grid.Column>
          <Grid.Column mobile={16} tablet={6} computer={4} className="guild_value">
            <Modal
              basic
              size="small"
              trigger={
                <Button size="large" color="grey" className="browse_buttons">
                  Approve wETH
                </Button>
              }
            >
              <Modal.Header>Approve wETH</Modal.Header>
              <Modal.Content>
                <Form onSubmit={this.handleSubmit}>
                  <Form.Field>
                    <label>Amount to Approve</label>
                    <input placeholder="Amount in Wei" name="amount" value={approval} onChange={this.handleChange} className="asset_amount" />
                  </Form.Field>
                  <Button type="submit" color="grey" className="btn_link">
                    Submit
                  </Button>
                </Form>
              </Modal.Content>
            </Modal>
          </Grid.Column>

          <Grid.Column width={16}>
            <Segment className="blurred box">
              <Grid columns="equal" className="graph_values">
                <Grid.Column textAlign="left">
                  <p className="subtext">Total Shares</p>
                  <p className="amount">{totalShares}</p>
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <p className="subtext">Total ETH</p>
                  <p className="amount">{utils.formatEther(guildBankValue)}</p>
                </Grid.Column>
                <Grid.Column textAlign="right">
                  <p className="subtext">Share Value</p>
                  <p className="amount">{utils.bigNumberify(guildBankValue).gt(0) ? utils.bigNumberify(totalShares).div(guildBankValue) : 0}</p>
                </Grid.Column>
              </Grid>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default withApollo(HomePage);
