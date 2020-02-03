import { useQuery } from "@apollo/react-hooks";
import { HttpLink, ApolloClient, InMemoryCache } from "apollo-boost";
import gql from "graphql-tag";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import { ToastMessage } from "rimble-ui";
import { Dimmer, Loader, Grid } from "semantic-ui-react";

import Background from "./components/Background";
import Header from "./components/Header";
import Home from "./components/Home";
import MemberList from "./components/MemberList";
import FundingSubmission from "./components/FundingSubmission";
import ProposalList from "./components/ProposalList";
import ProposalSubmission from "./components/ProposalSubmission";
import Wrapper from "./components/Wrapper";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";
import { initWeb3 } from "./web3";

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

cache.writeData({
  data: { loggedInUser: window.localStorage.getItem("loggedInUser") || "" },
});
client.onResetStore(() => cache.writeData({ data: { loggedInUser: "" } }));

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    loggedInUser @client
  }
`;

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
      <Grid container>
        <Grid.Row>
          <Header loggedInUser={loggedInUser} client={client} />
        </Grid.Row>
        <Grid.Row>
          <Wrapper>
            <Switch>
              <Route
                exact
                path="/"
                render={props => <Home {...props} loggedInUser={loggedInUser} />}
              />
              <Route
                path="/proposals"
                render={props => <ProposalList {...props} loggedInUser={loggedInUser} />}
              />
              <Route
                path="/members"
                render={props => <MemberList {...props} loggedInUser={loggedInUser} />}
              />
              <Route
                path="/proposal-submission"
                render={props =>
                  loggedInUser ? (
                    <ProposalSubmission {...props} loggedInUser={loggedInUser} />
                  ) : (
                      <Redirect to={{ pathname: "/" }} />
                    )
                }
              />
              <Route
                path="/funding-submission"
                render={props =>
                  loggedInUser ? (
                    <FundingSubmission {...props} loggedInUser={loggedInUser} />
                  ) : (
                      <Redirect to={{ pathname: "/" }} />
                    )
                }
              />
              <Route component={props => <Home {...props} loggedInUser={loggedInUser} />} />
            </Switch>
          </Wrapper>
        </Grid.Row>
      </Grid>
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
