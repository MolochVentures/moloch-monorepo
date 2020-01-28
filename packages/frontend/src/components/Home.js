import React from "react";
import { Grid, Statistic, Loader, Segment,} from "semantic-ui-react";
import { useQuery } from "react-apollo";
import { utils } from "ethers";
import { convertWeiToDollars, getShareValue } from "../helpers/currency";
import gql from "graphql-tag";

const GET_METADATA = gql`
  {
    exchangeRate @client
    totalShares @client
    guildBankValue @client
  }
`;

const Home = () => {
  const { loading, error, data } = useQuery(GET_METADATA);
  if (loading) return <Loader size="massive" active />;
  if (error) throw new Error(error);
  const { guildBankValue, exchangeRate, totalShares, } = data;

  const shareValue = getShareValue(totalShares, guildBankValue);
  console.log("metadata: ", data);

  return (
    <div id="homepage">
      <Grid container textAlign="center">
      <Segment id="homeSegment">
        <Grid container doubling stackable columns="equal" padded>
          <Grid.Column>
            <Grid.Row className="guild_value" textAlign="center">
                <Statistic>
                  <h1 id="mainHeader">GUILD BANK BALANCE</h1>
                  <Statistic.Value id="bankBalance">
                    {convertWeiToDollars(guildBankValue, exchangeRate)} USD
                  </Statistic.Value>
                  <h2 id="ethExchange">{parseFloat(utils.formatEther(guildBankValue)).toFixed(3)} DAI</h2>
                </Statistic>
            </Grid.Row>
          </Grid.Column>
        </Grid>
        </Segment>
      
      <Segment id="homeSegment2">
        <Grid container doubling stackable columns={2}>
          <Grid.Column textAlign="center">
            <Statistic>
              <Statistic.Value id="subValue">
                {totalShares}
              </Statistic.Value>
              <h4 id="subText">TOTAL SHARES</h4>
            </Statistic>
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Statistic>
              <Statistic.Value id="subValue">
                {convertWeiToDollars(shareValue, exchangeRate)}
              </Statistic.Value>
              <h4 id="subText">SHARE VALUE</h4>
            </Statistic>
          </Grid.Column>
        </Grid>
      </Segment>
    </Grid>
    </div>
  );
};

export default Home;
