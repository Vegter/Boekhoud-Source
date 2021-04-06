import React, { useMemo } from 'react'
import { Td, Tr } from "../ResponsiveTable"
import { IconButton, useMediaQuery } from "@material-ui/core"
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp"
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight"
import FormatAmount from "../Utils/FormatAmount"
import { BalanceDetails } from "./BalanceDetails"
import { useURLState } from "../useURLState"
import { useTheme } from "@material-ui/core/styles"
import { LedgerAccount } from "../../types/Ledger/LedgerAccount"
import { AccountSummaryMap } from "../../types/AccountSummaryMap"
import { useStyles } from "./Styling"
import { Journal } from "../../types/Journal/Journal"

interface BalanceRowProps {
    journal: Journal
    ledgerAccount: LedgerAccount,
    summary: AccountSummaryMap,
    viewPort: number
}

function BalanceRow(props: BalanceRowProps) {
    const [urlState, setURLState] = useURLState()

    const openAccountCodes = useMemo(() => urlState.getStringArrayValue("open"), [urlState])

    const { journal, ledgerAccount, summary, viewPort } = props

    const classes = useStyles()

    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'));

    const expandAccountCode = (id: string) => {
        const newOpen = openAccountCodes.includes(id)
            ? openAccountCodes.filter(s => s !== id)
            : (onXs ? [id] : [...openAccountCodes, id])
        setURLState({open: newOpen})
    }

    const { debitAmount, creditAmount, debitBalance, creditBalance, balance } = summary.getAccountSummary(ledgerAccount)
    const accountCode = ledgerAccount.code
    return (
        <>

            <Tr>
                <Td className={`${classes.mainDescription} noheader`}>
                    <IconButton aria-label="details" size="small" onClick={() => expandAccountCode(accountCode)}>
                        {openAccountCodes.includes(accountCode)
                            ? <KeyboardArrowUpIcon />
                            : <KeyboardArrowRightIcon />}
                    </IconButton>
                    {ledgerAccount.shortDescription}
                </Td>
                <Td align="right"><FormatAmount amount={debitAmount} debitCredit={true} skipIfZero={true}/></Td>
                <Td align="right"><FormatAmount amount={creditAmount} debitCredit={true} skipIfZero={true}/></Td>
                <Td align="right"><FormatAmount amount={debitBalance} debitCredit={true} skipIfZero={true}/></Td>
                <Td align="right"><FormatAmount amount={creditBalance} debitCredit={true} skipIfZero={true}/></Td>
                <Td align="right"><FormatAmount amount={balance} debitCredit={false}/></Td>
            </Tr>

            {openAccountCodes.includes(accountCode) &&
                <BalanceDetails journal={journal} account={ledgerAccount} loadMore={viewPort}/>
            }

        </>
    )
}

export default BalanceRow;
