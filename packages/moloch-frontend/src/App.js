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
import ApolloClient from "apollo-boost";

console.log(process.env);

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPH_NODE_URI,
  clientState: {
    defaults,
    resolvers,
    typeDefs
  }
});

client.writeData({
  data: {
    loggedInUser: localStorage.getItem('loggedInUser')
  },
});

const Provider = require("react-redux").Provider;

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    loggedInUser @client
  }
`;
const App = () => (
  <Router>
    <Provider store={store}>
      <ApolloProvider client={client}>
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
                      render={props => (data.loggedInUser ? <Home {...props} /> : <Redirect to={{ pathname: "/login" }} />)}
                    />
                    <Route
                      path="/proposals"
                      render={props => (data.loggedInUser ? <ProposalList {...props} /> : <Redirect to={{ pathname: "/login" }} />)}
                    />
                    <Route
                      path="/members"
                      render={props => (data.loggedInUser ? <MemberList {...props} /> : <Redirect to={{ pathname: "/login" }} />)}
                    />
                    <Route
                      path="/proposalsubmission"
                      render={props =>
                        data.loggedInUser ? <ProposalSubmission {...props} /> : <Redirect to={{ pathname: "/login" }} />
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
      </ApolloProvider>
    </Provider>
  </Router>
);

export default App;
