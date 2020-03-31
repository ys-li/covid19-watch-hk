import { NavLink, Navbar, NavbarBrand, UncontrolledCollapse, Row, Col, Nav, NavItem, Container } from "reactstrap";

import React from "react";
import { Link } from "gatsby";

const MainNavBar = () => (
    <Navbar
        className="navbar-horizontal navbar-dark bg-default"
        expand="lg"
    >
        <Container>
            <NavbarBrand className="unselectable text-secondary" to="/" tag={Link}>
                <div className="d-flex align-items-center">
                    <div className="pr-2">
                        <img alt="Logo" src={require("../assets/logo/logo.png")} style={{
                            width: "50px",
                            height: "50px"
                        }} />
                    </div>
                    <div>
                        WARS<br /><b>WATCH</b>.HK
                    </div>
                </div>

            </NavbarBrand>
            <button
                aria-controls="navbar-default"
                aria-expanded={false}
                aria-label="Toggle navigation"
                className="navbar-toggler"
                data-target="#navbar-default"
                data-toggle="collapse"
                id="navbar-default"
                type="button"
            >
                <span className="navbar-toggler-icon" />
            </button>
            <UncontrolledCollapse navbar toggler="#navbar-default">
                <div className="navbar-collapse-header">
                    <Row>
                        <Col className="collapse-close" xs="6">
                            <button
                                aria-controls="navbar-default"
                                aria-expanded={false}
                                aria-label="Toggle navigation"
                                className="navbar-toggler"
                                data-target="#navbar-default"
                                data-toggle="collapse"
                                id="navbar-default"
                                type="button"
                            >
                                <span />
                                <span />
                            </button>
                        </Col>
                    </Row>
                </div>
                <Nav className="ml-lg-auto" navbar>
                    <NavItem className="align-self-center">
                        <Link className="nav-link" to="/">
                            <span>
                                接觸地圖 Exposure Map
                            </span>
                        </Link>
                    </NavItem>
                    <NavItem className="align-self-center">
                        <Link className="nav-link" to="/all-cases">
                            <span>
                                所有確診者 All cases
                            </span>
                        </Link>
                    </NavItem>
                    <NavItem className="align-self-center">
                        <NavLink
                            className="nav-link"
                            href="https://wars.vote4.hk/"
                        >
                            <span>
                                更多防疫資訊<br/><small>(WARS.VOTE4.HK)</small>
                            </span>
                        </NavLink>
                    </NavItem>

                </Nav>
            </UncontrolledCollapse>
        </Container>
    </Navbar>
);

export default MainNavBar;