import React, { useState } from 'react';
import '@firebase/firestore';
import { Container, Card, CardHeader, CardBody, Table, Row, Col, Modal } from 'reactstrap';
import chroma from 'chroma-js';
import classNames from 'classnames';
import { districtCodeToName } from '../types/exposure';
import MainNavBar from '../components/MainNavBar';
//@ts-ignore
import CaseChart from '../components/Charts';
import HKMap from '../components/HKMap';
import { Case } from '../types/case';
import OverviewPanel from '../components/OverviewPanel';
import SEO from '../components/seo';
import { useCases } from '../hooks/use-cases';

interface PageMapProps extends React.HTMLAttributes<HTMLElement> {
    cases: Case[];
}

interface PageMapState {
    districtSelected: string | undefined;
    districtHovering: string | undefined;
}

export const COLOR_PALATTE = ["#ffe270", "#ffa33b", "#fc2b2b", "#ad2121"]
const COLOR_THRESHOLD = new Map<number, number>(
    [
        [0, 0.],
        [3, 0.25],
        [10, 0.5],
        [20, 0.75],
        [50, 1.0]
    ]
); // Absolute number of cases to be passed before advancing to the next color

export const getShiftDate = (date: Date, shift: number) => new Date(date.setDate(date.getDate() + shift));
export const getConfirmedCount = (cases: Case[], date: Date): number => cases.filter((c) => c.patientId < 0 ? false : c.confirmTimestamp <= date).length;
const scrollToRef = (ref: HTMLDivElement) => window.scrollTo(0, ref.offsetTop);

class PageMap extends React.Component<PageMapProps, PageMapState> {

    districtsCount = new Map<string, number>();
    exposuresRef: HTMLDivElement | null;

    constructor(props: PageMapProps) {
        super(props);
        this.state = {
            districtSelected: undefined,
            districtHovering: undefined,
        }
        this.setRegionsFill = this.setRegionsFill.bind(this);
        this.exposuresRef = null;
    }


    setRegionsFill(cases: Case[]) {
        let districtsCount = this.districtsCount;
        this.districtsCount.clear();

        // count cases
        cases.forEach(c => {
            c.exposures.forEach((e) => {
                if (districtsCount.has(e.district)) {
                    //@ts-ignore
                    districtsCount.set(e.district, districtsCount.get(e.district) + 1);
                } else {
                    districtsCount.set(e.district, 1);
                }
            })
        });

        // find max number of cases
        var maxCases = 1;
        //@ts-ignore
        // eslint-disable-next-line
        for (let [district, count] of districtsCount.entries()) {
            if (count > maxCases) {
                maxCases = count;
            }
        }


        let elements = document.getElementById('district-map')!.getElementsByTagName('path');
        for (let i = 0; i < elements.length; i++) {
            if (/*this.state.districtSelected === elements[i].id || */!(districtsCount.has(elements[i].id)) || districtsCount.get(elements[i].id) === 0) {
                // clear
                elements[i].setAttribute('style', '')
                continue;
            }
            var colorThreshold = 0.;

            //@ts-ignore
            for (let [absT, colorT] of COLOR_THRESHOLD) {
                //@ts-ignore
                if (districtsCount.get(elements[i].id) > absT) {
                    //@ts-ignore
                    colorThreshold = colorT
                }
            }


            //@ts-ignore
            var colorGrad = (districtsCount.get(elements[i].id) / maxCases);
            if (colorGrad > colorThreshold)
                colorGrad = colorThreshold
            // set up palattes
            let colormap = chroma.scale(COLOR_PALATTE).mode('lab');

            elements[i].setAttribute('style', `fill: ${colormap(colorGrad).hex()}`)
        }
    }

    componentDidMount() {
        setTimeout(() => this.setRegionsFill(this.props.cases)).toString();
    }

