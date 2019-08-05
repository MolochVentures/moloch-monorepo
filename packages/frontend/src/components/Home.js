import React from "react";
import { Grid, Button, Segment, Statistic, Loader } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Query } from "react-apollo";
import { utils } from "ethers";
import { GET_METADATA, GET_POOL_METADATA } from "../helpers/graphQlQueries";
import { convertWeiToDollars } from "../helpers/currency";
import { adopt } from "react-adopt";

const Composed = adopt({
  metadata: ({ render }) => <Query query={GET_METADATA}>{render}</Query>,
  poolMetadata: ({ render }) => <Query query={GET_POOL_METADATA}>{render}</Query>
});

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

export default function HomePage() {
  return (
    <Composed>
      {({ metadata, poolMetadata }) => {
        if (metadata.loading) return <Segment className="blurred box"><Loader size="massive" active /></Segment>;

        if (metadata.error) throw new Error(`Error!: ${metadata.error}`);
        if (poolMetadata.error) throw new Error(`Error!: ${poolMetadata.error}`);
        console.log('metadata: ', metadata);
        const { guildBankValue, exchangeRate, totalShares, shareValue } = metadata.data;
        const { poolValue } = poolMetadata.data;
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
    </Composed>
  );
}
