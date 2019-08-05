import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";
import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { ApolloProvider, Query } from "react-apollo";
import { utils } from "ethers";
import { ToastMessage } from "rimble-ui";

import Background from "./components/Background";
import Header from "./components/Header";
import Wrapper from "./components/Wrapper";
import Home from "./components/Home";
import ProposalList from "./components/ProposalList";
import MemberList from "./components/MemberList";
import Pool from "./components/Pool";
import ProposalSubmission from "./components/ProposalSubmission";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";
import { GET_METADATA, GET_POOL_METADATA } from "./helpers/graphQlQueries";
import { getMedianizer, getMoloch, getToken, initWeb3, getMolochPool } from "./web3";
import PoolMemberListView from "components/PoolMemberList";
import { Dimmer, Loader } from "semantic-ui-react";
import { withClientState } from "apollo-link-state";
import { ApolloLink } from "apollo-link";
import { isDependee, resolveDependee, pipeResolvers, resolveDependees } from 'graphql-resolvers'

console.log(process.env);

const cache = new InMemoryCache();

const stateLink = withClientState({
  cache,
  resolvers,
  typeDefs
});

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([stateLink, new HttpLink({
    uri: process.env.REACT_APP_GRAPH_NODE_URI
  })]),
  resolvers,
});

const initialData = {
  loggedInUser: "",
  guildBankValue: "",
  shareValue: "",
  totalShares: "",
  currentPeriod: "",
  exchangeRate: "",
  proposalQueueLength: "",
  totalPoolShares: "",
  poolValue: "",
  poolShareValue: ""
};
cache.writeData({
  data: { ...initialData, loggedInUser: window.localStorage.getItem("loggedInUser") || "" }
});
client.onResetStore(() => cache.writeData({ data: initialData }));

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    loggedInUser @client
  }
