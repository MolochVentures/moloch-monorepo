import React, { Component } from "react";
import { Grid, Button } from "semantic-ui-react";

import { initMetmask, initGnosisSafe } from "../web3";
import { ApolloConsumer } from "react-apollo";

let coinbase;

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.loginWithMetamask = this.loginWithMetamask.bind(this);
    this.loginWithGnosisSafe = this.loginWithGnosisSafe.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.signWithAccessRequest = this.signWithAccessRequest.bind(this);
  }

  // bypass auth for now
  async loginWithMetamask(client) {
    const web3 = await initMetmask();
    await this.doLoginBypassAuth(client, web3);
  }

  async loginWithGnosisSafe(client) {
    const web3 = initGnosisSafe();
    await this.doLoginBypassAuth(client, web3);
  }

  async doLoginBypassAuth(client, web3) {
    coinbase = (await web3.listAccounts())[0];

    if (!coinbase) {
      alert("Could not retrieve address from Gnosis Safe/MetaMask, is it configured and this domain whitelisted?");
    } else {
      // Try getting a user by their public address.
      client.writeData({
        data: {
          loggedInUser: coinbase.toLowerCase()
        }
      });
      this.props.history.push("/");
    }
  }

  render() {
    return (
      <ApolloConsumer>
        {client => (
          <div id="login">
            <Grid columns={1} centered>
              <Grid.Row>
                <Button size="large" color="grey" onClick={() => this.loginWithMetamask(client)}>
                  Connect With Web3
                </Button>
              </Grid.Row>
              <Grid.Row>
                <Button size="large" color="grey" onClick={() => this.loginWithGnosisSafe(client)}>
                  Connect With Web3 (Gnosis Safe)
                </Button>
              </Grid.Row>
            </Grid>
          </div>
        )}
      </ApolloConsumer>
    );
  }
}
