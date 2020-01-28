import React from "react";
import { Progress, Grid } from "semantic-ui-react";

const ProgressBar = ({ yes, no }) => {
  yes = parseInt(yes)
  no = parseInt(no)
  const total = yes + no;
  const percentYes = yes === 0 ? 0 : Math.round((yes / total) * 100);
  const percentNo = no === 0 ? 0 : Math.round((no / total) * 100);
  return (
    <>
      <div style={{ position: "relative" }}>
        <Progress
          percent={percentYes + percentNo}
          color="red"
          size="medium"
          progress='percent'
          textAlign="right"
          style={{
            position: "absolute",
            top: "0",
            width: "100%",
          }}  
          className={no === 0 ? "hide-bar" : ""}
        />
        <Progress
          percent={percentYes}
          color="green"
          size="medium"
          progress='percent'
          textAlign="right"
          className={yes === 0 ? "hide-bar" : ""}
        />
      </div>
      <Grid columns="equal" >
        <Grid.Column floated="left" id="amountYesNo"><p>{yes} Yes Votes</p></Grid.Column>
        <Grid.Column floated="right" textAlign="right" id="amountYesNo">
          <p>{no} No Votes</p>
        </Grid.Column>
      </Grid>
    </>
  );
};

export default ProgressBar;
