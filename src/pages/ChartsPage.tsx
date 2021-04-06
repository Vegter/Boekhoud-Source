import React from 'react'
import { useSelector } from "react-redux"

import { selectPeriodFilter } from "../app/FilterSlice"
import { selectJournal, selectLedgerAllocations, selectLiquidAssets } from "../app/AccountingSlice"

import { Routes } from "../routes/routes"

import PageHeader from "./PageHeader"
import LiquidAssetsCharts from "../components/Charts/LiquidAssetsCharts"
import CounterpartiesCharts from "../components/Charts/CounterpartiesCharts"
import ProfitLossCharts from "../components/Charts/ProfitLossCharts"
import AllocationsChart from "../components/Charts/AllocationsChart"

function ChartsPage() {
    const liquidAssets = useSelector(selectLiquidAssets)
    const ledgerAllocations = useSelector(selectLedgerAllocations)
    const journal = useSelector(selectJournal)
    const periodFilter = useSelector(selectPeriodFilter)

    const filteredAssets = liquidAssets.filterOnPeriod(periodFilter)
    const filteredJournal = journal.filterOnPeriod(periodFilter)
    const allocations = ledgerAllocations.filterOnPeriod(periodFilter)

    return (
        <div>
            <PageHeader title={Routes.Charts}/>
            <LiquidAssetsCharts liquidAssets={filteredAssets}/>
            <CounterpartiesCharts liquidAssets={filteredAssets}/>
            <AllocationsChart allocations={allocations}/>
            <ProfitLossCharts journal={filteredJournal}/>
        </div>
    )
}

export default ChartsPage