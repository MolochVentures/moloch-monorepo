import React, { Component } from 'react';
import './App.css';
import { Glyphicon, Badge } from 'react-bootstrap';
import { ResponsiveBar } from '@nivo/bar';

class Proposals extends Component {
    constructor(props) {
        super(props);

        this.loadProposalDetail = this.loadProposalDetail.bind(this);
    }

    loadProposalDetail() {
        this.props.onLoadProposalDetail();
    }

    render() {
      return (
        <div>
            <a href="#"><Glyphicon glyph="times" /></a>
            <p>3 Proposals</p>
            <h3>Active</h3>
            <div className="ProposalsContainer">
                <div className="Proposal MarginRight40" onClick={this.loadProposalDetail}>
                    <h3>ETH Proposal</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing eli minim veniam, quis nostrud exercitation ull lorem ipsuolor sit amet.</p>
                    <div className="ProposalSubcontentContainer MarginTop30">
                        <div className="ProposalSubcontent">
                            <p>Tribute value</p>
                            <h3>$3000</h3>
                        </div>
                        <div className="VerticalDivider"></div>
                        <div className="ProposalSubcontent">
                            <p>Voting shares</p>
                            <h3>200</h3>
                        </div>
                    </div>
                    <div className="ProposalSubcontentContainer MarginTop30">
                        <Badge className="ProposalSubcontent VotingBadges MarginRight40">Voting ends: 12 Days</Badge>
                        <Badge className="ProposalSubcontent VotingBadges">Grace period: 1 Day</Badge>
                    </div>
                    <div className="VotesGraphContainer MarginTop30">
                        <VotesGraph></VotesGraph>
                    </div>
                </div>
                <div className="Proposal MarginRight40" onClick={this.loadProposalDetail}>
                    <h3>ETH Proposal</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing eli minim veniam, quis nostrud exercitation ull lorem ipsuolor sit amet.</p>
                    <div className="ProposalSubcontentContainer MarginTop30">
                        <div className="ProposalSubcontent">
                            <p>Tribute value</p>
                            <h3>$3000</h3>
                        </div>
                        <div className="VerticalDivider"></div>
                        <div className="ProposalSubcontent">
                            <p>Voting shares</p>
                            <h3>200</h3>
                        </div>
                    </div>
                    <div className="ProposalSubcontentContainer MarginTop30">
                        <Badge className="ProposalSubcontent VotingBadges MarginRight40">Voting ends: 12 Days</Badge>
                        <Badge className="ProposalSubcontent VotingBadges">Grace period: 1 Day</Badge>
                    </div>
                    <div className="VotesGraphContainer MarginTop30">
                        <VotesGraph></VotesGraph>
                    </div>
                </div>
                <div className="Proposal MarginRight40" onClick={this.loadProposalDetail}>
                    <h3>ETH Proposal</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing eli minim veniam, quis nostrud exercitation ull lorem ipsuolor sit amet.</p>
                    <div className="ProposalSubcontentContainer MarginTop30">
                        <div className="ProposalSubcontent">
                            <p>Tribute value</p>
                            <h3>$3000</h3>
                        </div>
                        <div className="VerticalDivider"></div>
                        <div className="ProposalSubcontent">
                            <p>Voting shares</p>
                            <h3>200</h3>
                        </div>
                    </div>
                    <div className="ProposalSubcontentContainer MarginTop30">
                        <Badge className="ProposalSubcontent VotingBadges MarginRight40">Voting ends: 12 Days</Badge>
                        <Badge className="ProposalSubcontent VotingBadges">Grace period: 1 Day</Badge>
                    </div>
                    <div className="VotesGraphContainer MarginTop30">
                        <VotesGraph></VotesGraph>
                    </div>
                </div>
            </div>
        </div>
      );
    }
}

class VotesGraph extends Component {
    render() {
        const data = [
            {
              "votes": "Votes",
              "yes": 30,
              "yesColor": "hsl(251, 70%, 50%)",
              "no": 18,
              "noColor": "hsl(185, 70%, 50%)",
              "quorum": 52,
              "quorumColor": "hsl(40, 70%, 50%)"
            }
        ];

        return(
            <ResponsiveBar
                data={data}
                keys={[
                    "yes",
                    "no",
                    "quorum"
                ]}
                indexBy="votes"
                margin={{
                    "top": 50,
                    "right": 130,
                    "bottom": 50,
                    "left": 60
                }}
                padding={0.3}
                layout="horizontal"
                colors={["#99ff99","#ff6666","#e6e6e6"]}
                colorBy="id"
                defs={[
                    {
                        "id": "yes",
                        "type": "patternDots",
                        "background": "inherit",
                        "color": "#38bcb2",
                        "size": 4,
                        "padding": 1,
                        "stagger": true
                    },
                    {
                        "id": "no",
                        "type": "patternLines",
                        "background": "inherit",
                        "color": "#eed312",
                        "rotation": -45,
                        "lineWidth": 6,
                        "spacing": 10
                    },
                    {
                        "id": "quorum",
                        "type": "patternLines",
                        "background": "#bcbcbc",
                        "color": "#bcbcbc",
                        "rotation": -45,
                        "lineWidth": 6,
                        "spacing": 10
                    }
                ]}
                borderColor="inherit:darker(1.6)"
                axisTop={null}
                axisRight={null}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="#737373"
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                legends={[
                    {
                        "dataFrom": "keys",
                        "anchor": "bottom-right",
                        "direction": "column",
                        "justify": false,
                        "translateX": 120,
                        "translateY": 0,
                        "itemsSpacing": 2,
                        "itemWidth": 100,
                        "itemHeight": 20,
                        "itemDirection": "left-to-right",
                        "itemOpacity": 0.85,
                        "symbolSize": 20,
                        "effects": [
                            {
                                "on": "hover",
                                "style": {
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

export default Proposals;