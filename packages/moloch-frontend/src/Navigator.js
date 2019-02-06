import React, { Component } from 'react';
import { Navbar, Nav, NavItem, Glyphicon } from 'react-bootstrap';
import './App.css';

class Navigator extends Component {
    render() {
      return (
        <Navbar inverse collapseOnSelect className="NavbarMoloch">
          <Navbar.Header>
            <Navbar.Brand>
              <a href="#brand"><Glyphicon glyph="align-left" /></a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavItem eventKey={1} href="#">
                MOLOCH
              </NavItem>
            </Nav>
            <Nav pullRight>
              <NavItem eventKey={1} href="#">
                <i className="fas fa-user-circle"></i>
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      );
    }
}

export default Navigator;