import React from "react";
import { Grid, Button, Segment, Statistic } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Query } from "react-apollo";
import { utils } from "ethers";
import { GET_POOL_METADATA } from "../helpers/graphQlQueries";
import { convertWeiToDollars } from "../helpers/currency";
import { adopt } from "react-adopt";

const Composed = adopt({
  metadata: ({ render }) => <Query query={GET_POOL_METADATA}>{render}</Query>
});

const NumMembers = () => (
  <Link to="/pool-members" className="link">
    <Button color="grey" size="small">
      Members
    </Button>
  </Link>
);

const Donate = () => (
  <Link to="/pool-donate" className="link">
    <Button color="grey" size="small">
      Donate
    </Button>
  </Link>
);

const Sync = () => (
  <Button compact color="grey" size="small">
    Sync
  </Button>
);

export default function Pool() {
  return (
    <Composed>
      {({ metadata }) => {
        if (metadata.loading) return <Segment className="blurred box">Loading...</Segment>;

        if (metadata.error) throw new Error(`Error!: ${metadata.error}`);
        const { totalPoolShares, poolValue, poolShareValue, exchangeRate } = metadata.data;
        return (
          <div id="homepage">
            <Grid container verticalAlign="middle" textAlign="center">
              <Grid container doubling stackable columns={2} verticalAlign="bottom">
                <Grid.Column>
                  <Statistic inverted>
                    <Statistic.Label>Moloch Pool Value</Statistic.Label>
                    <Statistic.Value>{convertWeiToDollars(poolValue, exchangeRate)}</Statistic.Value>
                  </Statistic>
                </Grid.Column>
                <Grid.Column>
                  <Grid container stackable columns={3}>
                    <Grid.Column>
                      <NumMembers />
                    </Grid.Column>
                    <Grid.Column>
                      <Donate />
                    </Grid.Column>
                    <Grid.Column>
                      <Sync />
                    </Grid.Column>
                  </Grid>
                </Grid.Column>
              </Grid>

              <Grid container stackable columns={3} className="blurred box">
                <Grid.Column textAlign="center">
                  <Statistic inverted label="Total Pool Shares" value={totalPoolShares} />
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <Statistic inverted label="Total Pool ETH" value={parseFloat(utils.formatEther(poolValue)).toFixed(2)} />
                </Grid.Column>
                <Grid.Column textAlign="center">
                  <Statistic inverted label="Pool Share Value" value={convertWeiToDollars(poolShareValue, exchangeRate)} />
                </Grid.Column>
              </Grid>
            </Grid>
          </div>
        );
      }}
    </Composed>
  );
}
