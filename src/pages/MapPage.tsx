import React, { useMemo } from 'react'
import { useSelector } from "react-redux";

import { selectLedgerAllocations, selectLiquidAssets } from "../app/AccountingSlice"
import { selectPeriodFilter } from "../app/FilterSlice"

import { Routes } from "../routes/routes"

import StatementAllocations from "../components/Allocations/StatementAllocations";
import PageHeader from "./PageHeader"

function MapPage() {
    const liquidAssets = useSelector(selectLiquidAssets)
    const ledgerAllocations = useSelector(selectLedgerAllocations)
    const periodFilter = useSelector(selectPeriodFilter)

    const allocations = useMemo(() => ledgerAllocations.filterOnPeriod(periodFilter), [ledgerAllocations, periodFilter])
    const statementEntryMap = useMemo(() => liquidAssets.getStatementEntryMap(), [liquidAssets])

    return (
        <div>
            <PageHeader title={Routes.Map}/>
            <StatementAllocations statements={statementEntryMap}
                                  allocations={allocations}/>
        </div>
    );
}

export default MapPage;