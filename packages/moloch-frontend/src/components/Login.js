import React, { Component } from "react";
import { Grid, Button } from "semantic-ui-react";

import { connect } from "react-redux";
import { fetchMemberDetail, postEvents } from "../action/actions";

// import Web3 from "web3";
import SafeProvider from "safe-web3-provider";

// let web3
// let coinbase

// class Login extends Component {
//   constructor(props) {
//     super(props);

//     this.loginWithMetamask = this.loginWithMetamask.bind(this);
//     this.loginWithGnosisSafe = this.loginWithGnosisSafe.bind(this);
//     this.doLogin = this.doLogin.bind(this)
//     this.signWithAccessRequest = this.signWithAccessRequest.bind(this);
//   }

//   async loginWithMetamask() {
//     if (!window.ethereum && !window.web3) {
//       // Non-DApp browsers won't work.
//       alert("Metamask needs to be installed and configured.");
//     }
//     if (window.ethereum) {
//       // Modern DApp browsers need to enable Metamask access.
//       try {
//         await window.ethereum.enable()
//       } catch (error) {
//         alert("Metamask needs to be enabled.")
//       }
//     }
//     web3 = new Web3(Web3.givenProvider)
//     await this.doLogin()
//   }

//   async loginWithGnosisSafe() {
//     console.log("Logging in with Gnosis Safe.");

//     /**
//      *  Create Safe Provider
//      */
//     const provider = new SafeProvider({
//       // TODO: CHANGE THIS TO INFURA/ALCHEMY
//       rpcUrl: "http://localhost:8545"
//     });

import { initMetmask, initGnosisSafe } from "../web3";
import gql from "graphql-tag";
import { ApolloConsumer } from "react-apollo";

let coinbase;

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
    this.doLogin = this.doLogin.bind(this);
    this.signWithAccessRequest = this.signWithAccessRequest.bind(this);
  }

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
      await this.signWithAccessRequest(null);
    } else {
      // Try getting a user by their public address.
      const { data } = await client.query({
        query: GET_CURRENT_USER,
        variables: { id: coinbase }
      });
      console.log('data:', data);
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

  async doLoginBypassAuth(client, web3) {
    coinbase = (await web3.eth.getAccounts())[0];

    if (!coinbase) {
      alert("Could not retrieve address from Gnosis Safe/MetaMask, is it configured and this domain whitelisted?");
    } else {
      // Try getting a user by their public address.
      const { data } = await client.query({
        query: GET_CURRENT_USER,
        variables: { id: coinbase }
      });
      console.log(data.member);

      localStorage.setItem("totalShares", data.member ? data.member.totalShares : 0);
      localStorage.setItem(
        "loggedUser",
        JSON.stringify({
          isActive: data.member ? data.member.isActive : false,
          shares: data.member ? data.member.totalShares : 0,
          address: coinbase.toLowerCase(),
          nonce: 99
        })
      );
      this.props.history.push("/");
    }
  }

  async signWithAccessRequest(web3, nonce, shares, isActive) {
    let message = "Please, sign the following one-time message to authenticate: " + nonce;
    let self = this;
    // Request account access if needed.
    if (!localStorage.getItem("loggedUser")) {
      try {
        const signature = await web3.eth.personal.sign(web3.utils.utf8ToHex(message), coinbase, "");
        const result = await web3.eth.personal.ecRecover(web3.utils.utf8ToHex(message), signature);
        localStorage.setItem("loggedUser", JSON.stringify({ isActive, shares: shares ? shares : 0, address: result, nonce }));
        if (nonce) {
          this.props.history.push("/");
        } else {
          let loggedUser = JSON.parse(localStorage.getItem('loggedUser'))
          loggedUser.nonce = nonce;
          localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
          self.props.history.push('/');

        }
      } catch (e) {
        console.log('error:', e);
      }
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
                  <Grid.Column width={16} >
                    <Button size="large" className="login-btn" color="grey" onClick={() => this.loginWithMetamask(client)}>
                      Login With Metamask
                  </Button>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={16}>
                    <Button size="large" className="login-btn" color="grey"  onClick={() => this.loginWithGnosisSafe(client)}>
                      Login With Gnosis Safe
                  </Button>
                  </Grid.Column>
                </Grid.Row>
              </Grid.Column>
            </Grid>
          </div>
        )}
      </ApolloConsumer>
    );
  }
}
