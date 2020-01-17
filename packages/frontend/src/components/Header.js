import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, Icon, Dropdown, Form, Button, Loader, Menu } from "semantic-ui-react";
import { withApollo, useQuery } from "react-apollo";
import { GET_MEMBER_DETAIL } from "../helpers/graphQlQueries";
import {
  getMoloch,
  initMetamask,
  initGnosisSafe,
  getToken,
  getEthSigner,
  getMolochPool,
} from "../web3";
import { utils } from "ethers";
import { monitorTx } from "../helpers/transaction";
import { formatEther } from "ethers/utils";
import gql from "graphql-tag";

export default class MenuExampleSecondary extends Component {
  state = { activeItem: 'home' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state

    return (
      <Menu secondary>
        <Menu.Item
          name='home'
          active={activeItem === 'home'}
          onClick={this.handleItemClick}
        />
        <Menu.Item
          name='messages'
          active={activeItem === 'messages'}
          onClick={this.handleItemClick}
        />
        <Menu.Item
          name='friends'
          active={activeItem === 'friends'}
          onClick={this.handleItemClick}
        />
        <Menu.Menu position='right'>
          <Menu.Item>
            <Input icon='search' placeholder='Search...' />
          </Menu.Item>
          <Menu.Item
            name='logout'
            active={activeItem === 'logout'}
            onClick={this.handleItemClick}
          />
        </Menu.Menu>
      </Menu>
    )
  }
}


const MainMenu = ({
  _handleOpenDropdown,
  onLoadApproveWeth,
  member,
  _handleCloseDropdown,
  onLoadChangeDelegateKey,
  onLoadWithdrawLootToken,
  onLoadWithdrawPoolToken,
  client,
  poolMember,
}) => (
  <div className="dropdownItems">
    <Dropdown.Item
      icon="settings"
      className="item"
      content="wETH Center"
      onClick={() => {
        _handleOpenDropdown();
        onLoadApproveWeth();
      }}
    />
    <Dropdown.Divider />
    {member && member.isActive ? (
      <>
        <Dropdown.Item className="item" onClick={() => _handleCloseDropdown()}>
          <Link to={`/members/${member.id}`} className="link">
            <p>
              <Icon name="user" />
              View Profile
            </p>
          </Link>
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          icon="key"
          className="item"
          content="Change Delegate Key"
          onClick={() => {
            _handleOpenDropdown();
            onLoadChangeDelegateKey();
          }}
        />
        <Dropdown.Divider />
        <Dropdown.Item
          icon="dollar"
          className="item"
          content="Ragequit"
          onClick={() => {
            _handleOpenDropdown();
            onLoadWithdrawLootToken();
          }}
        />
        <Dropdown.Divider />
      </>
    ) : (
      <></>
    )}
    {poolMember && poolMember.shares > 0 ? (
      <>
        <Dropdown.Item
          icon="dollar"
          className="item"
          content="Withdraw Pool Shares"
          onClick={() => {
            _handleOpenDropdown();
            onLoadWithdrawPoolToken();
          }}
        />
        <Dropdown.Divider />
      </>
    ) : (
      <></>
    )}
    <Dropdown.Item className="item">
      <Link
        to="/login"
        className="link"
        onClick={async () => {
          _handleCloseDropdown();
          window.localStorage.setItem("loggedInUser", "");
          await client.resetStore();
          window.location.reload();
        }}
      >
        <p>
          <Icon name="power off" />
          Sign Out
        </p>
      </Link>
    </Dropdown.Item>
  </div>
);
const MainMenuWrapped = withApollo(MainMenu);

const ChangeDelegateKeyMenu = ({ moloch, onLoadMain }) => {
  const [newDelegateKey, setNewDelegateKey] = useState("");
  const submitChangeDelegateKey = useCallback(() => {
    console.log(`Sending moloch.updateDelegateKey(${newDelegateKey})`);

    monitorTx(moloch.updateDelegateKey(newDelegateKey));
  }, [newDelegateKey, moloch]);

  return (
    <div>
      <Dropdown.Item
        icon="arrow left"
        className="item"
        content="Back to Menu"
        onClick={() => onLoadMain()}
      />
      <Dropdown.Divider />
      <Dropdown.Item className="item submenu">
        <p>
          <Icon name="key" />
          Change Delegate Key
        </p>
        <Form.Input
          placeholder="Enter new key address"
          onChange={event => setNewDelegateKey(event.target.value)}
          value={newDelegateKey}
        />
        <Button onClick={submitChangeDelegateKey}>Save</Button>
      </Dropdown.Item>
    </div>
  );
};

