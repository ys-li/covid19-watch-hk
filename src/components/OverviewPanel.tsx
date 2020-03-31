import { Case } from "../types/case"

import React from "react"

import { getConfirmedCount, getShiftDate } from "../pages/map"

const OverviewPanel = ({ cases }: { cases: Case[] }) => {
    return <div className="d-flex">
        <div className="flex-grow-1 h5">
            Confirmed Cases <br />確診個案
        </div>
        <div className="align-self-center h4">
            {getConfirmedCount(cases, new Date())}
            {
                <span className="h6">
                    ▲{getConfirmedCount(cases, new Date()) - getConfirmedCount(cases, getShiftDate(new Date(), -1))}
                </span>
            }
        </div>
    </div>
}

export default OverviewPanel;