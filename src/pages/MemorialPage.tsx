import React, { useEffect } from 'react'
import { useDispatch } from "react-redux"
import { useHistory, useLocation } from "react-router-dom"
import { deleteJournalEntry, updateJournalEntry } from "../app/AccountingSlice"

import { createStyles, makeStyles } from "@material-ui/core/styles"
import { Grid, Paper, TextField } from "@material-ui/core"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import DeleteIcon from "@material-ui/icons/Delete"
import AddIcon from "@material-ui/icons/Add"

import { Routes } from "../routes/routes"
import PageHeader from "./PageHeader"
import DateSelector from "../components/Selectors/DateSelector"
import FormatAmount from "../components/Utils/FormatAmount"
import RGSAccountSelector from "../components/Editors/RGSAccountSelector"
import VATAmount from "../components/VAT/VATAmount"
import { Table, Thead, Tr, Th, Tbody, Td } from "../components/ResponsiveTable"

import { LedgerAccount } from "../types/Ledger/LedgerAccount"
import { LedgerScheme } from "../types/Ledger/LedgerScheme"
import { Accounting } from "../types/Accounting"
import { Amount, CreditDebit } from "../types/Amount"
import { JournalEditor } from "../types/Journal/JournalEditor"
import { JournalEntry } from "../types/Journal/JournalEntry"

const useStyles = makeStyles(() =>
    createStyles({
        paper: {
            padding: 15,
            width: 600,
            margin: "auto"
        },
        headerGrid: {
            marginBottom: 10
        },
        footerGrid: {
            marginTop: 15
        },
        description: {
            width: 350
        },
        amount: {
            textAlign: "right"
        }
    }),
);


function MemorialPage() {
    const [journalEntry, setJournalEntry] = React.useState<JournalEntry | undefined>(undefined)
    const [data, setData] = React.useState<JournalEditor>(new JournalEditor())

    const classes = useStyles()
    const dispatch = useDispatch()
    const history = useHistory()
    const search = useLocation().search

    useEffect(() => {
        const id = new URLSearchParams(search).get('id')
        if (id) {
            const accounting = new Accounting()
            if (accounting.journal.hasJournalEntry(id)) {
                const journalEntry = accounting.journal.getJournalEntry(id)
                setJournalEntry(journalEntry)
                setData(JournalEditor.fromJournalEntry(journalEntry))
            }
        }
    }, [search])

    const currency = Accounting.currency

    const { debit, credit } = data.totals()

    const updateData = () => setData(data.clone())

    const onAddLine = () => {
        data.addLeg()
        updateData()
    }

    const onDescription = (event: any) => {
        data.reason = event.target.value
        updateData()
    }

    const onDate = (date: Date | null) => {
        data.date = date || new Date()
        updateData()
    }

    const onAdd = () => {
        dispatch(updateJournalEntry({journalEntryData: data.apply(journalEntry)}))
        onCancel()
    }

    const onDelete = () => {
        dispatch(deleteJournalEntry({journalEntryData: data.apply(journalEntry)}))
        onCancel()
    }

    const onCancel = () => {
        if (journalEntry) {
            history.goBack()
        } else {
            setData(new JournalEditor())
        }
    }

    return (
        <div>
            <PageHeader title={Routes.Memorial} periodFilter={false} withName={false}/>

            <Paper elevation={3} className={classes.paper}>

            <Grid container justify={"space-between"} spacing={4} className={classes.headerGrid}>
                <Grid item>
                    <TextField value={data.reason}
                               className={classes.description}
                               onChange={onDescription}
                               aria-label={"Omschrijving"}
                               label={"Omschrijving"} />
                </Grid>

                <Grid item>
                    <DateSelector label={"Datum"}
                                  date={data.date}
                                  onDate={onDate} />
                </Grid>
            </Grid>

            <Table>
                <Thead>
                    <Tr>
                        <Th>Grootboekrekening</Th>
                        <Th className={classes.amount}>Debet {currency}</Th>
                        <Th className={classes.amount}>Credit {currency}</Th>
                        <Th/>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.legs.map((leg, i) => {

                        const onLedgerAccount = (account: LedgerAccount) => {
                            leg.updateAccount(account)
                            updateData()
                        }

                        const onDebit = (debit: string) => {
                            leg.updateAmount(CreditDebit.Debit, debit)
                            updateData()
                        }

                        const onCredit = (credit: string) => {
                            leg.updateAmount(CreditDebit.Credit, credit)
                            updateData()
                        }

                        const onBlur = () => {
                            leg.finalizeAmount()
                            updateData()
                        }

                        const deleteLine = () => {
                            data.removeLeg(i)
                            updateData()
                        }

                        if (leg.account.isAllocatable) {
                            return (
                                <Tr key={i}>
                                    <Td>
                                        <RGSAccountSelector ledgerAccount={leg.account}
                                                            disabled={!leg.account.isAllocatable}
                                                            accountOptions={LedgerScheme.allocatableAccounts}
                                                            onChange={onLedgerAccount}/>
                                    </Td>
                                    <Td className={classes.amount}>
                                        <VATAmount value={leg.debit}
                                                   onChange={onDebit}
                                                   onBlur={onBlur} />
                                    </Td>
                                    <Td className={classes.amount}>
                                        <VATAmount value={leg.credit}
                                                   onChange={onCredit}
                                                   onBlur={onBlur} />
                                    </Td>
                                    <Td className={classes.amount}>
                                        <IconButton onClick={deleteLine}><DeleteIcon/></IconButton>
                                    </Td>
                                </Tr>)
                        } else {
                            return (
                                <Tr key={i}>
                                    <Td>{leg.account.shortDescription}</Td>
                                    <Td className={classes.amount}>{leg.debit}</Td>
                                    <Td className={classes.amount}>{leg.credit}</Td>
                                    <Td className={classes.amount}>
                                        <IconButton disabled={true}><DeleteIcon/></IconButton>
                                    </Td>
                                </Tr>)
                        }
                    })}
                    <Tr>
                        <Td>Totaal</Td>
                        <Td className={classes.amount}>
                            <FormatAmount amount={Amount.fromAmountCurrency(debit, currency)} debitCredit={false} />
                        </Td>
                        <Td className={classes.amount}>
                            <FormatAmount amount={Amount.fromAmountCurrency(credit, currency)} debitCredit={false} />
                        </Td>
                        <Td className={classes.amount}>
                            <IconButton onClick={onAddLine}><AddIcon/></IconButton>
                        </Td>
                    </Tr>
                </Tbody>
            </Table>

            <Grid container spacing={2} justify={"flex-end"} className={classes.footerGrid}>
                {journalEntry && <Grid item>
                    <Button disabled={!data.canBeDeleted()}
                        onClick={onDelete}
                        variant={"contained"}
                        color={"primary"}>
                        Verwijder
                    </Button>
                </Grid>}

                <Grid item>
                    <Button onClick={onCancel}
                            variant={"contained"}
                            color={"primary"}>
                        Cancel
                    </Button>
                </Grid>

                <Grid item>
                    <Button disabled={!data.isValid()}
                            onClick={onAdd}
                            variant={"contained"}
                            color={"primary"}>
                        OK
                    </Button>
                </Grid>
            </Grid>

            </Paper>

        </div>
    )
}

export default MemorialPage;
