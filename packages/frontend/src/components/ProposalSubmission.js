import React, { Component } from "react";
import {
  Button,
  Divider,
  Form,
  Grid,
  Input,
  Segment,
  Modal,
  Header,
  Icon,
  List,
} from "semantic-ui-react";
import { getMoloch, getToken } from "../web3";
import { utils } from "ethers";
import { monitorTx } from "helpers/transaction";

const DEPOSIT_WETH = process.env.REACT_APP_DEPOSIT_WETH || "10";

class SubmitModal extends Component {
  state = {
    loading: true,
    beneficiaryApproved: false,
    depositApproved: false,
    open: false,
  };

  handleOpen = async () => {
    const { token, address, tribute, moloch, loggedInUser, valid } = this.props;
    if (!valid) {
      alert("Please fill any missing fields.");
      return;
    }
    this.setState({
      open: true,
    });

    const beneficiaryAllowance = await token.allowance(address, moloch.address);
    let beneficiaryApproved = false;
    if (beneficiaryAllowance.gte(utils.parseEther(tribute))) {
      beneficiaryApproved = true;
    }

    const depositAllowance = await token.allowance(loggedInUser, moloch.address);
    let depositApproved = false;
    if (depositAllowance.gte(utils.parseEther(DEPOSIT_WETH))) {
      depositApproved = true;
    }

    this.setState({
      beneficiaryApproved,
      depositApproved,
      loading: false,
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const { loading, beneficiaryApproved, depositApproved, open } = this.state;
    const { handleSubmit, submittedTx } = this.props;
    return (
      <Modal
        trigger={
          <Button size="large" color="red" onClick={this.handleOpen}>
            Submit Proposal
          </Button>
        }
        basic
        size="small"
        open={open}
      >
        <Header icon="send" content="Submit Proposal" />
        <Modal.Content>
          <List>
            <List.Item>
              {loading ? (
                <List.Icon name="time" />
              ) : depositApproved ? (
                <List.Icon name="check circle" />
              ) : (
                <List.Icon name="x" />
              )}
              <List.Content>{DEPOSIT_WETH} wETH Deposit Approved</List.Content>
            </List.Item>
            <List.Item>
              {loading ? (
                <List.Icon name="time" />
              ) : beneficiaryApproved ? (
                <List.Icon name="check circle" />
              ) : (
                <List.Icon name="x" />
              )}
              <List.Content>Tribute Approved By Beneficiary</List.Content>
            </List.Item>
            <List.Item>
              {submittedTx ? <List.Icon name="code" /> : <></>}
              <List.Content>
                {submittedTx ? (
                  <a
                    href={`https://etherscan.io/tx/${submittedTx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Transaction on Etherscan
                  </a>
                ) : (
                  <></>
                )}
              </List.Content>
            </List.Item>
          </List>
        </Modal.Content>
        <Modal.Actions>
          <Button
            basic
            color="green"
            inverted
            onClick={handleSubmit}
            disabled={submittedTx || !depositApproved || !beneficiaryApproved}
          >
            <Icon name="check" /> Submit
          </Button>
          <Button basic color="red" inverted onClick={this.handleClose}>
            <Icon name="remove" /> Close
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default class ProposalSubmission extends Component {
  state = {
    address: "",
    title: "",
    description: "",
    shares: "",
    tribute: "", // TODO: this will be calculated with the blockchain
    fieldValidationErrors: { title: "", description: "", assets: "", shares: "" },
    titleValid: false,
    descriptionValid: false,
    tributeValid: false,
    sharesValid: false,
    addressValid: false,
    formValid: false,
  };

  async componentDidMount() {
    const { loggedInUser } = this.props;
    const moloch = await getMoloch(loggedInUser);
    const token = await getToken(loggedInUser);
    this.setState({
      moloch,
      token,
    });
  }

  validateField = (fieldName, value) => {
    let {
      fieldValidationErrors,
      titleValid,
      descriptionValid,
      tributeValid,
      sharesValid,
      addressValid,
    } = this.state;

    switch (fieldName) {
      case "title":
        titleValid = value && value !== "";
        fieldValidationErrors.title = titleValid ? "" : "Title is invalid";
        break;
      case "address":
        addressValid = utils.isHexString(value);
        console.log("utils.isHexString(value): ", utils.isHexString(value));
        console.log("value: ", value);
        fieldValidationErrors.address = addressValid ? "" : "Address is invalid";
        break;
      case "description":
        descriptionValid = value !== "";
        fieldValidationErrors.description = descriptionValid ? "" : "Description is invalid";
        break;
      case "shares":
        sharesValid = value > 0;
        fieldValidationErrors.shares = sharesValid ? "" : "Shares is invalid";
        break;
      case "tribute":
        tributeValid = value >= 0;
        fieldValidationErrors.tribute = tributeValid ? "" : "Tribute is invalid";
        break;
      default:
        break;
    }
    this.setState(
      {
        fieldValidationErrors,
        titleValid,
        descriptionValid,
        tributeValid,
        sharesValid,
        addressValid,
      },
      this.validateForm,
    );
  };

  validateForm = () => {
    const { titleValid, descriptionValid, sharesValid, tributeValid, addressValid } = this.state;
    this.setState({
      formValid: titleValid && descriptionValid && sharesValid && tributeValid && addressValid,
    });
  };

  handleInput = event => {
    let name = event.target.name;
    let value = event.target.value;
    this.setState({ [event.target.name]: event.target.value }, () => {
      this.validateField(name, value);
    });
  };

  handleSubmit = async () => {
    const { moloch, address, title, description, shares, tribute } = this.state;

    let submittedTx;
    try {
      console.log(
        "Submitting proposal: ",
        address,
        utils.parseEther(tribute).toString(),
        shares,
        JSON.stringify({ title, description }),
      );
      monitorTx(
        moloch.submitProposal(
          address,
          utils.parseEther(tribute),
          shares,
          JSON.stringify({ title, description }),
        ),
      );
    } catch (e) {
      console.error(e);
      alert("Error processing proposal");
    }

    this.setState({
      submittedTx,
    });
  };

  render() {
    const {
      shares,
      tribute,
      title,
      description,
      address,
      token,
      formValid,
      moloch,
      titleValid,
      descriptionValid,
      sharesValid,
      tributeValid,
      addressValid,
      submittedTx,
    } = this.state;
    const { loggedInUser } = this.props;
    return (
      <div id="proposal_submission">
        <Form>
          <Grid centered columns={16}>
            <Grid.Row stretched>
              <Grid.Column mobile={16} tablet={16} computer={12}>
                <Input
                  name="title"
                  transparent
                  size="big"
                  inverted
                  placeholder="Proposal Title"
                  onChange={this.handleInput}
                  value={title}
                  error={!titleValid}
                />
                <Divider />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row stretched>
              <Grid.Column mobile={16} tablet={16} computer={12}>
                <Segment className="blurred box">
                  <Form.Input
                    name="address"
                    label="Beneficiary or Applicant"
                    placeholder="Address"
                    fluid
                    onChange={this.handleInput}
                    value={address}
                    error={!addressValid}
                  />
                  <Form.Input
                    name="shares"
                    label="Shares Requested"
                    placeholder="Shares"
                    fluid
                    type="number"
                    onChange={this.handleInput}
                    value={shares}
                    error={!sharesValid}
                  />
                  <Form.Input
                    name="tribute"
                    label="Tribute Offered (in ETH)"
                    placeholder="ETH"
                    fluid
                    type="number"
                    onChange={this.handleInput}
                    value={tribute}
                    error={!tributeValid}
                  />
                </Segment>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column mobile={16} tablet={16} computer={12}>
                <Grid columns="equal">
                  <Grid.Column>
                    <Segment className="blurred box">
                      <Form.TextArea
                        name="description"
                        label="Description"
                        placeholder="Type here"
                        rows={15}
                        onChange={this.handleInput}
                        value={description}
                        error={!descriptionValid}
                      />
                    </Segment>
                  </Grid.Column>
                </Grid>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column mobile={16} tablet={8} computer={8} className="submit_button">
                {/* <Button size="large" color="red" onClick={this.handleSubmit}>
                  Submit Proposal
                </Button> */}
                <SubmitModal
                  valid={formValid}
                  tribute={tribute}
                  address={address}
                  token={token}
                  moloch={moloch}
                  loggedInUser={loggedInUser}
                  handleSubmit={this.handleSubmit}
                  submittedTx={submittedTx}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Form>
      </div>
    );
  }
}
