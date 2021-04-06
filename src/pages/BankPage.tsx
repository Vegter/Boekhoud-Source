import React from 'react'
import { useSelector } from "react-redux"

import { selectLiquidAssets } from "../app/AccountingSlice"
import { selectPeriodFilter } from "../app/FilterSlice"

import BankAccounts from "../components/BankAccounts"
import PageHeader from "./PageHeader"
import { Routes } from "../routes/routes"

function BankPage() {
    const liquidAssets = useSelector(selectLiquidAssets)
    const periodFilter = useSelector(selectPeriodFilter)

    const filteredAssets = liquidAssets.filterOnPeriod(periodFilter)

    return (
        <div>
            <PageHeader title={Routes.Bank}/>
            <BankAccounts liquidAssets={filteredAssets} />
        </div>
    )
}

export default BankPage