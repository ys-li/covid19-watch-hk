import React, { useState } from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import classNames from "classnames";
import { districtCodeToName } from "../types/exposure";
//@ts-ignore
import { RadioSVGMap } from "react-svg-map";
//@ts-ignore
import HongKong from "@svg-maps/hong-kong";
import { COLOR_PALATTE } from "../pages/map";

const HKMap = ({ districtsCount, onSelect }: {
    districtsCount: Map<string, number>,
    onSelect: (district: string) => void
}) => {
    let [districtHovering, setDistrictHovering] = useState<string | undefined>(undefined);
    return (
        <>
            <Card id="location-tip" style={{ zIndex: 10, pointerEvents: 'none' }} className={classNames({
                "bg-secondary shadow border-0 rounded position-absolute fadeInDown animated d-none": true,
                "d-md-block": districtHovering !== undefined,
            })}>
                <CardBody className="px-5 py-3 text-center">
                    <b>{districtCodeToName(districtHovering!)}</b>
                    <br />
                    Exposures 接觸點: {districtsCount.get(districtHovering!) || 0}
                </CardBody>
            </Card>
            <div className="d-flex justify-content-between animated fadeIn">
                <div className="text-muted small unselectable text-right pb-2 pb-xl-0">
                    <Col>
                        <Row className="pb-1">
                            <div style={{
                                background: `linear-gradient(90deg, ${
                                    COLOR_PALATTE.map((color, i) => (
                                        `${color} ${i / (COLOR_PALATTE.length - 1) * 100}%`
                                    )).join(', ')
                                    })`,
                                width: '200px',
                                height: '7.5px',
                            }} className="shadow" />
                        </Row>
                        <Row>
                            <div className="w-100 d-flex justify-content-between">
                                <div>
                                    戒備 Alert
                                </div>
                                <div>
                                    高危 Risky
                                </div>
                            </div>
                        </Row>
                    </Col>
                </div>
                <div className="text-muted small unselectable text-right pb-2 pb-xl-0">
                    Click to show exposure history<br />
                    點擊地區觀看該區接觸病史
                </div>
            </div>

            <RadioSVGMap
                map={HongKong}
                //@ts-ignore
                onChange={(location: HTMLElement) => {
                    onSelect(location.id);
                }}
                //@ts-ignore
                onLocationMouseOver={(event) => {
                    let card = document.getElementById('location-tip');
                    if (card !== null) {
                        card.style.left = `${event.nativeEvent.offsetX}px`;
                        card.style.top = `${event.nativeEvent.offsetY}px`;
                    }
                    setDistrictHovering(event.target.id);
                }

                }
                //@ts-ignore
                onLocationMouseOut={(event) => {
                    setDistrictHovering(undefined);
                }

                }
            />
        </>
    )
}

export default HKMap;