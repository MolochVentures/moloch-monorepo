import React, { useState, useEffect } from "react";
import { Grid, Button, Segment, Statistic, Loader } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Query } from "react-apollo";
import { utils } from "ethers";
import { convertWeiToDollars, getShareValue } from "../helpers/currency";
import gql from "graphql-tag";
import { getMolochPool } from "web3";
import { getToken } from "web3";

const NumMembers = () => (
  <Link to="/members" className="link">
    <Button color="grey" size="medium" fluid>
      Members
    </Button>
  </Link>
);

const NumProposals = () => (
  <Link to="/proposals" className="link">
    <Button color="grey" size="medium" fluid>
      Proposals
    </Button>
  </Link>
);

const MolochPool = () => (
  <Link to="/pool" className="link">
    <Button compact color="grey" size="medium" fluid>
      Pool
    </Button>
  </Link>
);

const GET_METADATA = gql`
  {
    exchangeRate @client
    totalShares @client
    guildBankValue @client
    currentPeriod @client
    proposalQueueLength @client
    poolValue @client
  }
`;

export default function HomePage({ pageQueriesLoading }) {
  return (
    <Query query={GET_METADATA}>
      {({ loading, error, data }) => {
        if (loading || pageQueriesLoading) return <Loader size="massive" active />;
        if (error) throw new Error(`Error!: ${error}`);
        const { guildBankValue, exchangeRate, totalShares, poolValue } = data;
        
        const shareValue = getShareValue(totalShares, guildBankValue)
        console.log('metadata: ', data);

        return (
          <div id="homepage">
            <Grid container verticalAlign="middle" textAlign="center">
              <Grid container doubling stackable columns="equal" verticalAlign="bottom">
                <Grid.Column>
                  <Grid.Row className="guild_value" textAlign="center">
                    <Statistic inverted>
                      <Statistic.Label>Guild Bank Value</Statistic.Label>
                      <Statistic.Value>{convertWeiToDollars(guildBankValue, exchangeRate)}</Statistic.Value>
                    </Statistic>
                  </Grid.Row>
                  <Grid.Row className="pool_value" textAlign="center">
                    <Statistic size="tiny" inverted>
                      <Statistic.Label>Moloch Pool Value</Statistic.Label>
                      <Statistic.Value>{convertWeiToDollars(poolValue, exchangeRate)}</Statistic.Value>
                    </Statistic>
                  </Grid.Row>
                </Grid.Column>
                <Grid.Column width={9}>
                  <Grid container stackable columns={3} padded textAlign="center">
                    <Grid.Column>
                      <NumMembers />
                    </Grid.Column>
                    <Grid.Column>
                      <NumProposals />
                    </Grid.Column>
                    <Grid.Column>
                      <MolochPool />
                    </Grid.Column>
                  </Grid>
                </Grid.Column>
              </Grid>

              <Grid container stackable columns={3} className="blurred box">
                <Grid.Column textAlign="center">
                  <Statistic inverted label="Total Shares" value={totalShares} />
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <Statistic inverted label="Total ETH" value={parseFloat(utils.formatEther(guildBankValue)).toFixed(2)} />
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <Statistic inverted label="Share Value" value={convertWeiToDollars(shareValue, exchangeRate)} />
                </Grid.Column>
              </Grid>
            </Grid>
          </div>
        );
      }}
    </Query>
  );
}
