import React from 'react'
import { Period } from "../../types/Period"

interface FormatPeriodProps {
    period: Period
}

function FormatPeriod(props: FormatPeriodProps) {
    const { period } = props

    return (
        <span>{period.format()}</span>
    )
}

export default FormatPeriod