import React, { Component } from "react";
import { Grid, Button } from "semantic-ui-react";

import { initMetmask, initGnosisSafe } from "../web3";
import { ApolloConsumer } from "react-apollo";

let coinbase;

export default class Login extends Component {
  // bypass auth for now
  loginWithMetamask = async client => {
    const web3 = await initMetmask();
    if (!web3) {
      return
    }
    await this.doLoginBypassAuth(client, web3);
  };

  loginWithGnosisSafe = async client => {
    const web3 = initGnosisSafe();
    await this.doLoginBypassAuth(client, web3);
  };

  doLoginBypassAuth = async (client, web3) => {
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
      this.props.loginComplete()
      this.props.history.push("/");
    }
  };

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