    render() {
        let cases = this.props.cases;
        return <>
            <MainNavBar />
            <Container fluid>
                <Row>
                    <Col xs="12" xl="4" className="my-5">
                        <Card className="shadow unselectable">
                            <CardHeader>
                                <OverviewPanel cases={cases} />
                            </CardHeader>
                            <CardBody style={{
                                height: '40vh'
                            }}>
                                <CaseChart cases={cases} />
                            </CardBody>
                        </Card>
                        <div className="p-2 text-muted small text-right w-100">
                            Updated at 更新於: {cases[0].updatedAtEnglish}
                        </div>

                    </Col>
                    <Col xs="12" xl="8" className="pb-5 pt-xl-5">
                        <div style={{ maxWidth: '95%' }} id="district-map" className="mx-auto ">
                            <HKMap
                                districtsCount={this.districtsCount}
                                onSelect={
                                    (district) => {
                                        setTimeout(() => scrollToRef(this.exposuresRef!), 50);
                                        this.setState({
                                            districtSelected: district
                                        });
                                    }
                                }
                            />
                        </div>

                    </Col>
                </Row>
                <div ref={(ref) => this.exposuresRef = ref}>
                    <Card className={classNames({
                        "bg-secondary shadow border-0 mb-5 animated fadeIn": true,
                        "d-none": this.state.districtSelected === undefined,
                    })}>
                        <CardHeader>
                            <div className="text-center mt-2 mb-2">
                                <h5 className="font-weight">
                                    {districtCodeToName(this.state.districtSelected!)}<br />
                                    <span className="h6">Exposures 接觸點: {this.districtsCount.get(this.state.districtSelected!)}</span>
                                </h5>
                            </div>
                        </CardHeader>
                        <CardBody className="p-0">

                            <ExposureTable
                                cases={cases}
                                districtSelected={this.state.districtSelected}
                            />

                        </CardBody>
                    </Card>
                </div>
            </Container>
        </>;
    }
}

export default () => {
    return <>
      <SEO title="Wars Watch HK - Wuhan Coronavirus (2019-nCoV) HK Monitor" />
      <PageMap cases={useCases()} />;
    </>
};

const ExposureTable = ({ cases, districtSelected }: { cases: Case[], districtSelected: string | undefined }) => {
    let filteredCases = cases.filter((c) => c.exposuresByDistrict(districtSelected).length > 0);
    let [address, setAddress] = useState<string | undefined>(undefined);
    if (filteredCases.length === 0) {
        return <div className="p-2 w-100 text-center">
            <h6>No recorded exposures so far.<br />暫未有個案</h6>
        </div>;
    }
    return districtSelected === undefined ? null :
        <>
            <Modal
                className="modal-dialog-centered map-modal"
                isOpen={address !== undefined}
                toggle={() => setAddress(undefined)}>
                {
                    address === undefined ? null :
                        <iframe
                            title="Map"
                            frameBorder="0"
                            className="map-modal border-0"
                            src={`https://www.google.com/maps/embed/v1/place?key={API_KEY}&q=${address.replace(' ', '+')}+香港`} allowFullScreen>
                        </iframe>
                }
            </Modal>
            <div className="d-none d-lg-block">
                <Table className="table-striped">
                    <thead>
                        <tr>
                            <th>Confirmed Case 確診病例</th>
                            <th>Exposure Date 日期</th>
                            <th>Location 地點</th>
                            <th>Patient 病人</th>
                            <th>History 病史</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCases.map((c) => (
                            c.exposuresByDistrict(districtSelected).map((e) =>
                                <tr key={e.patientId}>
                                    <th scope="row">{c.patientId > 0 ? c.patientId : "外地"}</th>
                                    <td>{e.timestampEnglish}</td>
                                    <td><u style={{ cursor: 'pointer' }}><span onClick={() => setAddress(e.address)}>{e.address}</span></u></td>
                                    <td>{c.sex}/{c.age}</td>
                                    <td>{c.history.split('\n').map((s, i) => (
                                        <div key={i} className="w-100">
                                            <div dangerouslySetInnerHTML={{ __html: s }} />
                                        </div>
                                    ))}</td >
                                </tr>
                            )
                        ))}
                    </tbody>

                </Table>
            </div>
            <div className="d-block d-lg-none pt-4 px-4">
                <Col>
                    {filteredCases.map((c) => (
                        c.exposuresByDistrict(districtSelected).map((e) => (
                            <React.Fragment key={c.patientId}>
                                <Row className="pb-3 font-weight-bold">
                                    <div className="d-block w-100">{c.patientId > 0 ? `Confirmed Case 確診病例 #${c.patientId}` : "Confirmed Case 確診病例 外地"}</div>
                                    <div className="d-block w-100">{e.timestampEnglish} <br /></div>
                                    <div className="d-block w-100">{c.sex}/{c.age} <br /></div>
                                    <div className="d-block w-100"><u style={{ cursor: 'pointer' }}><span onClick={() => setAddress(e.address)}>{e.address}</span></u></div>
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
                        )))
                    )}
                </Col>
            </div>
        </>
};