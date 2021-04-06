import React from 'react'

import { Grid } from "@material-ui/core"

import { Journal } from "../../types/Journal/Journal"
import { AccountSummaryMap } from "../../types/AccountSummaryMap"

import { getProfitLossData, splitData } from "./index"
import ExpenseRevenueChart, { ExpenseRevenueChartData } from "./ExpenseRevenueChart"

interface Props {
    journal: Journal
}

function ProfitLossCharts(props: Props) {
    const { journal } = props

    const journalEntries = journal.journalEntries
    const summary = new AccountSummaryMap(journalEntries)
    const accounts = summary.getAccounts()

    const counterPartiesData: ExpenseRevenueChartData = getProfitLossData(summary, accounts)

    const [revenueData, expenseData] = splitData(counterPartiesData)

    return (
        <Grid container justify={"space-around"}>
            <Grid item>
                <ExpenseRevenueChart title={"Uitgaven"} data={expenseData} />
            </Grid>
            <Grid item>
                <ExpenseRevenueChart title={"Ontvangsten"} data={revenueData} />
            </Grid>
        </Grid>
    )
}

export default ProfitLossCharts