import React, { useMemo } from 'react'
import { useSelector } from "react-redux";

import { selectJournal } from "../app/AccountingSlice"
import { selectPeriodFilter } from "../app/FilterSlice"

import { Routes } from "../routes/routes"

import TrialBalance from "../components/TrialBalance/TrialBalance"
import PageHeader from "./PageHeader"

function TrialBalancePage() {
    const journal = useSelector(selectJournal)
    const periodFilter = useSelector(selectPeriodFilter)

    const filteredJournal = useMemo(() => journal.filterOnPeriod(periodFilter), [journal, periodFilter])

    return (
        <div>
            <PageHeader title={Routes.TrialBalance}/>
            <TrialBalance journal={filteredJournal}/>
        </div>
    );
}

export default TrialBalancePage;