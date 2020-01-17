import React from "react";
import { Grid, Image, Divider, Button } from "semantic-ui-react";
import ethereumIcon from "assets/ethereumIcon.png";
import { Query } from "react-apollo";
import { GET_MEMBER_DETAIL } from "../helpers/graphQlQueries";

const currencies = [
  {
    name: "ETH",
    shares: 508,
    value: 32000,
    icon: ethereumIcon,
  },
];

const CurrencyElement = ({ name, shares, icon, value }) => (
  <Grid.Column mobile={5} tablet={3} computer={3} textAlign="center" className="currency_element">
    <Image src={icon} centered size="tiny" circular />
    <p className="name">{name}</p>
    <p className="shares">{shares}</p>
    <p className="subtext">{"$" + value}</p>
  </Grid.Column>
);

export default class GuildBank extends React.Component {
  state = {
    isActive: true,
  };

  redeemToken() {}

  render() {
    return (
      <Query query={GET_MEMBER_DETAIL} variables={{ address: this.props.loggedInUser }}>
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) throw new Error(`Error!: ${error}`);
          return (
            <div id="guild_bank">
              <Grid>
                <Grid.Column textAlign="center" className="guild_value">
                  <p className="subtext">Guild Bank Value</p>
                  <p className="amount">$53,640,918</p>
                  <Button
                    size="large"
                    color="gray"
                    disabled={data.member.isActive && this.state.isActive ? false : true}
                    onClick={this.redeemToken}
                  >
                    Redeem Loot Token
                  </Button>
                </Grid.Column>
              </Grid>

              <Grid>
                <Grid.Row />
                <Divider />
                <Grid.Row centered>
                  {currencies.map((elder, idx) => (
                    <CurrencyElement {...elder} key={idx} />
                  ))}
                </Grid.Row>
              </Grid>
            </div>
          );
        }}
      </Query>
    );
  }
}
