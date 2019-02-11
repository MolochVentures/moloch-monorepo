import React, { Component } from 'react';
import { Button, Divider, Form, Grid, Input, Segment, GridColumn } from "semantic-ui-react";
import { connect } from 'react-redux';
import { postEvents, getAssetData } from '../action/actions';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

class AssetsFields extends Component {
    constructor(props) {
        super(props);

        this.handleAsset = this.handleAsset.bind(this);
        this.deleteAsset = this.deleteAsset.bind(this);
    }

    handleAsset(event, { value, name }) {
        this.props.onHandleAsset({ value, name, assetIndex: this.props.assetIndex });
    }

    deleteAsset() {
        this.props.onHandleDeleteAsset({ assetIndex: this.props.assetIndex });
    }

    render() {
        return (
            <Grid.Row className="asset_field_row">
                {/* <Grid.Column mobile={14} tablet={5} computer={7} className="asset_field_grid membership"> */}
                <Grid.Column width={2} textAlign='left' className="asset_field_grid membership">
                    {/* <Input name="asset" className="asset icon_asset" icon="ethereum" iconPosition="left" placeholder="ETH, BTC, Token address" onChange={this.handleAsset} type="text" /> */}
                    {/* <Input icon="ethereum" iconPosition="left" name="asset" className="asset icon_asset" type="text" value={this.props.assets.symbol} disabled={true} /> */}
                    <div className="subtext" style={{ paddingTop: 10, paddingRight: 10 }}>
                        {this.props.assets.symbol}
                    </div>
                </Grid.Column>
                {/* <Grid.Column mobile={2} tablet={1} computer={2} className="asset_field_grid mobile_delete_icon" textAlign="right">
                    <div className="subtext">
                        <Icon name='times' className="delete_icon" link onClick={this.deleteAsset} />
                    </div>
                </Grid.Column> */}
                <Grid.Column mobile={14} tablet={10} computer={7} className="asset_field_grid" >
                    <Input name="amount" className="asset_amount" placeholder="Enter Amount" type="number" onChange={this.handleAsset} />
                </Grid.Column>
                {/* <Grid.Column mobile={2} tablet={1} computer={2} className="asset_field_grid computer_delete_icon" textAlign="center">
                    <div className="subtext">
                        <Icon name='times' className="delete_icon" link onClick={this.deleteAsset} />
                    </div>
                </Grid.Column> */}
            </Grid.Row>
        );
    }
}

class MembershipProposalSubmission extends Component {
    constructor(props) {
        super(props);

        this.state = {
            address: JSON.parse(localStorage.getItem("loggedUser")).address,
            nonce: JSON.parse(localStorage.getItem("loggedUser")).nonce,
            title: '',
            description: '',
            shares: 0,
            tribute: 0, // TODO: this will be calculated with the blockchain
            assets: [],
            formErrors: { title: '', description: '', assets: '', shares: '' },
            titleValid: false,
            descriptionValid: false,
            assetsValid: false,
            sharesValid: false,
            formValid: false
        }

        this.addAsset = this.addAsset.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleAsset = this.handleAsset.bind(this);
        this.handleDeleteAsset = this.handleDeleteAsset.bind(this);
    }

    componentDidMount() {
        this.setState({
            assets: [{
                asset: 'ETH',
                symbol: 'ETH',
                amount: 0,
                logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
            }]
        });
        this.props.getAssetData();
    }

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let titleValid = this.state.titleValid;
        let descriptionValid = this.state.descriptionValid;
        let assetsValid = this.state.assetsValid;
        let sharesValid = this.state.sharesValid;

