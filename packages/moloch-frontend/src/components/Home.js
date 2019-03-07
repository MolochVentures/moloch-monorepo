import React from "react";
import { Grid, Button, Segment, Modal, Form } from "semantic-ui-react";
import { Link } from "react-router-dom";
import gql from "graphql-tag";
import { Query, withApollo } from "react-apollo";
import { getToken } from "../web3";
import { utils } from "ethers";
import { GET_METADATA } from "../helpers/graphQlQueries";
import { convertWeiToDollars } from "../helpers/currency";

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
    userAddress: null
  };

  async componentDidMount() {
    const token = await getToken();

    this.setState({
      token
    });
  }

  handleChange = e => this.setState({ approval: e.target.value });

  handleSubmit = () => {
    const { loggedInUser } = this.props;
    const { approval, token } = this.state;
    token.methods.approve(process.env.REACT_APP_MOLOCH_ADDRESS, approval).send({ from: loggedInUser });
  };

  render() {
    const { approval } = this.state;
    return (
      <Query query={GET_METADATA}>
        {({ loading, error, data }) => {
          if (error) {
            console.error(`Could not load page: ${error}`);
          } else if (loading) {
            return "Loading...";
          } else {
            const { guildBankValue, exchangeRate, totalShares, shareValue } = data
            return (
              <div id="homepage">
                <Grid columns={16} verticalAlign="middle">
                  <Grid.Column mobile={16} tablet={6} computer={4} className="guild_value">
                    <Link to="/guildbank" className="text_link">
                      <p className="subtext">Guild Bank Value</p>
                      <p className="amount">${convertWeiToDollars(guildBankValue, exchangeRate)}</p>
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
                          <p className="amount">
                            {shareValue}
                          </p>
                        </Grid.Column>
                      </Grid>
                    </Segment>
                  </Grid.Column>
                </Grid>
              </div>
            );
          }
        }}
      </Query>
    );
  }
}

export default withApollo(HomePage);
