import React, { useEffect, useMemo, useState } from 'react'

import { Grid, IconButton, Paper, TableContainer, useMediaQuery } from "@material-ui/core"

import { Table, Thead, Tbody, Tr, Th, Td } from './ResponsiveTable';

import InfiniteScroll from 'react-infinite-scroller'

import { LedgerAccount } from "../types/Ledger/LedgerAccount"
import TextSearch from "./Selectors/TextSearch"
import { useTheme } from "@material-ui/core/styles"
import { useURLState } from "./useURLState"
import HighlightText from "./Utils/HighlightText"
import { allOrSome, noneOrSome, removeDiacritics } from "../services/utils"
import LevelSelector from "./Selectors/LevelSelector"
import { LedgerScheme } from "../types/Ledger/LedgerScheme"
import CreditDebitSelector from "./Selectors/DebitCreditSelector"
import SearchTextButton from "./SearchTextButton"
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp"
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight"
import { TreeView, TreeViewNode } from "../services/TreeView"

class AccountTreeViewNode implements TreeViewNode {
    id: string
    level: number
    parentId: string | null

    constructor(account: LedgerAccount) {
        this.id = account.code
        this.level = account.level
        this.parentId = account.parent && account.parent.code
    }
}

interface LedgerViewerProps {
    accounts: LedgerAccount[]
}

const LOAD_PER = 100
const DEFAULT_LEVELS = [1, 2]
const DEFAULT_SIDES = ["D", "C", ""]

