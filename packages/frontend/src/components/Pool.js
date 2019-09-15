import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Button,
  Statistic,
  Loader,
  Popup,
  Modal,
  Header,
  Icon,
  Input,
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import { useQuery } from "react-apollo";
import { utils } from "ethers";
import { convertWeiToDollars, getShareValue } from "../helpers/currency";
import gql from "graphql-tag";
import { getMolochPool } from "web3";
import { monitorTx } from "helpers/transaction";
import { getToken } from "web3";
import { formatEther, parseEther } from "ethers/utils";
import { EtherSymbol } from "ethers/constants";

const NumMembers = ({ disabled }) => (
  <Link to="/pool-members" className="link">
    <Button color="grey" size="medium" fluid disabled={disabled}>
      Members
    </Button>
  </Link>
);

const Donate = ({ token, molochPool, loggedInUser, disabled }) => {
  const [donation, setDonation] = useState("");
  const [myWeth, setMyWeth] = useState();

  useEffect(() => {
    async function fetchMyWeth() {
      if (token && typeof token.balanceOf === "function" && loggedInUser) {
        const weth = await token.balanceOf(loggedInUser);
        setMyWeth(parseFloat(formatEther(weth)).toFixed(2));
      }
    }
    fetchMyWeth();
  }, [token, loggedInUser]);

  const donate = useCallback(() => {
    console.log("Calling molochPool.deposit with ", parseEther(donation));
    monitorTx(molochPool.deposit(parseEther(donation)));
  }, [donation, molochPool]);

  return (
    <Modal
      trigger={
        <Button color="grey" size="medium" fluid disabled={disabled}>
          Donate
        </Button>
      }
      basic
      size="small"
      closeIcon
    >
      <Header content="Donate to the Moloch Pool" />
      <Modal.Content>
        <p>Thank you for your donation! Use the wETH Center to wrap and approve.</p>
        <Input
          inverted
          labelPosition="right"
          label={`${myWeth}w${EtherSymbol}`}
          placeholder="wETH to Donate"
          onChange={event => setDonation(event.target.value)}
          value={donation}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button color="green" inverted onClick={donate}>
          <Icon name="checkmark" /> Donate
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

const Sync = ({ molochPool, lastProcessedProposalIndex, currentPoolIndex, loggedInUser, disabled }) => {
  const synced = currentPoolIndex >= lastProcessedProposalIndex;
  return (
    <Popup
      inverted
      content={
        synced
          ? `Fully synced to current proposal ${lastProcessedProposalIndex}`
          : `Currently synced to ${currentPoolIndex}`
      }
      trigger={
        <Button
          compact
          color="grey"
          size="medium"
          fluid
          onClick={() => {
            monitorTx(molochPool.sync(lastProcessedProposalIndex));
          }}
          disabled={synced || !loggedInUser || disabled}
        >
          Sync
        </Button>
      }
    />
  );
};

const GET_POOL_METADATA = gql`
  {
    totalPoolShares @client
    poolValue @client
    exchangeRate @client
    proposals(first: 1, where: { processed: true }, orderBy: proposalIndex, orderDirection: desc) {
      proposalIndex
    }
    poolMetas {
      currentPoolIndex
      totalPoolShares
    }
  }
`;

export default function Pool({ loggedInUser }) {
  const [molochPool, setMolochPool] = useState({});
  const [token, setToken] = useState({});

  useEffect(() => {
    async function fetchData() {
      const pool = await getMolochPool(loggedInUser);
      const t = await getToken(loggedInUser);
      setMolochPool(pool);
      setToken(t);
    }
    fetchData();
  }, [loggedInUser, token]);

  const { loading, error, data } = useQuery(GET_POOL_METADATA);

  if (loading) return <Loader size="massive" active />;
  if (error) throw new Error(error);

  const {
    poolValue,
    exchangeRate,
    proposals: [lastProcessedProposal],
    poolMetas,
  } = data;

  let poolMeta = {
    currentPoolIndex: 0,
    totalPoolShares: 0
  }

  let disablePool = true;
  if (poolMetas.length > 0) {
    poolMeta = poolMetas[0];
    disablePool = false;
  }

  const { currentPoolIndex, totalPoolShares } = poolMeta;

  const poolShareValue = getShareValue(totalPoolShares, poolValue);

  return (
    <div id="homepage">
      <Grid container verticalAlign="middle" textAlign="center">
        <Grid container doubling stackable columns="equal" verticalAlign="bottom">
          <Grid.Column>
            <Statistic inverted>
              <Statistic.Label>Moloch Pool Value</Statistic.Label>
              <Statistic.Value>{convertWeiToDollars(poolValue, exchangeRate)}</Statistic.Value>
            </Statistic>
          </Grid.Column>
          <Grid.Column width={9}>
            <Grid container stackable columns={3}>
              <Grid.Column>
                <NumMembers disabled={disablePool} />
              </Grid.Column>
              <Grid.Column>
                <Donate
                  token={token}
                  molochPool={molochPool}
                  loggedInUser={loggedInUser}
                  disabled={!loggedInUser || disablePool}
                />
              </Grid.Column>
              <Grid.Column>
                <Sync
                  lastProcessedProposalIndex={lastProcessedProposal ? lastProcessedProposal.proposalIndex : 0}
                  currentPoolIndex={currentPoolIndex}
                  molochPool={molochPool}
                  loggedInUser={loggedInUser}
                  disabled={disablePool}
                />
              </Grid.Column>
            </Grid>
          </Grid.Column>
        </Grid>

        <Grid container stackable columns={3} className="blurred box">
          <Grid.Column textAlign="center">
            <Statistic inverted label="Total Pool Shares" value={totalPoolShares} />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Statistic
              inverted
              label="Total Pool ETH"
              value={parseFloat(utils.formatEther(poolValue)).toFixed(2)}
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Statistic
              inverted
              label="Pool Share Value"
              value={convertWeiToDollars(poolShareValue, exchangeRate)}
            />
          </Grid.Column>
        </Grid>
      </Grid>
    </div>
  );
}
