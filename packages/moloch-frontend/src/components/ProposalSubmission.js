import React, { Component } from "react";
import { Button, Divider, Form, Grid, Input, Segment, GridColumn } from "semantic-ui-react";
import { getMoloch } from "../web3";

export default class ProposalSubmission extends Component {
  constructor(props) {
    super(props);

    this.state = {
      address: props.loggedInUser,
      title: "",
      description: "",
      shares: "",
      tribute: "", // TODO: this will be calculated with the blockchain
      fieldValidationErrors: { title: "", description: "", assets: "", shares: "" },
      titleValid: false,
      descriptionValid: false,
      tributeValid: false,
      sharesValid: false,
      formValid: false
    };
  }

  async componentDidMount() {
    const moloch = await getMoloch();
    this.setState({
      moloch
    });
  }

  validateField = (fieldName, value) => {
    let { fieldValidationErrors, titleValid, descriptionValid, tributeValid, sharesValid } = this.state

    switch (fieldName) {
      case "title":
        titleValid = value !== "";
        fieldValidationErrors.title = titleValid ? "" : "Title is invalid";
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
        sharesValid = value > 0;
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
        sharesValid
      },
      this.validateForm
    );
  }

  validateForm = () => {
    this.setState({ formValid: this.state.titleValid && this.state.descriptionValid && this.state.sharesValid });
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

    if (formValid) {
      try {
        await moloch.submitProposal(address, tribute, shares, JSON.stringify({ title, description }))
      } catch (e) {
        console.error(e);
        alert("Error processing proposal");
      }
    } else {
      alert("Please fill any missing fields.");
    }
  }

  render() {
    const { shares, tribute, title, description } = this.state
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
