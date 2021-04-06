import React, { useState } from 'react'

import { makeStyles, Paper, TableContainer } from "@material-ui/core"
import { createStyles } from "@material-ui/core/styles"

import { Table, Thead, Tbody, Tr, Th, Td } from './ResponsiveTable';

import InfiniteScroll from "react-infinite-scroller"

import { Journal } from "../types/Journal/Journal"
import { JournalEntry } from "../types/Journal/JournalEntry"

import { sortedArray } from "../services/utils"
import FormatDate from "./Utils/FormatDate"
import FormatAmount from "./Utils/FormatAmount"
import FormatPeriod from "./Utils/FormatPeriod"

const useStyles = makeStyles((/*theme: Theme*/) =>
    createStyles({
    headerRow: {
        background: "lightgrey",
        boxShadow: "none !important"
    },
    header: {
        fontWeight: "bold",
    }
}));

interface JournalProps {
    journal: Journal
}

function Journals(props: JournalProps) {
    const [viewPort, setViewPort] = useState(0)

    const { journal } = props
    const classes = useStyles()

    let entries: JournalEntry[] = journal.journalEntries
    entries = sortedArray(entries, (e) => [e.period.string, e.date.string].join("."))

    const filteredEntries = entries.slice(0, viewPort)
    const hasMore = viewPort < entries.length
    const loadMore = () => setViewPort(viewPort + 50)

    return (
        <div>
            <InfiniteScroll pageStart={0} hasMore={hasMore} loadMore={loadMore}>
            <TableContainer component={Paper}>
                    <Table>
                        <Thead><Tr>
                            <Th>datum</Th>
                            <Th>Periode</Th>
                            <Th>RGS</Th>
                            <Th align="right">Debit</Th>
                            <Th align="right">Credit</Th>
                        </Tr></Thead>
                        <Tbody>
                        {filteredEntries.map(entry => {
                            return (
                                <React.Fragment key={entry.id}>
                                    <Tr className={classes.headerRow}>
                                        <Td colSpan={5} className={classes.header}>{entry.reason}</Td>
                                    </Tr>
                                    {entry.legs.map((leg, i) => {
                                        const ledgerAccount = leg.ledgerAccount
                                        const key = `${entry.id}.${i}`
                                        return (
                                            <Tr key={key}>
                                                <Td><FormatDate date={entry.date}/></Td>
                                                <Td><FormatPeriod period={entry.period}/></Td>
                                                <Td>
                                                    {ledgerAccount.shortDescription}
                                                    {leg.tag && ` (${leg.tag})`}
                                                </Td>
                                                <Td align={"right"}>{leg.amount.isDebit && <FormatAmount amount={leg.amount} debitCredit={true}/>}</Td>
                                                <Td align={"right"}>{leg.amount.isCredit && <FormatAmount amount={leg.amount} debitCredit={true}/>}</Td>
                                            </Tr>
                                        )})}
                                </React.Fragment>
                            )
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
            </InfiniteScroll>
        </div>
    )
}

export default Journals;
