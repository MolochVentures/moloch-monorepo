import React, { Component } from "react";
import { Grid, Button } from "semantic-ui-react";

import { initMetmask, initGnosisSafe } from "../web3";
import gql from "graphql-tag";
import { ApolloConsumer } from "react-apollo";

let coinbase;

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    loggedInUser @client
  }
`;
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

  async doLogin(client, web3) {
    coinbase = (await web3.eth.getAccounts())[0];

    if (!coinbase) {
      // First time logging in on metamask
      alert('Web3 client not configured properly')
      return
    } else {
      await this.signWithAccessRequest(client, web3, 99);
    }
  }

  async doLoginBypassAuth(client, web3) {
    coinbase = (await web3.eth.getAccounts())[0];

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

  async signWithAccessRequest(client, web3, nonce) {
    let message = "Please, sign the following one-time message to authenticate: " + nonce;
    const { data } = await client.query({
      query: IS_LOGGED_IN,
      variables: { id: coinbase }
    });
    // Request account access if needed.
    if (!data.loggedInUser) {
      try {
        const signature = await web3.eth.personal.sign(web3.utils.utf8ToHex(message), coinbase, "");
        const result = await web3.eth.personal.ecRecover(web3.utils.utf8ToHex(message), signature);
        client.writeData({
          data: {
            loggedInUser: result.toLowerCase()
          }
        });
        if (nonce) {
          this.props.history.push("/");
        } else {
          this.doLogin();
        }
      } catch (e) {
        alert("Error while retrieving your public key.");
      }
    } else {
      client.writeData({
        data: {
          loggedInUser: data.loggedInUser
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
                  Login With Metamask
                </Button>
              </Grid.Row>
              <Grid.Row>
                <Button size="large" color="grey" onClick={() => this.loginWithGnosisSafe(client)}>
                  Login With Gnosis Safe
                </Button>
              </Grid.Row>
            </Grid>
          </div>
        )}
      </ApolloConsumer>
    );
  }
}