function LedgerViewer(props: LedgerViewerProps) {
    const [urlState, setURLState] = useURLState()
    const [viewPort, setViewPort] = useState(LOAD_PER)
    const [searching, setSearching] = useState(false)
    const [searchedAccounts, setSearchedAccounts] = useState<LedgerAccount[]>([])
    const [filteredAccounts, setFilteredAccounts] = useState<LedgerAccount[]>([])
    const [viewPortAccounts, setViewPortAccounts] = useState<LedgerAccount[]>([])

    const theme = useTheme()
    const onSmDown = useMediaQuery(theme.breakpoints.down('sm'));
    const onXs = useMediaQuery(theme.breakpoints.only('xs'));

    const { accounts } = props

    const searchText = useMemo(() => urlState.getStringValue("search"), [urlState])
    const open = useMemo(() => urlState.getStringArrayValue("open"), [urlState])
    const close = useMemo(() => urlState.getStringArrayValue("close"), [urlState])
    const levels = useMemo(() => allOrSome(DEFAULT_LEVELS, urlState.getNumericArrayValue("levels")),
        [urlState])
    const sides = useMemo(() => allOrSome(DEFAULT_SIDES, urlState.getStringArrayValue("sides")),
        [urlState])

    const treeView = new TreeView({open, close, levels})

    useEffect(() => {
        setViewPort(LOAD_PER)
        if (searchText) {
            setSearchedAccounts(LedgerScheme.getMatchingAccounts(accounts, searchText, true))
        } else {
            setSearchedAccounts(accounts)
        }
        setSearching(false)
    }, [searchText, accounts])

    useEffect(() => {
        const treeView = new TreeView({open, close, levels})    // local treeView
        const accountIsVisible = (account: LedgerAccount) => {
            return treeView.isNodeVisible(new AccountTreeViewNode(account))
        }
        const sideIsVisible = (side: string | undefined) => (!side || sides.includes(side))

        setFilteredAccounts(searchedAccounts.filter(acc => accountIsVisible(acc) && sideIsVisible(acc.side)))
    }, [levels, sides, open, close, searchedAccounts])

    useEffect(() => {
        setViewPortAccounts(filteredAccounts.slice(0, viewPort))
    }, [viewPort, filteredAccounts])

    const hasMore = viewPort < filteredAccounts.length
    const loadMore = (page: any) => setViewPort(page * LOAD_PER)

    const onSearch = (search: string) => {
        setSearching(true)
        setURLState({search: removeDiacritics(search)})
    }

    const onSides = (sides: string[]) => setURLState({sides: noneOrSome(DEFAULT_SIDES, sides)})

    const onLevels = (levels: number[]) => setURLState({levels: noneOrSome(DEFAULT_LEVELS, levels)})

    const onOpenClose = (account: LedgerAccount) =>
        setURLState(treeView.toggleOpenClose(new AccountTreeViewNode(account)))

    const isOpen = (account: LedgerAccount) => treeView.isNodeOpen(new AccountTreeViewNode(account))

    const maxLevel = Math.max(...LedgerScheme.Levels())

    return (
        <div>
            <Grid container direction={"row"} justify={"space-between"} alignItems={"center"}>
                <Grid item xs={12} sm={6} md={5}>
                    <TextSearch disabled={searching} text={searchText} onSearch={onSearch} />
                </Grid>
                {!onSmDown && <Grid item md={2}>
                    <CreditDebitSelector sides={sides} onSides={onSides}/>
                </Grid>}
                <Grid item xs={12} sm={6} md={5}>
                    <div>
                    <LevelSelector key={levels.length} levels={levels} onLevels={onLevels}/>
                    </div>
                </Grid>
            </Grid>
            <InfiniteScroll loader={<div key={1}>Loading...</div>} pageStart={0} hasMore={hasMore} loadMore={loadMore}>
                <TableContainer component={Paper}>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Omschrijving Kort</Th>
                                {!onSmDown && <Th>Omschrijving</Th>}
                                <Th>Code</Th>
                                <Th>Omslag</Th>
                                <Th>D/C</Th>
                                <Th>Nivo</Th>
                                {!onSmDown && <Th>Sortering</Th>}
                                {!onSmDown && <Th>Nummer</Th>}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {viewPortAccounts.map(account => {
                                const dcAlign = account.data.DC === "D" ? "left" : "right"
                                const indent = (account.level - 1) * 15
                                const iconWidth = 26
                                const style = onXs
                                    ? {
                                        marginLeft: indent  // Indent card
                                      }
                                    : {
                                        //    - text
                                        //      next line text
                                        textIndent: -iconWidth,             // real indent
                                        paddingLeft: indent + iconWidth     // indent text after icon
                                    }
                                return (
                                    <Tr key={account.data.Referentiecode} style={ onXs ? style : {} }>
                                        <Td className={"noheader"}>
                                            <div style={ onXs ? {} : style }>
                                                <IconButton aria-label="details"
                                                            disabled={account.level === maxLevel}
                                                            size="small"
                                                            onClick={() => onOpenClose(account)}>
                                                    {isOpen(account)
                                                        ? <KeyboardArrowUpIcon fontSize={"small"} />
                                                        : <KeyboardArrowRightIcon fontSize={"small"}/>}
                                                </IconButton>
                                                {account.shortDescription}
                                            </div>
                                        </Td>
                                        {!onSmDown && <Td>
                                            <HighlightText highlightText={searchText}
                                                           text={account.description}/>
                                        </Td>}
                                        <Td>
                                            <HighlightText highlightText={searchText}
                                                           text={account.data.Referentiecode}/>
                                        </Td>
                                        <Td>
                                            {account.reverseCode &&
                                            <SearchTextButton text={account.reverseCode}
                                                              searchText={searchText}
                                                              onSearch={onSearch}/>
                                            }
                                        </Td>
                                        <Td align={dcAlign}>{account.data.DC}</Td>
                                        <Td align={"center"}>{account.data.Nivo || ""}</Td>
                                        {!onSmDown && <Td>{account.sortKey}</Td>}
                                        {!onSmDown && <Td>{account.data.Referentienummer}</Td>}
                                    </Tr>
                                )
                            })}
                        </Tbody>
                    </Table>
                </TableContainer>
            </InfiniteScroll>
        </div>
    )
}

export default LedgerViewer