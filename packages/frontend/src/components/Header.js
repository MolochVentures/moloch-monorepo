import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, Icon, Dropdown, Form, Button, Loader } from "semantic-ui-react";
import { Query, withApollo } from "react-apollo";
import { GET_MEMBER_DETAIL } from "../helpers/graphQlQueries";
import { getMoloch, initMetamask, initGnosisSafe, getToken, getEthSigner } from "../web3";
import { utils } from "ethers";
import { monitorTx } from "../helpers/transaction";
import { formatEther } from "ethers/utils";

const MainMenu = props => (
  <div className="dropdownItems">
    <Dropdown.Item
      icon="settings"
      className="item"
      content="wETH Center"
      onClick={() => {
        props._handleOpenDropdown();
        props.onLoadApproveWeth();
      }}
    />
    <Dropdown.Divider />
    {props.member && props.member.isActive ? (
      <>
        <Dropdown.Item className="item" onClick={() => props._handleCloseDropdown()}>
          <Link to={`/members/${props.member.id}`} className="link">
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
            props._handleOpenDropdown();
            props.onLoadChangeDelegateKey();
          }}
        />
        <Dropdown.Divider />
        <Dropdown.Item
          icon="dollar"
          className="item"
          content="Ragequit"
          onClick={() => {
            props._handleOpenDropdown();
            props.onLoadWithdrawLootToken();
          }}
        />
        <Dropdown.Divider />
      </>
    ) : null}
    <Dropdown.Item className="item">
      <Link
        to="/login"
        className="link"
        onClick={async () => {
          props._handleCloseDropdown();
          window.localStorage.setItem("loggedInUser", "");
          await props.client.resetStore();
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

class ChangeDelegateKeyMenu extends React.Component {
  state = {
    newDelegateKey: ""
  };

  submitChangeDelegateKey = async () => {
    const { newDelegateKey } = this.state;
    const { moloch } = this.props;

    console.log(`Sending moloch.updateDelegateKey(${newDelegateKey})`);

    monitorTx(moloch.updateDelegateKey(newDelegateKey));
  };

  render() {
    const { newDelegateKey } = this.state;
    const { onLoadMain } = this.props;
    return (
      <div>
        <Dropdown.Item icon="arrow left" className="item" content="Back to Menu" onClick={() => onLoadMain()} />
        <Dropdown.Divider />
        <Dropdown.Item className="item submenu">
          <p>
            <Icon name="key" />
            Change Delegate Key
          </p>
          <Form.Input
            placeholder="Enter new key address"
            onChange={event => this.setState({ newDelegateKey: event.target.value })}
            value={newDelegateKey}
          />
          <Button onClick={this.submitChangeDelegateKey}>Save</Button>
        </Dropdown.Item>
      </div>
    );
  }
}

class WithdrawLootTokenMenu extends React.Component {
  state = {
    ragequitAmount: ""
  };

  submitRagequit = async () => {
    const { ragequitAmount } = this.state;
    const { moloch } = this.props;

    console.log(`Sending moloch.ragequit(${ragequitAmount})`);

    monitorTx(moloch.ragequit(ragequitAmount));
  };

  render() {
    const { ragequitAmount } = this.state;
    const { onLoadMain } = this.props;
    return (
      <div>
        <Dropdown.Item icon="arrow left" className="item" content="Back to Menu" onClick={() => onLoadMain()} />
        <Dropdown.Divider />
        <Dropdown.Item className="item submenu">
          <p>
            <Icon name="dollar" />
            Ragequit
          </p>
          <Form.Input
            placeholder="Number of shares"
            onChange={event => this.setState({ ragequitAmount: event.target.value })}
            value={ragequitAmount}
          />
          <Button onClick={this.submitRagequit}>Withdraw</Button>
        </Dropdown.Item>
      </div>
    );
  }
}

function ApproveWethMenu({ token, eth, onLoadMain, loggedInUser }) {
  const [approval, setApproval] = useState("");
  const [wrap, setWrap] = useState("");
  const [myWeth, setMyWeth] = useState("...");
  const [myEth, setMyEth] = useState("...");

  const approve = useCallback(() => {
    console.log("Approving wETH: ", process.env.REACT_APP_MOLOCH_ADDRESS, utils.parseEther(approval).toString());
    monitorTx(token.approve(process.env.REACT_APP_MOLOCH_ADDRESS, utils.parseEther(approval)));
  }, [approval, token]);

  const wrapEth = useCallback(() => {
    console.log("Wrapping ETH: ", process.env.REACT_APP_MOLOCH_ADDRESS, utils.parseEther(wrap).toString());
    monitorTx(token.deposit({ value: utils.parseEther(wrap) }));
  }, [wrap, token]);

  const unwrapWeth = useCallback(() => {
    console.log("Unwrapping wETH: ", process.env.REACT_APP_MOLOCH_ADDRESS, utils.parseEther(approval).toString());
    monitorTx(token.withdraw({ value: utils.parseEther(approval) }));
  }, [approval, token]);

  useEffect(() => {
    async function fetchMyWeth() {
      const weth = await token.balanceOf(loggedInUser);
      setMyWeth(parseFloat(formatEther(weth)).toFixed(2));
    }
    fetchMyWeth();
  }, [token, loggedInUser]);

  useEffect(() => {
    async function fetchMyEth() {
      const e = await eth.getBalance(loggedInUser);
      setMyEth(parseFloat(formatEther(e)).toFixed(2));
    }
    fetchMyEth();
  }, [eth, loggedInUser]);

  return (
    <>
      <Dropdown.Item icon="arrow left" className="item" content="Back to Menu" onClick={() => onLoadMain()} />
      <Dropdown.Divider />
      <Dropdown.Item className="item submenu">
        <p>
          <Icon name="settings" />
          wETH Center
        </p>
        <Form.Input placeholder={`${myWeth} wETH available`} onChange={event => setApproval(event.target.value)} value={approval} />
        <Button.Group>
          <Button onClick={approve}>Approve</Button>
          <Button onClick={unwrapWeth}>Unwrap</Button>
        </Button.Group>
        <Form.Input placeholder={`${myEth} ETH available`} onChange={event => setWrap(event.target.value)} value={wrap} />
        <Button onClick={wrapEth}>Wrap</Button>
      </Dropdown.Item>
    </>
  );
}

export default ({ loggedInUser, client }) => {
  const [visibleRightMenu, setVisibleRightMenu] = useState(false);
  const [visibleMenu, setVisibleMenu] = useState("main");
  const [moloch, setMoloch] = useState({});
  const [token, setToken] = useState({});
  const [eth, setEth] = useState({});

  useEffect(() => {
    async function init() {
      setMoloch(await getMoloch(loggedInUser));
      setToken(await getToken(loggedInUser));
      setEth(await getEthSigner());
    }
    init();
  }, [loggedInUser]);

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

    const molochInstance = await getMoloch(loggedInUser);
    setMoloch(molochInstance);
  }

  const getTopRightMenuContent = member => {
    let topRightMenuContent;
    if (loggedInUser) {
      switch (visibleMenu) {
        case "main":
          topRightMenuContent = (
            <MainMenuWrapped
              member={member}
              _handleOpenDropdown={() => _handleOpenDropdown()}
              _handleCloseDropdown={() => _handleCloseDropdown()}
              onLoadChangeDelegateKey={() => setVisibleMenu("changeDelegateKey")}
              onLoadWithdrawLootToken={() => setVisibleMenu("withdrawLootToken")}
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
          <Dropdown.Item icon="user" className="item" content="Log In With Metamask" onClick={() => logIn("metamask")} />
          <Dropdown.Divider />
          <Dropdown.Item icon="user" className="item" content="Log In With Gnosis Safe" onClick={() => logIn("gnosis")} />
        </>
      );
    }
    return topRightMenuContent;
  };

  return (
    <Query query={GET_MEMBER_DETAIL} variables={{ address: loggedInUser }}>
      {({ loading, error, data }) => {
        if (loading) return <Loader active />;
        if (error) throw new Error(`Error!: ${error}`);
        return (
          <div id="header">
            <Grid container columns={3} stackable verticalAlign="middle">
              <Grid.Column textAlign="center" only="computer tablet" />
              <Grid.Column textAlign="center" className="logo">
                <Link to="/">MOLOCH</Link>
              </Grid.Column>
              <Grid.Column textAlign="center" className="dropdown">
                <Dropdown
                  className="right_dropdown"
                  open={visibleRightMenu}
                  onBlur={() => _handleCloseDropdown()}
                  onFocus={() => _handleOpenDropdown()}
                  text={loggedInUser ? `${loggedInUser.substring(0, 6)}...` : "Web3 Login"}
                >
                  <Dropdown.Menu className="menu blurred" direction="left">
                    {getTopRightMenuContent(data.member)}
                  </Dropdown.Menu>
                </Dropdown>
              </Grid.Column>
            </Grid>
          </div>
        );
      }}
    </Query>
  );
};