`;

// TODO: MAKE THESE WORK!
const shareValue = pipeResolvers(
  resolveDependees(['totalShares', 'guildBankValue']),
  (totalShares, guildBankValue) => {
    const ethPerShare = totalShares.toNumber() > 0 ? parseFloat(utils.formatEther(guildBankValue)) / totalShares.toNumber() : 0; // in eth
    const value = utils.parseEther(ethPerShare.toString()); // in wei
    return value
  }
)

const poolShareValue = pipeResolvers(
  resolveDependees(['totalPoolShares', 'poolValue']),
  ([totalPoolShares, poolValue]) => {
    const ethPerShare = totalPoolShares.toNumber() > 0 ? parseFloat(utils.formatEther(poolValue)) / totalPoolShares.toNumber() : 0; // in eth
    const value = utils.parseEther(ethPerShare.toString()); // in wei
    return value
  }
)

function getLocalResolvers(medianizer, moloch, molochPool, token) {
  return {
    Query: {
      guildBankValue: async () => {
        const value = (await token.balanceOf(process.env.REACT_APP_GUILD_BANK_ADDRESS)).toString();
        return value
      },
      totalShares: async () => {
        const shares = (await moloch.totalShares()).toString();
        return shares
      },
      currentPeriod: async () => {
        const period = (await moloch.getCurrentPeriod()).toString();
        return period
      },
      exchangeRate: async () => {
        const rate = (await medianizer.compute())[0];
        return utils.bigNumberify(rate).toString();
      },
      proposalQueueLength: async () => {
        const length = (await moloch.getProposalQueueLength()).toString();
        return length
      },
      totalPoolShares: async () => {
        const shares = (await molochPool.totalPoolShares()).toString()
        return shares
      },
      poolValue: async () => {
        const value = (await token.balanceOf(process.env.REACT_APP_MOLOCH_POOL_ADDRESS)).toString()
        return value
      },
    }
  };
}

class App extends React.Component {
  state = {
    restored: false,
    exchangeRate: "0",
    totalShares: "0",
    guildBankValue: "0"
  };

  async componentWillMount() {
    // await persistor.restore();
    await this.populateData(true);
    this.setState({ restored: true });
  }

  async populateData(refetch) {
    let {
      data: { loggedInUser }
    } = await client.query({
      query: IS_LOGGED_IN
    });

    // make sure logged in metamask user is the one that's saved to storage
    if (loggedInUser) {
      await initWeb3(client);
    }

    const medianizer = await getMedianizer(loggedInUser);
    const moloch = await getMoloch();
    const molochPool = await getMolochPool();
    const token = await getToken();
    // // TODO: MAKE THIS WORK
    client.addResolvers(getLocalResolvers(medianizer, moloch, molochPool, token))

    // let {
    //   data: { exchangeRate, totalShares, currentPeriod, guildBankValue, shareValue, proposalQueueLength }
    // } = await client.query({
    //   query: GET_METADATA
    // });

    // let {
    //   data: { totalPoolShares, poolValue, poolShareValue }
    // } = await client.query({
    //   query: GET_POOL_METADATA
    // });

    // if (!exchangeRate || refetch) {
    //   exchangeRate = (await medianizer.compute())[0];
    //   exchangeRate = utils.bigNumberify(exchangeRate);
    // }

    // if (!totalShares || !currentPeriod || refetch) {
    //   totalShares = await moloch.totalShares();
    //   currentPeriod = await moloch.getCurrentPeriod();
    // }

    // if (!proposalQueueLength || refetch) {
    //   proposalQueueLength = await moloch.getProposalQueueLength();
    // }

    // if (!guildBankValue || refetch) {
    //   guildBankValue = await token.balanceOf(process.env.REACT_APP_GUILD_BANK_ADDRESS);
    // }

    // if (guildBankValue && totalShares) {
    //   const ethPerShare = totalShares.toNumber() > 0 ? parseFloat(utils.formatEther(guildBankValue)) / totalShares.toNumber() : 0; // in eth
    //   shareValue = utils.parseEther(ethPerShare.toString()); // in wei
    // }

    // // POOL
    // if (!totalPoolShares || refetch) {
    //   totalPoolShares = await molochPool.totalPoolShares();
    // }

    // if (!poolValue || refetch) {
    //   poolValue = await token.balanceOf(process.env.REACT_APP_MOLOCH_POOL_ADDRESS);
    // }

    // if (poolValue && totalPoolShares) {
    //   const ethPerShare = totalPoolShares.toNumber() > 0 ? parseFloat(utils.formatEther(poolValue)) / totalPoolShares.toNumber() : 0; // in eth
    //   poolShareValue = utils.parseEther(ethPerShare.toString()); // in wei
    // }

    // const dataToWrite = {
    //   guildBankValue: guildBankValue.toString(),
    //   shareValue: shareValue.toString(),
    //   totalShares: totalShares.toString(),
    //   currentPeriod: currentPeriod.toString(),
    //   exchangeRate: exchangeRate.toString(),
    //   totalPoolShares: totalPoolShares.toString(),
    //   proposalQueueLength: proposalQueueLength.toString(),
    //   poolValue: poolValue.toString(),
    //   poolShareValue: poolShareValue.toString()
    // };

    // client.writeData({
    //   data: dataToWrite
    // });
  }

  render() {
    const { restored } = this.state;
    return restored ? (
      <ApolloProvider client={client}>
        <Router basename={process.env.PUBLIC_URL}>
          <Query query={IS_LOGGED_IN}>
            {loggedInUserData => {
              return (
                <>
                  <Background />
                  <Header loggedInUser={loggedInUserData.data.loggedInUser} client={client} populateData={this.populateData} />
                  <Wrapper>
                    <Switch>
                      <Route
                        exact
                        path="/"
                        render={props => <Home {...props} loggedInUser={loggedInUserData.data.loggedInUser} pageQueriesLoading={!restored} />}
                      />
                      <Route
                        path="/proposals"
                        render={props => <ProposalList {...props} loggedInUser={loggedInUserData.data.loggedInUser} pageQueriesLoading={!restored} />}
                      />
                      <Route
                        path="/members"
                        render={props => <MemberList {...props} loggedInUser={loggedInUserData.data.loggedInUser} pageQueriesLoading={!restored} />}
                      />
                      <Route
                        path="/proposalsubmission"
                        render={props =>
                          loggedInUserData.data.loggedInUser ? (
                            <ProposalSubmission {...props} loggedInUser={loggedInUserData.data.loggedInUser} pageQueriesLoading={!restored} />
                          ) : (
                            <Redirect to={{ pathname: "/" }} />
                          )
                        }
                      />
                      <Route
                        path="/pool"
                        component={props => <Pool {...props} loggedInUser={loggedInUserData.data.loggedInUser} pageQueriesLoading={!restored} />}
                      />
                      <Route
                        path="/pool-members"
                        render={props => (
                          <PoolMemberListView {...props} loggedInUser={loggedInUserData.data.loggedInUser} pageQueriesLoading={!restored} />
                        )}
                      />
                      <Route
                        component={props => <Home {...props} loggedInUser={loggedInUserData.data.loggedInUser} pageQueriesLoading={!restored} />}
                      />
                    </Switch>
                  </Wrapper>
                  <ToastMessage.Provider ref={node => (window.toastProvider = node)} />
                </>
              );
            }}
          </Query>
        </Router>
      </ApolloProvider>
    ) : (
      <>
        <Background />
        <Dimmer active>
          <Loader size="massive" />
        </Dimmer>
      </>
    );
  }
}

export default App;
