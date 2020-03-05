import { useQuery } from "@apollo/react-hooks";
import { HttpLink, ApolloClient, InMemoryCache } from "apollo-boost";
import gql from "graphql-tag";
import React, { useCallback } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import { ToastMessage } from "rimble-ui";
import { Dimmer, Loader, Grid } from "semantic-ui-react";

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
        </Grid.Row>
      </Grid>
      <ToastMessage.Provider ref={node => (window.toastProvider = node)} />
    </>
  );
};

const App = () => {
  return (
    <ApolloProvider client={client}>
      <Router basename={process.env.PUBLIC_URL}>
        <Routes />
      </Router>
    </ApolloProvider>
  );
};

export default App;
