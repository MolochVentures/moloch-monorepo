import React, { Component } from "react";
import { Grid, Button } from "semantic-ui-react";

import { initMetmask, initGnosisSafe } from "../web3";
import gql from "graphql-tag";
import { ApolloConsumer } from "react-apollo";

let coinbase

const GET_CURRENT_USER = gql`
  query Member($id: String!) {
    member(id: $id) {
      id
      shares
      isActive
    }
  }
`;
export default class Login extends Component {
  constructor(props) {
    super(props);

    this.loginWithMetamask = this.loginWithMetamask.bind(this);
    this.loginWithGnosisSafe = this.loginWithGnosisSafe.bind(this);
    this.doLogin = this.doLogin.bind(this)
    this.signWithAccessRequest = this.signWithAccessRequest.bind(this);
  }

  async loginWithMetamask(client) {
    const web3 = await initMetmask()
    await this.doLogin(client, web3)
  }

  async loginWithGnosisSafe(client) {
    const web3 = initGnosisSafe()
    await this.doLogin(client, web3)
  }

  async doLogin(client, web3) {
    coinbase = (await web3.eth.getAccounts())[0];

    if (!coinbase) {
      // First time logging in on metamask
      await this.signWithAccessRequest(null);
    } else {
      // Try getting a user by their public address.
      const { data } = await client.query({
        query: GET_CURRENT_USER,
        variables: { id: coinbase }
      });
      
      if (!data.member) {
        // If the user didn't exist.
        await this.signWithAccessRequest(web3, 99, 0);
      } else {
        // If the user exists, ask for a signature.
        localStorage.setItem("totalShares", data.member.totalShares);
        await this.signWithAccessRequest(web3, 99, data.member.totalShares, data.member.isActive);
      }
    }
  }

  async signWithAccessRequest(web3, nonce, shares, isActive) {
    let message = "Please, sign the following one-time message to authenticate: " + nonce;
    // Request account access if needed.
    if (!localStorage.getItem("loggedUser")) {
      try {
        const signature = await web3.eth.personal.sign(web3.utils.utf8ToHex(message), coinbase, "")
        const result = await web3.eth.personal.ecRecover(web3.utils.utf8ToHex(message), signature)
        localStorage.setItem(
          "loggedUser",
          JSON.stringify({ isActive, shares: shares ? shares : 0, address: result, nonce })
        );
        if (nonce) {
          this.props.history.push("/");
        } else {
          this.doLogin();
        }
      } catch (e) {
        alert("Error while retrieving your public key.");
      }
    } else {
      let loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
      loggedUser.nonce = nonce;
      localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
      this.props.history.push("/");
    }
  }

  render() {
    return (
      <ApolloConsumer>
        {client => (
          <div id="login">
            <Grid columns={16} centered>
              <Grid.Column width={16}>
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
              </Grid.Column>
            </Grid>
          </div>
        )}
      </ApolloConsumer>
    );
  }
}