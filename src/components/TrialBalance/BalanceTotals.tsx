import { AccountSummaryMap } from "../../types/AccountSummaryMap"
import { Td, Tr } from "../ResponsiveTable"
import FormatAmount from "../Utils/FormatAmount"
import React from "react"
import { useStyles } from "./Styling"
import { LedgerAccount } from "../../types/Ledger/LedgerAccount"

interface BalanceTotalsProps {
    children: React.ReactNode
    summary: AccountSummaryMap
    filter?: (account: LedgerAccount) => boolean
}

export function BalanceTotals(props: BalanceTotalsProps) {
    const classes = useStyles()

    const { children, summary, filter } = props

    const overallTotals = summary.getTotalisation(filter)
    return (
        <>
            <Tr className={classes.levelHeader}>
                <Td className={classes.levelHeader}>
                    {children}
                </Td>
                {overallTotals && [
                    overallTotals.debitAmount,
                    overallTotals.creditAmount,
                    overallTotals.debitBalance,
                    overallTotals.creditBalance,
                    overallTotals.balance,
                ].map((v, i) =>
                    <Td key={i}
                        className={classes.levelHeader}
                        align="right">
                        <FormatAmount amount={v} debitCredit={i !== 4}/>
                    </Td>)}
            </Tr>
        </>
)
}