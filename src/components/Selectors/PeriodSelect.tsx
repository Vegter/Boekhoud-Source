import React from 'react'

import ItemSelect from "./ItemSelect"

import { Period } from "../../types/Period"
import { LedgerAllocationMap } from "../../types/Allocation/LedgerAllocationMap"
import { AllocationFilter } from "../../types/AllocationFilter"

interface Props {
    title: string
    width: number
    allocations: LedgerAllocationMap
    allocationFilter: AllocationFilter
    onPeriod: (period: Period | null) => void
}

function PeriodSelect(props: Props) {
    const { width, allocations, allocationFilter, onPeriod } = props

    const { period: periodFilter } = allocationFilter

    const periods = allocations.getPeriods()
    const period = periods.find(p => periodFilter && p.equals(periodFilter)) || null

    const items = periods.map(period => period.string)
    const item = period ? period.string : ""

    const title = periodFilter && !item ? periodFilter.string : props.title

    function onItem(item: string | null) {
        const period = item ? periods.find(period => period.string === item) : null
        onPeriod(period ?? null)
    }

    return (
        <ItemSelect title={title} width={width} items={items} item={item} onItem={onItem} />
    )
}

function areEqual(prevProps: Props, nextProps: Props) {
    return prevProps.allocationFilter.period?.id === nextProps.allocationFilter.period?.id
}

export default React.memo(PeriodSelect, areEqual)