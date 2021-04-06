import React from 'react'

import { Grid } from "@material-ui/core"

import { LiquidAssets } from "../../types/LiquidAssets/LiquidAssets"
import BankAccountChart from "./BankAccountChart"

interface Props {
    liquidAssets: LiquidAssets
}

export default function LiquidAssetsCharts(props: Props) {
    const { liquidAssets } = props
    const { bankAccounts } = liquidAssets

    return (
        <Grid container justify={"space-around"}>
            {bankAccounts.map(bankAccount => {
                return (
                    <Grid item key={bankAccount.id}>
                        <BankAccountChart bankAccount={bankAccount} />
                    </Grid>
                )
            })}
        </Grid>
    )
}