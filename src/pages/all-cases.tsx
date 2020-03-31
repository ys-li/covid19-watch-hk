import React from 'react';
import '@firebase/firestore';
import { Container, Card, CardHeader, CardBody, Table, Row, Col, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import MainNavBar from '../components/MainNavBar';
//@ts-ignore
import CaseChart from '../components/Charts';
import { Case, CaseSchema } from '../types/case';
import OverviewPanel from '../components/OverviewPanel';
import Calendar from 'react-calendar/dist/entry.nostyle';
import { useStaticQuery, graphql } from 'gatsby';
import SEO from '../components/seo';
import { useCases } from '../hooks/use-cases';

interface PageAllCasesProps extends React.HTMLAttributes<HTMLElement> {
    cases: Case[];
}

interface PageAllCasesState {
    filteredDates: Date[] | undefined;
    sortBy: string;
}

export const getShiftDate = (date: Date, shift: number) => new Date(date.setDate(date.getDate() + shift));
export const getConfirmedCount = (cases: Case[], date: Date): number => cases.filter((c) => c.confirmTimestamp <= date).length;
export const sortCasesBy = (cases: Case[], attr: string, direction: string) => {
    switch (attr) {
        case "timestamp":
            cases = cases.sort((a, b) => {
                if (direction === 'asc') {
                    return a.confirmTimestamp > b.confirmTimestamp ? 1 : -1;
                }
                return a.confirmTimestamp < b.confirmTimestamp ? 1 : -1;
            })
            break;
        default:
            break;
    }
    return cases;
};

const filterAndSortCases = (cases: Case[], dates: Date[] | undefined, attr: string, direction: string) => {
    if (dates !== undefined) {
        cases = cases.filter((c) => c.confirmTimestamp >= dates[0] && c.confirmTimestamp <= dates[1]);
    }
    cases = sortCasesBy(cases, attr, direction);
    return cases;
}

class PageAllCases extends React.Component<PageAllCasesProps, PageAllCasesState> {

    constructor(props: PageAllCasesProps) {
        super(props);
        this.state = {
            filteredDates: undefined,
            sortBy: "timestamp:desc"
        }
    }

    render() {
        let cases = this.props.cases;
        return <>
            <MainNavBar />
            <Container fluid>
                <Row>
                    <Col xs="12" xl="4">
                        <Card className="my-5 shadow unselectable">
                            <CardHeader>
                                <OverviewPanel cases={cases} />
                            </CardHeader>
                            <CardBody style={{
                                height: '40vh'
                            }}>
                                <CaseChart cases={cases} />
                            </CardBody>
                        </Card>
                        <div className="p-2 text-muted small text-right w-100 unselectable">
                            Updated at 更新於: {cases[0].updatedAtEnglish}
                        </div>

                    </Col>
                    <Col xs="12" xl="8" className="pb-5">
                        <Card className="bg-secondary shadow border-0 mb-5 animated fadeIn mt-xl-5">
                            <CardHeader>
                                <div className="text-center mt-2 mb-2">
                                    <Row>
                                        <Col xs="2" className="text-left">
                                            <UncontrolledDropdown>
                                                <DropdownToggle
                                                    data-toggle="dropdown"
                                                    className="btn-white my-1"
                                                    size="sm">
                                                    <i className="fas fa-calendar-alt"></i>
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    <div>
                                                        <Calendar
                                                            selectRange={true}
                                                            value={this.state.filteredDates}
                                                            //@ts-ignore
                                                            onChange={(dates) => this.setState({ filteredDates: dates })}
                                                        />
                                                    </div>
                                                    <DropdownItem onClick={() => this.setState({ filteredDates: undefined })}>
                                                        All time 所有時間
                                                        </DropdownItem>
                                                </DropdownMenu>
                                            </UncontrolledDropdown>
                                            <UncontrolledDropdown>
                                                <DropdownToggle
                                                    data-toggle="dropdown my-1"
                                                    className="btn-white"
                                                    size="sm">
                                                    <i className="fas fa-filter"></i>
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    <DropdownItem onClick={() => this.setState({
                                                        sortBy: "timestamp:desc"
                                                    })}>
                                                        Date - Descending<br />從最新
                                                        </DropdownItem>
                                                    <DropdownItem onClick={() => this.setState({
                                                        sortBy: "timestamp:asc"
                                                    })}>
                                                        Date - Ascending<br />從最舊
                                                        </DropdownItem>
                                                </DropdownMenu>
                                            </UncontrolledDropdown>
                                        </Col>
                                        <Col xs="8" className="align-self-center">Confirmed Cases 確診病例</Col>
                                        <Col xs="2">

                                        </Col>
                                    </Row>
                                </div>
                            </CardHeader>
                            <CardBody className="p-0">

                                <CasesTable
                                    cases={filterAndSortCases(cases, this.state.filteredDates, this.state.sortBy.split(':')[0], this.state.sortBy.split(':')[1])}
                                />

                            </CardBody>
                        </Card>

                    </Col>
                </Row>
            </Container>
        </>;
    }
}

export default () => {
    return <>
        <SEO title="Wars Watch HK - Wuhan Coronavirus (2019-nCoV) HK Monitor" />
        <PageAllCases cases={useCases()} />;
    </>
};

const CasesTable = ({ cases }: { cases: Case[] }) => {
    let filteredCases = cases;
    if (filteredCases.length === 0) {
        return <div className="p-2 w-100 text-center">
            <h6>No recorded exposures so far in the selected period of time.<br />選擇時間內沒有已登記接觸點</h6>
        </div>;
    }
    return (
        <>
            <div className="d-none d-lg-inline-block">
                <Table className="table-striped">
                    <thead>
                        <tr>
                            <th>Confirmed Case 確診病例</th>
                            <th>Diagnosed Date 確診日期</th>
                            <th>Patient 病人</th>
                            <th>History 病史</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCases.map((c) => (
                            <tr key={c.patientId}>
                                <th scope="row">{c.patientId > 0 ? c.patientId : "外地"}</th>
                                <td>{c.timestampEnglish}</td>
                                <td>{c.sex}/{c.age}</td>
                                <td>{c.history.split('\n').map((s, i) => (
                                    <div key={i} className="w-100">
                                        <div dangerouslySetInnerHTML={{ __html: s }} />
                                    </div>
                                ))}</td >
                            </tr>
                        ))}
                    </tbody>

                </Table>
            </div>
            <div className="d-inline-block d-lg-none pt-4 px-4">
                <Col>
                    {filteredCases.map((c) => (
                        <React.Fragment key={c.patientId}>
                            <Row className="pb-3 font-weight-bold">
                                {c.patientId > 0 ? `Confirmed Case 確診病例 #${c.patientId}` : "Confirmed Case 確診病例 外地"}<br />
                                {c.timestampEnglish} <br />
                                {c.sex}/{c.age}
                            </Row>
                            <Row>
                                {c.history.split('\n').map((s, i) => (
                                    <div key={i} className="w-100">
                                        <div dangerouslySetInnerHTML={{ __html: s }} />
                                    </div>
                                ))}
                            </Row>
                            <hr />
                        </React.Fragment>
                    ))}
                </Col>
            </div>
        </>
    );
};