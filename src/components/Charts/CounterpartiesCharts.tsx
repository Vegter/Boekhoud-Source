import React from 'react'

import { Grid } from "@material-ui/core"

import { LiquidAssets } from "../../types/LiquidAssets/LiquidAssets"

import { getCounterPartiesData, splitData } from "./index"
import ExpenseRevenueChart, { ExpenseRevenueChartData } from "./ExpenseRevenueChart"

interface Props {
    liquidAssets: LiquidAssets
}

function CounterpartiesCharts(props: Props) {
    const {liquidAssets} = props

    const counterPartiesData: ExpenseRevenueChartData = getCounterPartiesData(liquidAssets)

    const [expenseData, revenueData] = splitData(counterPartiesData)

    return (
        <Grid container justify={"space-around"}>
            <Grid item>
                <ExpenseRevenueChart title={"Crediteuren"} data={expenseData} />
            </Grid>
            <Grid item>
                <ExpenseRevenueChart title={"Debiteuren"} data={revenueData} />
            </Grid>
        </Grid>
    )
}

export default CounterpartiesCharts;
