import { useQuery } from "@apollo/react-hooks";
import { HttpLink, ApolloClient, InMemoryCache } from "apollo-boost";
import { utils } from "ethers";
import gql from "graphql-tag";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import { ToastMessage } from "rimble-ui";
import { Dimmer, Loader } from "semantic-ui-react";

import Background from "./components/Background";
import Header from "./components/Header";
import Home from "./components/Home";
import MemberList from "./components/MemberList";
import Pool from "./components/Pool";
import PoolMemberListView from "./components/PoolMemberList";
import ProposalList from "./components/ProposalList";
import ProposalSubmission from "./components/ProposalSubmission";
import Wrapper from "./components/Wrapper";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";
import { getMedianizer, getMoloch, getToken, initWeb3, getMolochPool } from "./web3";

console.log(process.env);

const cache = new InMemoryCache();

const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: process.env.REACT_APP_GRAPH_NODE_URI,
  }),
  resolvers,
  typeDefs,
  connectToDevTools: true,
});

const defaults = {
  loggedInUser: "",
  guildBankValue: "0",
  shareValue: "0",
  totalShares: "0",
  currentPeriod: "0",
  exchangeRate: "0",
  proposalQueueLength: "0",
  totalPoolShares: "0",
  poolValue: "0",
  poolShareValue: "0",
};
cache.writeData({
  data: { ...defaults, loggedInUser: window.localStorage.getItem("loggedInUser") || "" },
});
client.onResetStore(() => cache.writeData({ data: defaults }));

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    loggedInUser @client
  }
`;

function getLocalResolvers(medianizer, moloch, molochPool, token) {
  return {
    Query: {
      guildBankValue: async () => {
        const value = (await token.balanceOf(process.env.REACT_APP_GUILD_BANK_ADDRESS)).toString();
        return value;
      },
      totalShares: async () => {
        const shares = (await moloch.totalShares()).toString();
        return shares;
      },
      currentPeriod: async () => {
        const period = (await moloch.getCurrentPeriod()).toString();
        return period;
      },
      exchangeRate: async () => {
        const rate = (await medianizer.compute())[0];
        return utils.bigNumberify(rate).toString();
      },
      proposalQueueLength: async () => {
        const length = (await moloch.getProposalQueueLength()).toString();
        return length;
      },
      totalPoolShares: async () => {
        const shares = (await molochPool.totalPoolShares()).toString();
        return shares;
      },
      poolValue: async () => {
        const value = (await token.balanceOf(process.env.REACT_APP_MOLOCH_POOL_ADDRESS)).toString();
        return value;
      },
    },
  };
}

const Routes = () => {
  const { loading, error, data } = useQuery(IS_LOGGED_IN);
  if (loading) {
    return (
      <Dimmer active>
        <Loader size="massive" />
      </Dimmer>
    );
  }

  if (error) throw new Error(error);

  const { loggedInUser } = data;
  return (
    <>
      <Background />
      <Header loggedInUser={loggedInUser} client={client} />
      <Wrapper>
        <Switch>
          <Route exact path="/" render={props => <Home {...props} loggedInUser={loggedInUser} />} />
          <Route
            path="/proposals"
            render={props => <ProposalList {...props} loggedInUser={loggedInUser} />}
          />
          <Route
            path="/members"
            render={props => <MemberList {...props} loggedInUser={loggedInUser} />}
          />
          <Route
            path="/proposalsubmission"
            render={props =>
              loggedInUser ? (
                <ProposalSubmission {...props} loggedInUser={loggedInUser} />
              ) : (
                <Redirect to={{ pathname: "/" }} />
              )
            }
          />
          <Route
            path="/pool"
            component={props => <Pool {...props} loggedInUser={loggedInUser} />}
          />
          <Route
            path="/pool-members"
            render={props => <PoolMemberListView {...props} loggedInUser={loggedInUser} />}
          />
          <Route component={props => <Home {...props} loggedInUser={loggedInUser} />} />
        </Switch>
      </Wrapper>
      <ToastMessage.Provider ref={node => (window.toastProvider = node)} />
    </>
  );
};

const App = () => {
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    async function init() {
      let {
        data: { loggedInUser },
      } = await client.query({
        query: IS_LOGGED_IN,
      });

      // make sure logged in metamask user is the one that's saved to storage
      if (loggedInUser && client) {
        await initWeb3(client, loggedInUser);
      }

      const medianizer = await getMedianizer(loggedInUser);
      const moloch = await getMoloch();
      const molochPool = await getMolochPool();
      const token = await getToken();

      client.addResolvers(getLocalResolvers(medianizer, moloch, molochPool, token));
      console.log(await client.getResolvers());
      setRestored(true);
    }
    init();
  }, []);

  return restored ? (
    <ApolloProvider client={client}>
      <Router basename={process.env.PUBLIC_URL}>
        <Routes />
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
};

export default App;
