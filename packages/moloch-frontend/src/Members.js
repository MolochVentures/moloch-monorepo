import React, { Component } from 'react';
import { Glyphicon, Image } from 'react-bootstrap';
import './App.css';

class Members extends Component {
    constructor(props) {
        super(props);

        this.loadMemberDetail = this.loadMemberDetail.bind(this);
    }

    loadMemberDetail() {
        this.props.onLoadMemberDetail();
    }

    render() {
      return (
        <div>
            <a href="#"><Glyphicon glyph="times" /></a>
            <p>57 Members</p>
            <h3>Ranking</h3>
            <div className="MembersContainer">
                <div className="Member">
                    <Image className="MemberImage" src={require('./assets/UserImg.png')} onClick={this.loadMemberDetail}></Image>
                    <h5>Malcom Jans</h5>
                    <p>78</p>
                    <p>Shares</p>
                </div>
            </div>
            <h5>Elders</h5>
            <div className="MembersContainer">
                <div className="Member">
                    <Image className="MemberImage" src={require('./assets/UserImg.png')} onClick={this.loadMemberDetail}></Image>
                    <h5>Malcom Jans</h5>
                    <p>78</p>
                    <p>Shares</p>
                </div>
                <div className="Member">
                    <Image className="MemberImage" src={require('./assets/UserImg.png')} onClick={this.loadMemberDetail}></Image>
                    <h5>Malcom Jans</h5>
                    <p>78</p>
                    <p>Shares</p>
                </div>
                <div className="Member">
                    <Image className="MemberImage" src={require('./assets/UserImg.png')} onClick={this.loadMemberDetail}></Image>
                    <h5>Malcom Jans</h5>
                    <p>78</p>
                    <p>Shares</p>
                </div>
                <div className="Member">
                    <Image className="MemberImage" src={require('./assets/UserImg.png')} onClick={this.loadMemberDetail}></Image>
                    <h5>Malcom Jans</h5>
                    <p>78</p>
                    <p>Shares</p>
                </div>
                <div className="Member">
                    <Image className="MemberImage" src={require('./assets/UserImg.png')} onClick={this.loadMemberDetail}></Image>
                    <h5>Malcom Jans</h5>
                    <p>78</p>
                    <p>Shares</p>
                </div>
                <div className="Member">
                    <Image className="MemberImage" src={require('./assets/UserImg.png')} onClick={this.loadMemberDetail}></Image>
                    <h5>Malcom Jans</h5>
                    <p>78</p>
                    <p>Shares</p>
                </div>
            </div>
        </div>
      );
    }
}

export default Members;