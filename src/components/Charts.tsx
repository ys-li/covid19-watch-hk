import React from 'react'
import { getShiftDate, getConfirmedCount } from '../pages/map';
import { Case } from '../types/case';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Graph configurations
const MAX_LOOKBACK = 14;

function CaseChart({ cases }: { cases: Case[] }) {
    const data = React.useMemo(
        () => dataFromCases(cases),
        [cases]
    )

    return (
        // A react-chart hyper-responsively and continuusly fills the available
        // space of its parent element automatically
        <>
            <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={data}>
                    <Line type="monotone" dataKey="Cases" stroke="#8884d8" />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                </LineChart>
            </ResponsiveContainer>
        </>
    )
}

export const dataFromCases = function (cases: Case[]) {
    let data = [];
    for (let i = -MAX_LOOKBACK; i <= 0; i++) {
        let dateThreshold = getShiftDate(new Date(), i);
        data.push({
            name: `${dateThreshold.getDate()}/${dateThreshold.getMonth() + 1}`,
            Cases: getConfirmedCount(cases, dateThreshold)
        })
    }
    return data;
}

export default CaseChart;