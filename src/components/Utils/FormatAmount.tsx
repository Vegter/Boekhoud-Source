import React from 'react'
import { Amount } from "../../types/Amount"
import { makeStyles } from "@material-ui/core"
import { createStyles, Theme } from "@material-ui/core/styles"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        negativeAmount: {
            color: theme.palette.error.dark
        },
    }));

interface AmountProps {
    amount: Amount
    debitCredit: boolean
    skipIfZero?: boolean
    precision?: number
}

function FormatAmount(props: AmountProps) {
    const { amount, debitCredit, precision = 2, skipIfZero = false } = props
    const classes = useStyles()

    const reversed = amount.isDebit && debitCredit
    const className = amount.isDebit && !debitCredit
        ? classes.negativeAmount
        : ""

    if (skipIfZero && amount.isZero()) {
        return null
    }

    return (
        <span className={className}>
            {amount.format({reversed, precision})}
        </span>
    )
}

export default FormatAmount