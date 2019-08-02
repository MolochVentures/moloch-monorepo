import React from "react";
import { Grid, Button, Segment, Statistic } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Query } from "react-apollo";
import { utils } from "ethers";
import { GET_METADATA, GET_MEMBERS, GET_PROPOSALS } from "../helpers/graphQlQueries";
import { convertWeiToDollars } from "../helpers/currency";
import { adopt } from "react-adopt";

const Composed = adopt({
  members: ({ render }) => <Query query={GET_MEMBERS}>{render}</Query>,
  proposals: ({ render }) => <Query query={GET_PROPOSALS}>{render}</Query>,
  metadata: ({ render }) => <Query query={GET_METADATA}>{render}</Query>
});

const NumMembers = ({ members, loading }) => (
  <Link to="/members" className="link">
    <Button color="grey" size="mini">
      {loading ? "..." : members.length} Members
    </Button>
  </Link>
);

const NumProposals = ({ proposals, loading }) => (
  <Link to="/proposals" className="link">
    <Button color="grey" size="mini">
      {loading ? "..." : proposals.length} Proposals
    </Button>
  </Link>
);

const MolochPool = () => (
  <Link to="/pool" className="link">
    <Button compact color="grey" size="mini">
      Moloch Pool
    </Button>
  </Link>
);

export default function HomePage() {
  return (
    <Composed>
      {({ members, proposals, metadata }) => {
        if (metadata.loading) return <Segment className="blurred box">Loading...</Segment>;

        let membersLoading = false;
        if (members.loading) {
          membersLoading = true;
        }

        let proposalsLoading = false;
        if (proposals.loading) {
          proposalsLoading = true;
        }

        if (members.error) throw new Error(`Error!: ${members.error}`);
        if (proposals.error) throw new Error(`Error!: ${proposals.error}`);
        if (metadata.error) throw new Error(`Error!: ${metadata.error}`);
        const { guildBankValue, exchangeRate, totalShares, shareValue } = metadata.data;
        return (
          <div id="homepage">
            <Grid container verticalAlign="middle" textAlign="center">
              <Grid container doubling stackable columns={2} verticalAlign="bottom">
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
                      <Statistic.Value>{convertWeiToDollars(guildBankValue, exchangeRate)}</Statistic.Value>
                    </Statistic>
                  </Grid.Row>
                </Grid.Column>
                <Grid.Column>
                  <Grid container stackable columns={3}>
                    <Grid.Column>
                      <NumMembers members={members.data.members} loading={membersLoading} />
                    </Grid.Column>
                    <Grid.Column>
                      <NumProposals proposals={proposals.data.proposals} loading={proposalsLoading} />
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
