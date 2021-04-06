import React from 'react'
import { useDispatch } from "react-redux"

import { makeStyles, Paper, TableContainer, useMediaQuery } from "@material-ui/core"

import { Table, Thead, Tbody, Tr, Th, Td } from './ResponsiveTable';

import { linkBankAccount } from "../app/AccountingSlice"

import { BankAccount } from "../types/LiquidAssets/BankAccount"
import { LedgerAccount } from "../types/Ledger/LedgerAccount"
import { LedgerScheme } from "../types/Ledger/LedgerScheme"

import RGSAccountSelector from "./Editors/RGSAccountSelector"
import { LiquidAssets } from "../types/LiquidAssets/LiquidAssets"
import { createStyles, useTheme } from "@material-ui/core/styles"
import FormatAmount from "./Utils/FormatAmount"
import FormatDate from "./Utils/FormatDate"
import FormatIBAN from "./Utils/FormatIBAN"

const useStyles = makeStyles((/*theme: Theme*/) =>
    createStyles({
    table: {
    },
    date: {
        whiteSpace: "nowrap",
    },
    levelHeader: {
        fontWeight: 'bold'
    },
}));

interface BankAccountsProps {
    liquidAssets: LiquidAssets
}

function BankAccounts(props: BankAccountsProps) {
    const { liquidAssets } = props
    const classes = useStyles()
    const dispatch = useDispatch()
    const theme = useTheme();
    const onSm = useMediaQuery(theme.breakpoints.only('sm'));
    const onSmDown = useMediaQuery(theme.breakpoints.down('sm'));

    const bankAccounts = liquidAssets.bankAccounts

    const accountOptions = LedgerScheme.bankAccounts

    function updateLedgerAccount(bankAccount: BankAccount, ledgerAccount: LedgerAccount) {
        dispatch(linkBankAccount({bankAccountData: bankAccount.data, ledgerAccountData: ledgerAccount.data}))
    }

    const accountBalances = liquidAssets.getBalances()
    const [begin, end] = liquidAssets.getTotals(accountBalances)

    return (
        <div>
            <TableContainer component={Paper}>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Rekening</Th>
                            <Th align={"right"}>Saldo</Th>
                            <Th>{!onSm && "Datum"}</Th>
                            <Th align={"right"}>Saldo</Th>
                            <Th>{!onSm && "Datum"}</Th>
                            <Th align="left">RGS</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {bankAccounts.map(bankAccount => {
                            const balances = accountBalances[bankAccount.id]
                            const beginBalance = balances.beginBalance
                            const endBalance = balances.endBalance
                            return (
                                <Tr key={bankAccount.id}>
                                    <Td><FormatIBAN iban={bankAccount.IBAN}/></Td>
                                    <Td align="right">{beginBalance && <FormatAmount amount={beginBalance.amount} debitCredit={false}/>}</Td>
                                    <Td align="left" className={classes.date}>
                                        {!onSm && beginBalance && <FormatDate date={beginBalance.date}/>}
                                    </Td>
                                    <Td align="right">{endBalance && <FormatAmount amount={endBalance.amount} debitCredit={false}/>}</Td>
                                    <Td align="left" className={classes.date} >
                                        {!onSm && endBalance && <FormatDate date={endBalance.date}/>}
                                    </Td>
                                    <Td align="left" className={"noheader"}>
                                        <RGSAccountSelector ledgerAccount={bankAccount.ledgerAccount}
                                                            accountOptions={accountOptions}
                                                            onChange={(account: LedgerAccount) => updateLedgerAccount(bankAccount, account)}/>
                                    </Td>
                                </Tr>
                            )
                        })}

                        {!onSmDown &&<Tr className={classes.levelHeader}>
                            <Td className={classes.levelHeader}>Totaal</Td>
                            <Td align="right"><FormatAmount amount={begin} debitCredit={false}/></Td>
                            <Td align="left"/>
                            <Td align="right"><FormatAmount amount={end} debitCredit={false}/></Td>
                            <Td align="left"/>
                            <Td align="left"/>
                        </Tr>}

                    </Tbody>
                </Table>
            </TableContainer>
        </div>
    )
}

export default BankAccounts