const WithdrawLootTokenMenu = ({ moloch, member, onLoadMain }) => {
  const [ragequitAmount, setRagequitAmount] = useState("");
  const submitRagequit = useCallback(() => {
    console.log(`Sending moloch.ragequit(${ragequitAmount})`);

    monitorTx(moloch.ragequit(ragequitAmount));
  }, [ragequitAmount, moloch]);

  return (
    <div>
      <Dropdown.Item
        icon="arrow left"
        className="item"
        content="Back to Menu"
        onClick={() => onLoadMain()}
      />
      <Dropdown.Divider />
      <Dropdown.Item className="item submenu">
        <p>
          <Icon name="dollar" />
          Ragequit
        </p>
        {`${member.shares} Shares Available`}
        <Form.Input
          placeholder={`Number of shares`}
          onChange={event => setRagequitAmount(event.target.value)}
          value={ragequitAmount}
        />
        <Button onClick={submitRagequit}>Withdraw</Button>
      </Dropdown.Item>
    </div>
  );
};

const WithdrawPoolTokenMenu = ({ pool, poolMember, onLoadMain }) => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const submitPoolWithdraw = useCallback(() => {
    console.log(`Sending moloch.ragequit(${withdrawAmount})`);

    monitorTx(pool.withdraw(withdrawAmount));
  }, [withdrawAmount, pool]);

  return (
    <div>
      <Dropdown.Item
        icon="arrow left"
        className="item"
        content="Back to Menu"
        onClick={() => onLoadMain()}
      />
      <Dropdown.Divider />
      <Dropdown.Item className="item submenu">
        <p>
          <Icon name="dollar" />
          Withdraw
        </p>
        {`${poolMember.shares} Shares Available`}
        <Form.Input
          placeholder={`Number of shares`}
          onChange={event => setWithdrawAmount(event.target.value)}
          value={withdrawAmount}
        />
        <Button onClick={submitPoolWithdraw}>Withdraw</Button>
      </Dropdown.Item>
    </div>
  );
};

function ApproveWethMenu({ token, eth, onLoadMain, loggedInUser }) {
  const [approval, setApproval] = useState("");
  const [wrap, setWrap] = useState("");
  const [unwrap, setUnwrap] = useState("");
  const [myWeth, setMyWeth] = useState("...");
  const [myEth, setMyEth] = useState("...");

  const approve = useCallback(() => {
    console.log(
      "Approving wETH: ",
      process.env.REACT_APP_MOLOCH_ADDRESS,
      utils.parseEther(approval).toString(),
    );
    monitorTx(token.approve(process.env.REACT_APP_MOLOCH_ADDRESS, utils.parseEther(approval)));
  }, [approval, token]);

  const approvePool = useCallback(() => {
    console.log(
      "Approving wETH: ",
      process.env.REACT_APP_MOLOCH_POOL_ADDRESS,
      utils.parseEther(approval).toString(),
    );
    monitorTx(token.approve(process.env.REACT_APP_MOLOCH_POOL_ADDRESS, utils.parseEther(approval)));
  }, [approval, token]);

  const wrapEth = useCallback(() => {
    console.log(
      "Wrapping ETH: ",
      process.env.REACT_APP_TOKEN_ADDRESS,
      utils.parseEther(wrap).toString(),
    );
    monitorTx(token.deposit({ value: utils.parseEther(wrap) }));
  }, [wrap, token]);

  const unwrapWeth = useCallback(() => {
    console.log(
      "Unwrapping wETH: ",
      process.env.REACT_APP_TOKEN_ADDRESS,
      utils.parseEther(unwrap).toString(),
    );
    monitorTx(token.withdraw(utils.parseEther(unwrap)));
  }, [unwrap, token]);

  useEffect(() => {
    async function fetchMyWeth() {
      if (loggedInUser) {
        const weth = await token.balanceOf(loggedInUser);
        setMyWeth(parseFloat(formatEther(weth)).toFixed(2));
      }
    }
    fetchMyWeth();
  }, [token, loggedInUser]);

  useEffect(() => {
    async function fetchMyEth() {
      if (loggedInUser) {
        const e = await eth.getBalance(loggedInUser);
        setMyEth(parseFloat(formatEther(e)).toFixed(2));
      }
    }
    fetchMyEth();
  }, [eth, loggedInUser]);

  return (
    <>
      <Dropdown.Item
        icon="arrow left"
        className="item"
        content="Back to Menu"
        onClick={() => onLoadMain()}
      />
      <Dropdown.Divider />
      <Dropdown.Item className="item submenu">
        <p>
          <Icon name="settings" />
          wETH Center
        </p>
        <Form.Input
          placeholder={`${myWeth} wETH available`}
          onChange={event => setApproval(event.target.value)}
          value={approval}
        />
        <Button.Group>
          <Button onClick={approve}>Approve Moloch</Button>
          <Button onClick={approvePool}>Approve Pool</Button>
        </Button.Group>
        <Form.Input
          placeholder={`${myEth} ETH available`}
          onChange={event => setWrap(event.target.value)}
          value={wrap}
        />
        <Button onClick={wrapEth}>Wrap</Button>
        <Form.Input
          placeholder={`${myWeth} wETH available`}
          onChange={event => setUnwrap(event.target.value)}
          value={unwrap}
        />
        <Button.Group>
          <Button onClick={unwrapWeth}>Unwrap</Button>
        </Button.Group>
      </Dropdown.Item>
    </>
  );
}

const GET_POOL_MEMBER = gql`
  query PoolMembers($address: String!) {
    poolMember(id: $address) {
      id
      shares
      keepers
    }
  }
`;

