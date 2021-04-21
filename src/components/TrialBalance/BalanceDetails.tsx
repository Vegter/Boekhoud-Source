import { Journal } from "../../types/Journal/Journal"
import { LedgerAccount } from "../../types/Ledger/LedgerAccount"
import React, { useEffect } from "react"
import { JournalEntry } from "../../types/Journal/JournalEntry"
import { useTheme } from "@material-ui/core/styles"
import { useMediaQuery } from "@material-ui/core"
import { sortedArray } from "../../services/utils"
import { Td, Tr } from "../ResponsiveTable"
import FormatAmount from "../Utils/FormatAmount"
import FormatDate from "../Utils/FormatDate"
import FormatPeriod from "../Utils/FormatPeriod"
import { useStyles } from "./Styling"

export function BalanceDetails(props: { journal: Journal, account: LedgerAccount, loadMore: number }) {
    const [entries, setEntries] = React.useState<JournalEntry[]>([])
    const [viewPort, setViewPort] = React.useState(25)

    const {journal, account, loadMore} = props
    const classes = useStyles()

    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'))

    useEffect(() => {
        const filteredJournal = journal.filterOnAccount(leg => leg.ledgerAccount.equals(account))
        let allEntries: JournalEntry[] = filteredJournal.journalEntries.filter(entry => entry.legs.length)
        allEntries = sortedArray(allEntries, (e) => [e.period.string, e.date.string].join("."))
        setEntries(allEntries)
    }, [journal, account])

    useEffect(() => {
        setViewPort(prevViewPort => prevViewPort + 25)
    }, [loadMore])

    return (
        <React.Fragment>
            {!onXs && <Tr className={classes.levelHeader}>
                <Td/>
                <Td/>
                <Td/>
                <Td align={"right"} className={classes.levelHeader}>Datum</Td>
                <Td align={"right"} className={classes.levelHeader}>Periode</Td>
                <Td/>
            </Tr>}
            {entries.slice(0, viewPort).map(entry => {
                const fullEntry = journal.getJournalEntry(entry.id)
                const rates = fullEntry.vatRates.map(rate => rate.percentageString).join(", ")
                return entry.legs.map((leg, i) => (
                    <Tr key={`${entry.id}.${i}`} className={classes.childRow}>
                        <Td className={`${classes.subDescription} noheader`}>
                            {entry.reason}
                            {rates && `(${rates})`}
                            {leg.tag && ` (${leg.tag})`}
                        </Td>
                        <Td align="right">
                            {leg.amount.isDebit && <FormatAmount amount={leg.amount} debitCredit={true}/>}
                        </Td>
                        <Td align="right">
                            {leg.amount.isCredit && <FormatAmount amount={leg.amount} debitCredit={true}/>}
                        </Td>
                        <Td align="right"><FormatDate date={entry.date}/></Td>
                        <Td align="right"><FormatPeriod period={entry.period}/></Td>
                        <Td/>
                    </Tr>))
            })}
            {/* Empty line as separation line */}
            {!onXs && <Tr><Td colSpan={6}/></Tr>}
        </React.Fragment>
    )
}