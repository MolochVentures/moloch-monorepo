import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Grid, Icon, Dropdown, Form, Button } from "semantic-ui-react";
import { Query, withApollo } from "react-apollo";
import { GET_MEMBER_DETAIL } from "../helpers/graphQlQueries";
import { getMoloch, initMetamask, initGnosisSafe, getToken } from "../web3";
import { utils } from "ethers";
import { monitorTx } from "../helpers/transaction";

const MainMenu = props => (
  <div className="dropdownItems">
    {props.member && props.member.isActive ? (
      <>
        <Dropdown.Item
          icon="settings"
          className="item"
          content="Approve wETH"
          onClick={() => {
            props._handleOpenDropdown();
            props.onLoadApproveWeth();
          }}
        />
        <Dropdown.Divider />
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
          await props.populateData(true);
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

class ApproveWethMenu extends React.Component {
  state = {
    approval: ""
  };

  approve = async () => {
    const { approval } = this.state;
    const { token } = this.props;

    console.log("Approving wETH: ", process.env.REACT_APP_MOLOCH_ADDRESS, utils.parseEther(approval).toString());
    monitorTx(token.approve(process.env.REACT_APP_MOLOCH_ADDRESS, utils.parseEther(approval)));
  };

  render() {
    const { approval } = this.state;
    const { onLoadMain } = this.props;
    return (
      <div>
        <Dropdown.Item icon="arrow left" className="item" content="Back to Menu" onClick={() => onLoadMain()} />
        <Dropdown.Divider />
        <Dropdown.Item className="item submenu">
          <p>
            <Icon name="settings" />
            Approve wETH
          </p>
          <Form.Input placeholder="wETH to Approve" onChange={event => this.setState({ approval: event.target.value })} value={approval} />
          <Button onClick={this.approve}>Approve</Button>
        </Dropdown.Item>
      </div>
    );
  }
}

export default class Header extends Component {
  state = {
    visibleMenu: "main",
    visibleRightMenu: false,
    moloch: {},
    token: {}
  };

  async componentDidMount() {
    const { loggedInUser } = this.props;
    const moloch = await getMoloch(loggedInUser);
    this.setState({ moloch });

    const token = await getToken(loggedInUser);
    this.setState({
      token
    });
  }

  _handleOpenDropdown() {
    this.setState({ visibleRightMenu: true });
  }

  _handleCloseDropdown() {
    this.setState({ visibleRightMenu: false });
  }

  logIn = async method => {
    const { loggedInUser } = this.props;
    const { client } = this.props;
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

    const moloch = await getMoloch(loggedInUser);
    this.setState({ moloch });
  };

  getTopRightMenuContent(member) {
    const { loggedInUser } = this.props;
    let topRightMenuContent;
    const { moloch, token } = this.state;
    if (loggedInUser) {
      switch (this.state.visibleMenu) {
        case "main":
          topRightMenuContent = (
            <MainMenuWrapped
              member={member}
              _handleOpenDropdown={() => this._handleOpenDropdown()}
              _handleCloseDropdown={() => this._handleCloseDropdown()}
              onLoadChangeDelegateKey={() => this.setState({ visibleMenu: "changeDelegateKey" })}
              onLoadWithdrawLootToken={() => this.setState({ visibleMenu: "withdrawLootToken" })}
              onLoadApproveWeth={() => this.setState({ visibleMenu: "approveWeth" })}
            />
          );
          break;
        case "changeDelegateKey":
          topRightMenuContent = (
            <ChangeDelegateKeyMenu
              onLoadMain={() => {
                this._handleOpenDropdown();
                this.setState({ visibleMenu: "main" });
              }}
              moloch={moloch}
            />
          );
          break;
        case "withdrawLootToken":
          topRightMenuContent = (
            <WithdrawLootTokenMenu
              onLoadMain={() => {
                this._handleOpenDropdown();
                this.setState({ visibleMenu: "main" });
              }}
              moloch={moloch}
            />
          );
          break;
        case "approveWeth":
          topRightMenuContent = (
            <ApproveWethMenu
              onLoadMain={() => {
                this._handleOpenDropdown();
                this.setState({ visibleMenu: "main" });
              }}
              token={token}
            />
          );
          break;
        default:
          break;
      }
    } else {
      topRightMenuContent = (
        <>
          <Dropdown.Item icon="user" className="item" content="Log In With Metamask" onClick={() => this.logIn("metamask")} />
          <Dropdown.Divider />
          <Dropdown.Item icon="user" className="item" content="Log In With Gnosis Safe" onClick={() => this.logIn("gnosis")} />
        </>
      );
    }
    return topRightMenuContent;
  }

  handleChange = e => this.setState({ approval: e.target.value });

  handleSubmit = async () => {
    const { approval, token } = this.state;
    console.log("Approving wETH: ", process.env.REACT_APP_MOLOCH_ADDRESS, utils.parseEther(approval).toString());
    const tx = await token.approve(process.env.REACT_APP_MOLOCH_ADDRESS, utils.parseEther(approval));
    console.log("tx: ", tx);
  };

  render() {
    const { loggedInUser } = this.props;
    return (
      <Query query={GET_MEMBER_DETAIL} variables={{ address: loggedInUser }}>
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
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
                    open={this.state.visibleRightMenu}
                    onBlur={() => this._handleCloseDropdown()}
                    onFocus={() => this._handleOpenDropdown()}
                    text={loggedInUser ? `${loggedInUser.substring(0, 6)}...` : "Web3 Login"}
                  >
                    <Dropdown.Menu className="menu blurred" direction="left">
                      {this.getTopRightMenuContent(data.member)}
                    </Dropdown.Menu>
                  </Dropdown>
                </Grid.Column>
              </Grid>
            </div>
          );
        }}
      </Query>
    );
  }
}
