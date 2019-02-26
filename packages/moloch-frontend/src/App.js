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
import NotFound from "./components/NotFound";
import { store } from "./store";
import { ApolloProvider, Query } from "react-apollo";
import gql from "graphql-tag";
import { defaults, resolvers } from "./resolvers";
import { typeDefs } from "./schema";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import { withClientState } from "apollo-link-state";
import { CachePersistor } from "apollo-cache-persist";

console.log(process.env);

const cache = new InMemoryCache();

const stateLink = withClientState({
  cache,
  defaults,
  resolvers,
  typeDefs
});

const persistor = new CachePersistor({
  cache,
  storage: window.localStorage,
  maxSize: false,
  debug: true
});

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPH_NODE_URI
});

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    stateLink,
    httpLink
  ])
});

const Provider = require("react-redux").Provider;

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    loggedInUser @client
  }
`;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      restored: false
    };
  }

  async componentDidMount() {
    await persistor.restore();
    this.setState({ restored: true });
  }

  render() {
    return this.state.restored ? (
      <Provider store={store}>
        <ApolloProvider client={client}>
          <Router>
            <Query query={IS_LOGGED_IN}>
              {({ data }) => {
                console.log("data: ", data.loggedInUser);
                return (
                  <>
                    <Background />
                    <Header />
                    <Wrapper>
                      <Switch>
                        <Route
                          exact
                          path="/"
                          render={props =>
                            data.loggedInUser ? <Home {...props} loggedInUser={data.loggedInUser} /> : <Redirect to={{ pathname: "/login" }} />
                          }
                        />
                        <Route
                          path="/proposals"
                          render={props =>
                            data.loggedInUser ? (
                              <ProposalList {...props} loggedInUser={data.loggedInUser} />
                            ) : (
                              <Redirect to={{ pathname: "/login" }} />
                            )
                          }
                        />
                        <Route
                          path="/members"
                          render={props =>
                            data.loggedInUser ? <MemberList {...props} loggedInUser={data.loggedInUser} /> : <Redirect to={{ pathname: "/login" }} />
                          }
                        />
                        <Route
                          path="/proposalsubmission"
                          render={props =>
                            data.loggedInUser ? (
                              <ProposalSubmission {...props} loggedInUser={data.loggedInUser} />
                            ) : (
                              <Redirect to={{ pathname: "/login" }} />
                            )
                          }
                        />
                        <Route
                          path="/guildbank"
                          render={props => (data.loggedInUser ? <GuildBank {...props} /> : <Redirect to={{ pathname: "/login" }} />)}
                        />
                        <Route path="/login" component={Login} />
                        <Route component={NotFound} />
                      </Switch>
                    </Wrapper>
                  </>
                );
              }}
            </Query>
          </Router>
        </ApolloProvider>
      </Provider>
    ) : (
      <div>Loading!!!</div>
    );
  }
}

export default App;