export default ({ loggedInUser, client }) => {
  const [visibleRightMenu, setVisibleRightMenu] = useState(false);
  const [visibleMenu, setVisibleMenu] = useState("main");
  const [moloch, setMoloch] = useState({});
  const [token, setToken] = useState({});
  const [eth, setEth] = useState({});
  const [pool, setPool] = useState({});

  useEffect(() => {
    async function init() {
      setMoloch(await getMoloch(loggedInUser));
      setToken(await getToken(loggedInUser));
      setPool(await getMolochPool(loggedInUser));
      if (loggedInUser) {
        setEth(await getEthSigner());
      }
    }
    init();
  }, [loggedInUser]);


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

  const _handleOpenDropdown = () => setVisibleRightMenu(true);

  const _handleCloseDropdown = () => setVisibleRightMenu(false);

  const logIn = async method => {
    let eth;
    if (method === "metamask") {
      eth = await initMetamask(client);
    } else if (method === "gnosis") {
      eth = await initGnosisSafe(client);
    } else {
      throw new Error("Unsupported Web3 login method");
    }
    if (!eth) {
      return;
    }

    setEth(eth);
    const molochInstance = await getMoloch(loggedInUser);
    setMoloch(molochInstance);
  };

  const getTopRightMenuContent = (member, poolMember) => {
    let topRightMenuContent;
    if (loggedInUser) {
      switch (visibleMenu) {
        case "main":
          topRightMenuContent = (
            <MainMenuWrapped
              member={member}
              poolMember={poolMember}
              _handleOpenDropdown={() => _handleOpenDropdown()}
              _handleCloseDropdown={() => _handleCloseDropdown()}
              onLoadChangeDelegateKey={() => setVisibleMenu("changeDelegateKey")}
              onLoadWithdrawLootToken={() => setVisibleMenu("withdrawLootToken")}
              onLoadWithdrawPoolToken={() => setVisibleMenu("withdrawPoolToken")}
              onLoadApproveWeth={() => setVisibleMenu("approveWeth")}
            />
          );
          break;
        case "changeDelegateKey":
          topRightMenuContent = (
            <ChangeDelegateKeyMenu
              onLoadMain={() => {
                _handleOpenDropdown();
                setVisibleMenu("main");
              }}
              moloch={moloch}
            />
          );
          break;
        case "withdrawLootToken":
          topRightMenuContent = (
            <WithdrawLootTokenMenu
              onLoadMain={() => {
                _handleOpenDropdown();
                setVisibleMenu("main");
              }}
              moloch={moloch}
              member={member}
            />
          );
          break;
        case "withdrawPoolToken":
          topRightMenuContent = (
            <WithdrawPoolTokenMenu
              onLoadMain={() => {
                _handleOpenDropdown();
                setVisibleMenu("main");
              }}
              pool={pool}
              poolMember={poolMember}
            />
          );
          break;
        case "approveWeth":
          topRightMenuContent = (
            <ApproveWethMenu
              onLoadMain={() => {
                _handleOpenDropdown();
                setVisibleMenu("main");
              }}
              token={token}
              eth={eth}
              loggedInUser={loggedInUser}
            />
          );
          break;
        default:
          break;
      }
    } else {
      topRightMenuContent = (
        <>
          <Dropdown.Item
            icon="user"
            className="item"
            content="Log In With Metamask"
            onClick={() => logIn("metamask")}
          />
          <Dropdown.Divider />
          <Dropdown.Item
            icon="user"
            className="item"
            content="Log In With Gnosis Safe"
            onClick={() => logIn("gnosis")}
          />
        </>
      );
    }
    return topRightMenuContent;
  };

  const { loading: memberLoading, error: memberError, data: memberData } = useQuery(
    GET_MEMBER_DETAIL,
    {
      variables: { address: loggedInUser },
    },
  );

  const { loading: poolLoading, error: poolError, data: poolMemberData } = useQuery(
    GET_POOL_MEMBER,
    {
      variables: { address: loggedInUser },
    },
  );

  if (memberLoading || poolLoading) return <Loader active />;
  if (memberError || poolError) throw new Error(`Error!: ${memberError} ${poolError}`);
  return (
    <div id="header">
      <Grid container columns={2} stackable verticalAlign="center">
        <Grid.Column textAlign="left" className="logo">
          <Link to="/">ROSEBUD DAO</Link>
        </Grid.Column>
        <Grid.Column textAlign="right" className="dropdown">
          <Dropdown
            className="right_dropdown"
            open={visibleRightMenu}
            onBlur={() => _handleCloseDropdown()}
            onFocus={() => _handleOpenDropdown()}
            text={loggedInUser ? `${loggedInUser.substring(0, 6)}...` : "Web3 Login"}
          >
            <Dropdown.Menu className="menu blurred" direction="left">
              {getTopRightMenuContent(memberData.member, poolMemberData.poolMember)}
            </Dropdown.Menu>
          </Dropdown>
        </Grid.Column>
      </Grid>
    </div>
  );
};
