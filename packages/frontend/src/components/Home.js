import React from "react";
import { Grid, Button, Statistic, Loader } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { useQuery } from "react-apollo";
import { utils } from "ethers";
import { convertWeiToDollars, getShareValue } from "../helpers/currency";
import gql from "graphql-tag";

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

// TODO: why do we need the proposal query??
const GET_METADATA = gql`
  {
    poolValue @client
    exchangeRate @client
    totalShares @client
    guildBankValue @client
  }
`;

const Home = () => {
  const { loading, error, data } = useQuery(GET_METADATA);
  if (loading) return <Loader size="massive" active />;
  if (error) throw new Error(error);
  const { guildBankValue, exchangeRate, totalShares, poolValue } = data;

  const shareValue = getShareValue(totalShares, guildBankValue);
  console.log("metadata: ", data);

  return (
    <div id="homepage">
      <Grid container verticalAlign="middle" textAlign="center">
        <Grid container doubling stackable columns="equal" verticalAlign="bottom">
          <Grid.Column>
            <Grid.Row className="guild_value" textAlign="center">
              <Statistic inverted>
                <Statistic.Label>Guild Bank Value</Statistic.Label>
                <Statistic.Value>
                  {convertWeiToDollars(guildBankValue, exchangeRate)}
                </Statistic.Value>
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
            <Grid container doubling stackable columns={3} padded textAlign="center">
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
            <Statistic
              inverted
              label="Total ETH"
              value={parseFloat(utils.formatEther(guildBankValue)).toFixed(0)}
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Statistic
              inverted
              label="Share Value"
              value={convertWeiToDollars(shareValue, exchangeRate)}
            />
          </Grid.Column>
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
