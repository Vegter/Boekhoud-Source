import React, { useEffect, useMemo } from 'react'

import { Box, Button, Grid, Paper, TableContainer } from "@material-ui/core"
import { Table, Tbody, Th, Thead, Tr } from '../ResponsiveTable'

import { Journal } from "../../types/Journal/Journal"
import { AccountSummaryMap } from "../../types/AccountSummaryMap"
import InfiniteScroll from "react-infinite-scroller"
import { useURLState } from "../useURLState"
import { BalanceTotals } from "./BalanceTotals"
import { useStyles } from "./Styling"
import LayoutChoice, { LayoutLabel, LayoutType } from "./LayoutChoice"
import { EntryLeg } from "../../types/Journal/EntryLeg"
import BalanceRow from "./BalanceRow"
import { CategoryHeader } from "./CategoryHeader"
import CategoryFooter from "./CategoryFooter"

interface TrialBalanceProps {
    journal: Journal
}

const DEFAULT_LAYOUT = LayoutType.TRIALSALDI

function TrialBalance(props:TrialBalanceProps) {
    const [urlState, setURLState] = useURLState()
    const [viewPort, setViewPort] = React.useState(0)
    const [journal, setJournal] = React.useState<Journal>(props.journal)

    const classes = useStyles()

    const openAccountCodes = useMemo(() => urlState.getStringArrayValue("open"), [urlState])

    const layoutType = useMemo<LayoutType>(() => {
        const value = urlState.getStringValue("layout")
        return Object.values(LayoutType).find(v => v === value) || DEFAULT_LAYOUT
    }, [urlState])

    useEffect(() => {
        if (layoutType === LayoutType.RESULTS) {
            setJournal(props.journal
                .filterOnAccount((leg: EntryLeg) => !leg.ledgerAccount.isBalanceAccount()))
        } else {    // LayoutType.TRIALSALDI
            setJournal(props.journal)
        }
    }, [layoutType, props.journal])

    const journalEntries = journal.journalEntries
    const summary = new AccountSummaryMap(journalEntries)
    const accounts = summary.getAccounts()
    const categories = Array.from(new Set(accounts.map(acc => acc.category)))

    const loadMore = () => setViewPort(viewPort + 25)

    const onLayout = (layout: LayoutType) => {
        if (layout === DEFAULT_LAYOUT) {
            setURLState({layout: null})
        } else {
            setURLState({layout})
        }
    }

    const onOpenCloseAll = () => {
        setURLState({open: openAccountCodes.length ? null : accounts.map(a => a.code)})
    }

    return (
        <div>

        <Box display="block" displayPrint="none">
            {/* Screen Only */}
            <Grid container direction={"row"} alignItems={"center"}>
                <Grid item xs={6} md={3} className={classes.openCloseButton}>
                    <Button variant={"contained"} color={"primary"} size={"small"} onClick={() => onOpenCloseAll()}>
                        <span>{openAccountCodes.length ? "Sluit" : "Open" } alle posten</span>
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <LayoutChoice layoutType={layoutType} onLayout={onLayout}/>
                </Grid>
            </Grid>
        </Box>

        <Box display="none" displayPrint="block">
            {/* Print Only */}
            <h2>{LayoutLabel[layoutType]}</h2>
        </Box>

        <InfiniteScroll pageStart={0} hasMore={openAccountCodes.length > 0} loadMore={loadMore} initialLoad={false}>
        <TableContainer component={Paper}>
                <Table className={classes.table}
                       size="small">
                    <Thead>
                        <Tr>
                            <Th/>
                            <Th align="right">Debit</Th>
                            <Th align="right">Credit</Th>
                            <Th align="right">Saldo Debit</Th>
                            <Th align="right">Saldo Credit</Th>
                            <Th align="right">Saldo</Th>
                        </Tr>
                    </Thead>
                    <Tbody>

                        {categories.map(category => {
                            const categoryAccounts = accounts.filter(account => account.category === category)

                            return (
                                <React.Fragment key={category}>

                                    <CategoryHeader category={category}/>

                                    {categoryAccounts.map(ledgerAccount => {
                                        return <BalanceRow key={ledgerAccount.code}
                                                           journal={journal}
                                                           ledgerAccount={ledgerAccount}
                                                           summary={summary}
                                                           viewPort={viewPort}/>
                                    })}

                                    <CategoryFooter category={category} summary={summary}/>

                                </React.Fragment>
                            )
                        })}

                        <BalanceTotals summary={summary}>
                            <span>Totaal</span>
                        </BalanceTotals>

                    </Tbody>
                </Table>
            </TableContainer>
        </InfiniteScroll>
        </div>
    );
}

export default TrialBalance;