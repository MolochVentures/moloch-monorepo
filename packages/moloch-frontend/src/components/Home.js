import React from 'react';
import { Grid, Button, Segment } from "semantic-ui-react";
import { Link } from 'react-router-dom';
import Graph from './Graph';

export default () => (
  <div id="homepage">
    <Grid columns={16} verticalAlign="middle">
    <Grid.Column mobile={16} tablet={6} computer={4} className="guild_value" >
        <Link to='/guildbank' className="text_link">
          <p className="subtext">Guild Bank Value</p>
          <p className="amount">$53,640,918</p>
        </Link>
      </Grid.Column>
      <Grid.Column mobile={16} tablet={10} computer={8} textAlign="center" className="browse_buttons" >
        <Link to='/members' className="link">
          <Button size='large' color='grey' className='btn_link'>57 Members</Button>
        </Link>
        <Link to='/proposals' className="link">
          <Button size='large' color='grey' className='btn_link'>13 Proposals</Button>
        </Link>
      </Grid.Column>
      
    <Grid.Column computer={4}  />

      <Grid.Column width={16}>
        <Segment className="blurred box">
          <Grid columns="equal" className="graph_values">
              <Grid.Column textAlign="left">
                <p className="subtext">Total Voting Shares</p>
                <p className="amount">378</p>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <p className="subtext">Total Loot Tokens</p>
                <p className="amount">541</p>
              </Grid.Column>
              <Grid.Column textAlign="right">
                <p className="subtext">Loot Token Value</p>
                <p className="amount">128 USD</p>
              </Grid.Column>
          </Grid>
          <div className="graph">
            <Graph></Graph>
          </div>
        </Segment>
      </Grid.Column>
    </Grid>

  </div>
)