        switch (fieldName) {
            case 'title':
                titleValid = value !== '';
                fieldValidationErrors.title = titleValid ? '' : 'Title field is invalid';
                break;
            case 'description':
                descriptionValid = value !== '';
                fieldValidationErrors.description = descriptionValid ? '' : 'Description field is invalid';
                break;
            case 'assets':
                Object.keys(value).map((key) => {
                    for (var i in value[key]) {
                        if (Object.keys(value[key]).length <= 1) {
                            assetsValid = false;
                            return false;
                        } else {
                            if (value[key][i] === null || value[key][i] === "") {
                                assetsValid = false;
                                return false;
                            }
                        }
                    }
                    assetsValid = true;
                    return true;
                });
                fieldValidationErrors.assets = assetsValid ? '' : 'Asset is invalid';
                break;
            case 'shares':
                sharesValid = value > 0;
                fieldValidationErrors.shares = sharesValid ? '' : 'Shares field is invalid';
                break;
            default:
                break;
        }
        this.setState({
            formErrors: fieldValidationErrors,
            titleValid: titleValid,
            descriptionValid: descriptionValid,
            assetsValid: assetsValid,
            sharesValid: sharesValid
        }, this.validateForm);
    }

    validateForm() {
        this.setState({ formValid: this.state.titleValid && this.state.descriptionValid && this.state.assetsValid && this.state.sharesValid });
    }

    addAsset() {
        let assets = this.state.assets ? this.state.assets : [];
        assets.push({});

        this.setState({ assets });
    }

    handleInput(event) {
        let name = event.target.name;
        let value = event.target.value
        if (name === 'shares') {
            this.setState({ [name]: parseInt(value) },
                () => {
                    this.validateField(name, value);
                });
        } else {
            this.setState({ [event.target.name]: event.target.value },
                () => {
                    this.validateField(name, value);
                });
        }
    }

    handleAsset(event) {
        let assets = this.state.assets;
        assets[event.assetIndex][event.name] = event.value;
        this.setState({ assets },
            () => {
                this.validateField('assets', assets);
            });
        this.setState({ tribute: this.props.assetDetails.price_usd * event.value });
    }

    handleDeleteAsset(event) {
        let assets = this.state.assets;
        assets.splice(event.assetIndex, 1);
        this.setState({ assets },
            () => {
                this.validateField('assets', assets);
            });
    }

    handleSubmit() {
        let self = this;
        var membership = {
            address: this.state.address,
            nonce: this.state.nonce,
            title: this.state.title,
            description: this.state.description,
            shares: this.state.shares,
            tribute: this.state.tribute,
            assets: this.state.assets
        }

        if (this.state.formValid) {
            this.props.postEvents(JSON.stringify({ id: '', name: 'Membership proposal', payload: membership }))
                .then((responseJson) => {
                    switch (responseJson.type) {
                        case 'POST_EVENTS_SUCCESS':
                            if (responseJson.items.id) {
                                self.props.history.push('/members');
                            } else {
                                alert('Error processing proposal');
                            }
                            break;
                        case 'POST_EVENTS_FAILURE':
                            alert('Error processing proposal');
                            break;
                        default:
                            break;
                    }
                });
        } else {
            alert('Please, fill any missing field');
        }
    };

    render() {
        return (
            <div id="proposal_submission">
                <Form>
                    <Grid centered columns={16}>
                        <Grid.Row stretched>
                            <Grid.Column mobile={16} tablet={16} computer={12} >
                                <Input name="title" transparent size='big' inverted placeholder='Proposal Title' onChange={this.handleInput} value={this.state.title} />
                                <Divider />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row stretched>
                            <Grid.Column mobile={16} tablet={16} computer={12} >
                                <Segment className="blurred box">
                                    <Form.Input name="shares" label="Request voting shares" placeholder="Shares" fluid type="number" onChange={this.handleInput} value={this.state.shares} />
                                </Segment>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column mobile={16} tablet={16} computer={12} >
                                <Grid columns='equal'>
                                    <Grid.Column>
                                        <Segment className="blurred box">
                                            <Form.TextArea name="description" label="Description" placeholder="Type here" rows={15} onChange={this.handleInput} value={this.state.description}></Form.TextArea>
                                        </Segment>
                                    </Grid.Column>
                                    <Grid.Column mobile={16} tablet={16} computer={8} >
                                        <Segment className="blurred box">
                                            <Grid columns={16}>
                                                <Grid.Column width={14}>
                                                    <div className="subtext">
                                                        Request Amount
                                                    </div>
                                                </Grid.Column>
                                                {/* <Grid.Column width={2}>
                                                    <div className="subtext">
                                                        <Icon name='add' className="add_icon" link onClick={this.addAsset} />
                                                    </div>
                                                </Grid.Column> */}
                                            </Grid>
                                            <Grid columns={3} className="assets_field">
                                                {this.state.assets.map((row, i) =>
                                                    <AssetsFields key={i} assetIndex={i} assets={row} onHandleAsset={this.handleAsset} onHandleDeleteAsset={this.handleDeleteAsset}></AssetsFields>
                                                )}
                                            </Grid>
                                            <Divider />
                                            <Grid columns="equal" className="value_shares">
                                                <Grid.Row>
                                                    <Grid.Column textAlign="center">
                                                        <p className="subtext">Tribute Value</p>
                                                        <p className="amount">{formatter.format(this.state.tribute)}</p>
                                                    </Grid.Column>
                                                </Grid.Row>
                                            </Grid>
                                        </Segment>
                                    </Grid.Column>
                                </Grid>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <GridColumn mobile={16} tablet={8} computer={8} className="submit_button">
                                <Button size='large' color='red' onClick={this.handleSubmit}>Submit Proposal</Button>
                            </GridColumn>
                        </Grid.Row>
                    </Grid>
                </Form>
            </div>
        );
    }
}


// This function is used to convert redux global state to desired props.
function mapStateToProps(state) {
    return {
        assetDetails: state.assetData.items ? state.assetData.items[0] : { price_usd: 1 }
    };
}

// This function is used to provide callbacks to container component.
function mapDispatchToProps(dispatch) {
    return {
        postEvents: function (data) {
            return dispatch(postEvents(data));
        },
        getAssetData: function () {
            dispatch(getAssetData());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MembershipProposalSubmission);