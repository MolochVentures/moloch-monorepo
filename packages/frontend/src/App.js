import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

import Background from "./components/Background";
import Header from "./components/Header";
import Wrapper from "./components/Wrapper";
import Home from "./components/Home";
import ProposalList from "./components/ProposalList";
import MemberList from "./components/MemberList";
import ProposalSubmission from "./components/ProposalSubmission";
import { ApolloProvider, Query } from "react-apollo";
import gql from "graphql-tag";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { GET_METADATA } from "./helpers/graphQlQueries";
import { getMedianizer, getMoloch, getToken, initWeb3, getMolochPool } from "./web3";
import { utils } from "ethers";
import { adopt } from "react-adopt";
import { ToastMessage } from 'rimble-ui';
import Pool from "components/Pool";

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

const initialData = {
  loggedInUser: "",
  guildBankValue: "",
  shareValue: "",
  totalShares: "",
  currentPeriod: "",
  exchangeRate: "",
  totalPoolShares: "",
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

const Composed = adopt({
  loggedInUserData: ({ render }) => <Query query={IS_LOGGED_IN}>{render}</Query>,
  metadata: ({ render }) => <Query query={GET_METADATA}>{render}</Query>
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      restored: false,
      exchangeRate: "0",
      totalShares: "0",
      guildBankValue: "0"
    };
  }

  async componentDidMount() {
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
      await initWeb3(client)
    }

    let {
      data: { exchangeRate, totalShares, currentPeriod, guildBankValue, shareValue, totalPoolShares }
    } = await client.query({
      query: GET_METADATA
    });

    if (!exchangeRate || refetch) {
      const medianizer = await getMedianizer(loggedInUser);
      exchangeRate = (await medianizer.compute())[0];
      exchangeRate = utils.bigNumberify(exchangeRate);
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
      const ethPerShare = totalShares.toNumber() > 0 ? parseFloat(utils.formatEther(guildBankValue)) / totalShares.toNumber() : 0; // in eth
      shareValue = utils.parseEther(ethPerShare.toString()); // in wei
    }

    if (!totalPoolShares || refetch) {
      const molochPool = await getMolochPool();
      totalPoolShares = await molochPool.totalPoolShares();
    }

    const dataToWrite = {
      guildBankValue: guildBankValue.toString(),
      shareValue: shareValue.toString(),
      totalShares: totalShares.toString(),
      currentPeriod: currentPeriod.toString(),
      exchangeRate: exchangeRate.toString(),
      totalPoolShares: totalPoolShares
      .toString(),
    };

    client.writeData({
      data: dataToWrite
    });
  }

  render() {
    return this.state.restored ? (
      <ApolloProvider client={client}>
        <Router basename={process.env.PUBLIC_URL}>
          <Composed>
            {({ loggedInUserData, metadata }) => {
              return (
                <>
                  <Background />
                  <Header loggedInUser={loggedInUserData.data.loggedInUser} client={client} populateData={this.populateData} />
                  <Wrapper>
                    <Switch>
                      <Route
                        exact
                        path="/"
                        render={props => <Home {...props} loggedInUser={loggedInUserData.data.loggedInUser} />}
                      />
                      <Route
                        path="/proposals"
                        render={props =><ProposalList {...props} loggedInUser={loggedInUserData.data.loggedInUser} />}
                      />
                      <Route
                        path="/members"
                        render={props => <MemberList {...props} loggedInUser={loggedInUserData.data.loggedInUser} />}
                      />
                      <Route
                        path="/proposalsubmission"
                        render={props =>
                          loggedInUserData.data.loggedInUser ? (
                            <ProposalSubmission {...props} loggedInUser={loggedInUserData.data.loggedInUser} />
                          ) : (
                            <Redirect to={{ pathname: "/" }} />
                          )
                        }
                      />
                      <Route
                        path="/pool"
                        component={props => <Pool {...props} loggedInUser={loggedInUserData.data.loggedInUser} />}
                      />
                      <Route
                        component={props => <Home {...props} loggedInUser={loggedInUserData.data.loggedInUser} />}
                      />
                    </Switch>
                  </Wrapper>
                  <ToastMessage.Provider ref={node => (window.toastProvider = node)} />
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
