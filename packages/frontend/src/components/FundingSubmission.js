import React, { Component } from 'react'
import {
  Button,
  Form,
  Grid,
  Input,
  Segment,
  Modal,
  Header,
  Icon,
  List,
} from "semantic-ui-react";
import { getMoloch, getToken, } from "../web3";
import { utils } from "ethers";
import { monitorTx } from "helpers/transaction";
import { Query } from "react-apollo";
import { bigNumberify } from "ethers/utils";
import gql from "graphql-tag";
import { getShareValue } from "../helpers/currency";

const GET_METADATA = gql`
  {
    exchangeRate @client
    totalShares @client
    guildBankValue @client
  }
`;

const DEPOSIT_WETH = process.env.REACT_APP_DEPOSIT_WETH || "10";

class SubmitModal extends Component {
  state = {
    loading: true,
    depositApproved: false,
    open: false,
  };

  handleOpen = async () => {
    const { token, moloch, loggedInUser, valid } = this.props;
    if (!valid) {
      alert("Please fill any missing fields.");
      return;
    }
    this.setState({
      open: true,
    });

    const depositAllowance = await token.allowance(loggedInUser, moloch.address);
    let depositApproved = false;
    if (depositAllowance.gte(utils.parseEther(DEPOSIT_WETH))) {
      depositApproved = true;
    }

    this.setState({
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
    const { loading, depositApproved, open } = this.state;
    const { handleSubmit, submittedTx } = this.props;
    return (
      <div id="proposal_submission">
        <Modal
          trigger={
            <Button size="large" color="green" onClick={this.handleOpen} >
              <Icon name='send' color="white" />  Submit a new proposal
          </Button>
          }
          basic
          size="small"
          open={open}
        >
          <Header content="Submit Proposal" />
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
                <List.Content>{DEPOSIT_WETH} DAI Deposit Approved</List.Content>
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
              disabled={submittedTx || !depositApproved}
            >
              <Icon name="check" /> Submit
          </Button>
            <Button basic color="red" inverted onClick={this.handleClose}>
              <Icon name="remove" /> Close
          </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

export default class FundingSubmission extends Component {

  state = {
    address: "",
    title: "",
    description: "",
    amount: "",
    tribute: 0, // TODO: this will be calculated with the blockchain
    fieldValidationErrors: { title: "", description: "", assets: "", amount: "" },
    titleValid: false,
    descriptionValid: false,
    amountValid: false,
    addressValid: false,
    formValid: false,
    shareValue: null
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
      amountValid,
      addressValid,
    } = this.state;

    switch (fieldName) {
      case "title":
        titleValid = value && value !== "";
        fieldValidationErrors.title = titleValid ? "" : "Title is invalid";
        break;
      case "address":
        addressValid = utils.isHexString(value);
        fieldValidationErrors.address = addressValid ? "" : "Address is invalid";
        break;
      case "description":
        descriptionValid = value !== "";
        fieldValidationErrors.description = descriptionValid ? "" : "Description is invalid";
        break;
      case "amount":
        amountValid = value > 0;
        fieldValidationErrors.amount = amountValid ? "" : "Amount is invalid";
        break;
      default:
        break;
    }
    this.setState(
      {
        fieldValidationErrors,
        titleValid,
        descriptionValid,
        amountValid,
        addressValid,
      },
      this.validateForm,
    );
  };

  validateForm = () => {
    const { titleValid, descriptionValid, amountValid, addressValid } = this.state;
    this.setState({
      formValid: titleValid && descriptionValid && amountValid && addressValid,
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
    const { moloch, address, title, description, amount, shareValue } = this.state;
    const shares = bigNumberify(amount).mul(10 ** 9).mul(10 ** 9).div(bigNumberify(shareValue));

    let submittedTx;
    try {
      monitorTx(
        moloch.submitProposal(
          address,
          0,
          shares,
          JSON.stringify({ title, description }),
        ),
      );

      this.setState({
        submittedTx,
      });

    } catch (e) {
      console.error(e);
      alert("Error processing proposal");
    }
  };

  render() {
    const {
      amount,
      tribute,
      title,
      description,
      address,
      token,
      formValid,
      moloch,
      titleValid,
      descriptionValid,
      amountValid,
      addressValid,
      submittedTx,
    } = this.state;
    const { loggedInUser } = this.props;

    return (
      <div id="proposal_submission">
        <Form>
          <Query query={GET_METADATA}>
            {({ loading, error, data }) => {
              if (loading) return <p>Loading...</p>
              if (error) throw new Error(error);
              const { guildBankValue, totalShares, } = data;

              const shareValue = getShareValue(totalShares, guildBankValue);

              if (!this.state.shareValue && data) {
                this.setState({
                  shareValue
                });
              }

              return null;
            }}
          </Query>
          <Grid centered columns={16}>
            <Grid.Column mobile={16} tablet={16} computer={12}>
              <h1> New Funding Proposal </h1>
            </Grid.Column>
            <Grid.Row stretched>
              <Grid.Column mobile={16} tablet={16} computer={12}>
                <Input
                  id="titleInput"
                  name="title"
                  size="big"
                  placeholder="Proposal Title"
                  onChange={this.handleInput}
                  value={title}
                  error={!titleValid}
                />
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
                    name="amount"
                    label="DAI Requested"
                    placeholder="DAI"
                    fluid
                    type="number"
                    onChange={this.handleInput}
                    value={amount}
                    error={!amountValid}
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
