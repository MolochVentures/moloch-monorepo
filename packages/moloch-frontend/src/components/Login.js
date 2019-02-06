import React, { Component } from 'react';
import { Grid, Button } from "semantic-ui-react";

import { connect } from 'react-redux';
import { fetchMemberDetail, postEvents } from '../action/actions';

class Login extends Component {
    constructor(props) {
        super(props);

        this.loginWithMetamask = this.loginWithMetamask.bind(this);
        this.signWithAccessRequest = this.signWithAccessRequest.bind(this);
        this.signWithoutAccessRequest = this.signWithoutAccessRequest.bind(this);

    }

    loginWithMetamask() {
        if (window.ethereum) { // Modern DApp browsers need to enable Metamask access.
            let web3 = window.web3;
            let address = web3.eth.coinbase;
            let self = this;
            if (!address) { // First time logging in on metamask
                this.signWithAccessRequest(null);
            } else {
                // Try getting a user by their public address.
                this.props.fetchMemberDetail(address)
                    .then((responseJson) => {
                        if (responseJson.type === 'FETCH_MEMBER_DETAIL_FAILURE') {
                            if (responseJson.error && responseJson.error.statusCode === 404) { // If the user didn't exist.
                                // Create it.
                                this.props.postEvents(JSON.stringify({ id: '', name: 'User creation', payload: { address: address, nonce: 0 } }))
                                    .then((resJson) => {
                                        self.signWithAccessRequest(resJson.items.nonce, 0);
                                    })
                            }
                        } else { // If the user exists, ask for a signature.
                            localStorage.setItem("totalShares", responseJson.items.totalShares);
                            self.signWithAccessRequest(responseJson.items.member.nonce, responseJson.items.member.shares);
                        }
                    });
            }

        } else if (window.web3) { // Legacy DApp browsers don't need to enable access.
            let web3 = window.web3;
            let address = web3.eth.coinbase;
            let self = this;
            if (!address) { // First time logging in on metamask
                this.signWithAccessRequest(null);
            } else {
                // Try getting a user by their public address.
                this.props.fetchMemberDetail(address)
                    .then((responseJson) => {
                        if (responseJson.type === 'FETCH_MEMBER_DETAIL_FAILURE') {
                            if (responseJson.error && responseJson.error.statusCode === 404) { // If the user didn't exist.
                                // Create it.
                                this.props.postEvents(JSON.stringify({ name: 'User creation', payload: { address: address, nonce: 0 } }))
                                    .then((resJson) => {
                                        self.signWithAccessRequest(resJson.items.nonce, 0);
                                    })
                            }
                        } else { // If the user exists, ask for a signature.
                            self.signWithAccessRequest(responseJson.items.member.nonce, responseJson.items.member.shares);
                        }
                    });
            }
        } else { // Non-DApp browsers won't work.
            alert("Metamask needs to be installed and configured.");
        }
    }

    signWithAccessRequest(nonce, shares) {
        let web3 = window.web3;
        let ethereum = window.ethereum;
        let self = this;
        let message = "Please, sign the following one-time message to authenticate: " + nonce;

        // Request account access if needed.
        if (!localStorage.getItem('loggedUser')) {
            try {
                ethereum.enable().then(() => {
                    return new Promise((resolve, reject) =>
                        web3.personal.sign(web3.fromUtf8(message), web3.eth.coinbase, (error, signature) => {
                            if (error) {
                                alert("The message needs to be signed.");
                                return reject(error);
                            }
                            return resolve(signature);
                        }
                        )
                    ).then((signature) => {
                        web3.personal.ecRecover(message, signature, function (error, result) {
                            if (!error) {
                                localStorage.setItem("loggedUser", JSON.stringify({ shares: (shares ? shares : 0), address: result, nonce }));
                                if (nonce) {
                                    self.props.history.push('/');
                                } else {
                                    self.loginWithMetamask();
                                }
                            } else {
                                alert("Error while retrieving your public key.");
                            }
                        });
                    });
                });
            } catch (error) {
                alert("Metamask needs to be enabled.");
            };
        } else {
            let loggedUser = JSON.parse(localStorage.getItem('loggedUser'))
            loggedUser.nonce = nonce;
            localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
            self.props.history.push('/');

        }
    }

    signWithoutAccessRequest(nonce) {
        let web3 = window.web3;
        let self = this;
        let message = "Please, sign the following one-time message to authenticate: " + nonce;

        // Acccounts always exposed, so the message can be sent to be signed directly.
        return new Promise((resolve, reject) =>
            web3.personal.sign(web3.fromUtf8(message), web3.eth.coinbase, (error, signature) => {
                if (error) {
                    alert("The message needs to be signed.");
                    return reject(error);
                }
                return resolve(signature);
            }
            )
        ).then((signature) => {
            web3.personal.ecRecover(message, signature, function (error, result) {
                if (!error) {
                    localStorage.setItem("loggedUser", JSON.stringify({ address: result, nonce }));
                    self.props.history.push('/');
                } else {
                    alert("Error while retrieving your public key.");
                }
            });
        });
    }

    render() {
        return (
            <div id="login">
                <Grid columns={16} centered>
                    <Grid.Column width={16}>
                        <Button size='large' color='grey' onClick={this.loginWithMetamask}>Login</Button>
                    </Grid.Column>
                </Grid>

            </div>
        );
    }
}

// This function is used to convert redux global state to desired props.
function mapStateToProps(state) {
    return {};
}

// This function is used to provide callbacks to container component.
function mapDispatchToProps(dispatch) {
    return {
        fetchMemberDetail: function (id) {
            return dispatch(fetchMemberDetail(id));
        },
        postEvents: function (data) {
            return dispatch(postEvents(data));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
