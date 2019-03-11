import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

import Background from "./components/Background";
import Header from "./components/Header";
import Wrapper from "./components/Wrapper";
import Home from "./components/Home";
import ProposalList from "./components/ProposalList";
import MemberList from "./components/MemberList";
import ProposalSubmission from "./components/ProposalSubmission";
import GuildBank from "./components/GuildBank";
import Login from "./components/Login";
import { ApolloProvider, Query } from "react-apollo";
import gql from "graphql-tag";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { GET_METADATA } from "./helpers/graphQlQueries";
import { getMedianizer, getMoloch, getToken } from "./web3";
import { utils } from "ethers";
import { adopt } from 'react-adopt'

console.log(process.env);

const cache = new InMemoryCache();

const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: process.env.REACT_APP_GRAPH_NODE_URI
  }),
  resolvers,
  typeDefs
});

cache.writeData({
  data: {
    loggedInUser: window.localStorage.getItem("loggedInUser") || "",
    guildBankValue: "",
    shareValue: "",
    totalShares: "",
    currentPeriod: "",
    exchangeRate: ""
  }
})

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    loggedInUser @client
  }
`;

const Composed = adopt({
  loggedInUserData: ({ render }) => <Query query={IS_LOGGED_IN}>{ render }</Query>,
  metadata: ({ render }) => <Query query={GET_METADATA}>{ render }</Query>,
})

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      restored: false,
      exchangeRate: "0",
      totalShares: "0",
      guildBankValue: "0",
    };
  }

  async componentDidMount() {
    // await persistor.restore();
    await this.populateData(true)
    this.setState({ restored: true });
  }

  async populateData(refetch) {
    let { data: { loggedInUser } } = await client.query({
      query: IS_LOGGED_IN
    });

    if (!loggedInUser) {
      console.log(`User not logged in, cannot fetch`)
      return
    }

    let { data: { exchangeRate, totalShares, currentPeriod, guildBankValue, shareValue } } = await client.query({
      query: GET_METADATA
    });

    if (!exchangeRate || refetch) {
      const medianizer = await getMedianizer();
      exchangeRate = (await medianizer.compute())[0];
      exchangeRate = utils.bigNumberify(exchangeRate)
    }

    if (!totalShares || !currentPeriod || refetch) {
      const moloch = await getMoloch();
      totalShares = await moloch.totalShares();
      currentPeriod = await moloch.getCurrentPeriod();
    }

    const token = await getToken();
    if (!guildBankValue || refetch) {
      guildBankValue = await token.balanceOf(process.env.REACT_APP_GUILD_BANK_ADDRESS);
    }

    if (guildBankValue && totalShares) {
      const ethPerShare = guildBankValue.gt(0) ? totalShares.toNumber() / parseFloat(utils.formatEther(guildBankValue)) : 0 // in eth
      shareValue = utils.parseEther(ethPerShare.toString()) // in wei
    }

    const dataToWrite = {
      guildBankValue: guildBankValue.toString(),
      shareValue: shareValue.toString(),
      totalShares: totalShares.toString(),
      currentPeriod: currentPeriod.toString(),
      exchangeRate: exchangeRate.toString()
    }
    console.log('dataToWrite: ', dataToWrite);

    client.writeData({
      data: dataToWrite
    });
  }

  render() {
    return this.state.restored ? (
      <ApolloProvider client={client}>
        <Router>
          <Composed>
            {({ loggedInUserData, metadata }) => {
              return (
                <>
                  <Background />
                  <Header loggedInUser={loggedInUserData.data.loggedInUser} />
                  <Wrapper>
                    <Switch>
                      <Route
                        exact
                        path="/"
                        render={props =>
                          loggedInUserData.data.loggedInUser ? <Home {...props} loggedInUser={loggedInUserData.data.loggedInUser} /> : <Redirect to={{ pathname: "/login" }} />
                        }
                      />
                      <Route
                        path="/proposals"
                        render={props =>
                          loggedInUserData.data.loggedInUser ? <ProposalList {...props} loggedInUser={loggedInUserData.data.loggedInUser} /> : <Redirect to={{ pathname: "/login" }} />
                        }
                      />
                      <Route
                        path="/members"
                        render={props =>
                          loggedInUserData.data.loggedInUser ? <MemberList {...props} loggedInUser={loggedInUserData.data.loggedInUser} /> : <Redirect to={{ pathname: "/login" }} />
                        }
                      />
                      <Route
                        path="/proposalsubmission"
                        render={props =>
                          loggedInUserData.data.loggedInUser ? (
                            <ProposalSubmission {...props} loggedInUser={loggedInUserData.data.loggedInUser} />
                          ) : (
                            <Redirect to={{ pathname: "/login" }} />
                          )
                        }
                      />
                      <Route
                        path="/guildbank"
                        render={props =>
                          loggedInUserData.data.loggedInUser ? <GuildBank {...props} loggedInUser={loggedInUserData.data.loggedInUser} /> : <Redirect to={{ pathname: "/login" }} />
                        }
                      />
                      <Route path="/login" render={props => <Login {...props} loginComplete={() => this.populateData(true)} />} />
                      <Route render={props =>
                          loggedInUserData.data.loggedInUser ? <Home {...props} loggedInUser={loggedInUserData.data.loggedInUser} /> : <Redirect to={{ pathname: "/login" }} />
                        }
                      />
                    </Switch>
                  </Wrapper>
                </>
              );
            }}
          </Composed>
        </Router>
      </ApolloProvider>
    ) : (
      <div>Loading!!!</div>
    );
  }
}

export default App;
