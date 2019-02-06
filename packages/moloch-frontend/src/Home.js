import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { ResponsiveLine } from '@nivo/line'
import './App.css';

class Home extends Component {
    constructor(props) {
        super(props);

        this.loadProposals = this.loadProposals.bind(this);
        this.loadMembers = this.loadMembers.bind(this);
        this.loadProposalCreation = this.loadProposalCreation.bind(this);
    }

    loadProposals() {
        this.props.onLoadProposals();
    }

    loadMembers() {
        this.props.onLoadMembers();
    }

    loadProposalCreation() {
        this.props.onLoadProposalCreation();
    }

    render() {
      return (
        <div>
            <div className="GraphOptionsMoloch">
                <div className="GraphOptionMoloch">
                    <p>Guild Bank Value</p>
                    <h1>$53,640,918</h1>
                </div>
                <div className="GraphOptionMoloch">
                    <Button className="MarginLeft20 MarginRight10" bsStyle="default" bsSize="large" onClick={this.loadMembers}>53 Members</Button>
                    <Button bsStyle="default" bsSize="large" onClick={this.loadProposals}>13 Proposals</Button>
                </div>
                <div className="GraphOptionMoloch">
                    <Button className="PullRight" bsStyle="danger" bsSize="large" onClick={this.loadProposalCreation}>Submit Proposal</Button>
                </div>
            </div>
            <div className="GraphContainer">
                <LineGraph></LineGraph>
            </div>
        </div>
      );
    }
}

class LineGraph extends Component {
    render() {
        const data = [
            {
              "id": "Value",
              "color": "hsl(21, 70%, 50%)",
              "data": [
                {
                  "x": "Jan",
                  "y": 20
                },
                {
                  "x": "Feb",
                  "y": 70
                },
                {
                  "x": "Mar",
                  "y": 100
                },
                {
                  "x": "Apr",
                  "y": 60
                },
                {
                  "x": "Jun",
                  "y": 70
                },
                {
                  "x": "Jul",
                  "y": 120
                },
                {
                  "x": "Aug",
                  "y": 170
                },
                {
                  "x": "Sep",
                  "y": 70
                },
                {
                  "x": "Oct",
                  "y": 100
                },
                {
                  "x": "Nov",
                  "y": 170
                },
                {
                  "x": "Dec",
                  "y": 190
                }
              ]
            }
          ];

        return (
            <ResponsiveLine
                data={data}
                margin={{
                    "top": 50,
                    "right": 110,
                    "bottom": 50,
                    "left": 60
                }}
                xScale={{
                    "type": "point"
                }}
                yScale={{
                    "type": "linear",
                    "stacked": true,
                    "min": "auto",
                    "max": "auto"
                }}
                colors={["#ff6666"]}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    "orient": "bottom",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legend": "transportation",
                    "legendOffset": 36,
                    "legendPosition": "middle"
                }}
                axisLeft={{
                    "orient": "left",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legend": "count",
                    "legendOffset": -40,
                    "legendPosition": "middle"
                }}
                dotSize={10}
                dotColor="inherit:darker(0.3)"
                dotBorderWidth={2}
                dotBorderColor="#ffffff"
                enableDotLabel={true}
                dotLabel="y"
                dotLabelYOffset={-12}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                legends={[
                    {
                        "anchor": "bottom-right",
                        "direction": "column",
                        "justify": false,
                        "translateX": 100,
                        "translateY": 0,
                        "itemsSpacing": 0,
                        "itemDirection": "left-to-right",
                        "itemWidth": 80,
                        "itemHeight": 20,
                        "itemOpacity": 0.75,
                        "symbolSize": 12,
                        "symbolShape": "circle",
                        "symbolBorderColor": "rgba(0, 0, 0, .5)",
                        "effects": [
                            {
                                "on": "hover",
                                "style": {
                                    "itemBackground": "rgba(0, 0, 0, .03)",
                                    "itemOpacity": 1
                                }
                            }
                        ]
                    }
                ]}
            />
        );
    }
}

export default Home;