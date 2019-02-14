import React from 'react';
import { Progress, Grid } from 'semantic-ui-react';


const ProgressBar = ({ yes, no }) => {
  const total = yes + no
  const percentYes = Math.round((yes / total) * 100)
  const percentNo = Math.round((no / total) * 100)
  return (
  <>
    <div style={{ position: "relative" }}>
      <Progress
        percent={percentYes + percentNo}
        color="red"
        size="small"
        style={{
          position: "absolute",
          top: "0",
          width: "100%"
        }}
      />
      <Progress percent={percentYes} color="green" size="small" />
    </div>
    <Grid columns="equal">
      <Grid.Column floated="left">{percentYes}% Yes</Grid.Column>
      <Grid.Column floated="right" textAlign="right">
        {percentNo}% No
      </Grid.Column>
    </Grid>
  </>
)};

export default ProgressBar