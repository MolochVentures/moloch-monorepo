import React, { Component } from "react";
import { Button, Divider, Form, Grid, Input, Segment, GridColumn } from "semantic-ui-react";
import { getMoloch } from "../web3";
import { utils } from "ethers";

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
    formValid: false
  };

  async componentDidMount() {
    const moloch = await getMoloch();
    this.setState({
      moloch
    });
  }

  validateField = (fieldName, value) => {
    let { fieldValidationErrors, titleValid, descriptionValid, tributeValid, sharesValid, addressValid } = this.state

    switch (fieldName) {
      case "title":
        titleValid = value !== "";
        fieldValidationErrors.title = titleValid ? "" : "Title is invalid";
        break;
      case "address":
        addressValid = utils.isHexString(value)
        console.log('utils.isHexString(value): ', utils.isHexString(value));
        console.log('value: ', value);
        fieldValidationErrors.address = addressValid ? "" : "Address is invalid";
        break
      case "description":
        descriptionValid = value !== "";
        fieldValidationErrors.description = descriptionValid ? "" : "Description is invalid";
        break;
      case "shares":
        sharesValid = value > 0;
        fieldValidationErrors.shares = sharesValid ? "" : "Shares is invalid";
        break;
      case "tribute":
        tributeValid = value > 0;
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
        addressValid
      },
      this.validateForm
    );
  }

  validateForm = () => {
    const { titleValid, descriptionValid, sharesValid, tributeValid, addressValid } = this.state
    this.setState({ formValid: titleValid && descriptionValid && sharesValid && tributeValid && addressValid});
  }

  handleInput = (event) => {
    let name = event.target.name;
    let value = event.target.value;
    this.setState({ [event.target.name]: event.target.value }, () => {
      this.validateField(name, value);
    });
  }

  handleSubmit = async () => {
    const { moloch, formValid, address, title, description, shares, tribute } = this.state

    if (formValid || true) {
      try {
        const tx = await moloch.submitProposal(address, tribute, shares, JSON.stringify({ title, description }))
        console.log('tx: ', tx);
      } catch (e) {
        console.error(e);
        alert("Error processing proposal");
      }
    } else {
      alert("Please fill any missing fields.");
    }
  }

  render() {
    const { shares, tribute, title, description, address } = this.state
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
                  />
                  <Form.Input
                    name="shares"
                    label="Shares Requested"
                    placeholder="Shares"
                    fluid
                    type="number"
                    onChange={this.handleInput}
                    value={shares}
                  />
                  <Form.Input
                    name="tribute"
                    label="Tribute Offered (in ETH)"
                    placeholder="ETH"
                    fluid
                    type="number"
                    onChange={this.handleInput}
                    value={tribute}
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
                      />
                    </Segment>
                  </Grid.Column>
                </Grid>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <GridColumn mobile={16} tablet={8} computer={8} className="submit_button">
                <Button size="large" color="red" onClick={this.handleSubmit}>
                  Submit Proposal
                </Button>
              </GridColumn>
            </Grid.Row>
          </Grid>
        </Form>
      </div>
    );
  }
}
