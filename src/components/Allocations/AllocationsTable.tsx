import React, { useState } from 'react'
import { Table, Tbody, Td, Th, Thead, Tr } from "../ResponsiveTable"
import AllocationsTableRow from "./AllocationsTableRow"
import AllocationsDataIndicator from "./AllocationsDataIndicator"
import { Paper, TableContainer, useMediaQuery } from "@material-ui/core"
import { LedgerAllocation } from "../../types/Allocation/LedgerAllocation"
import { LedgerAllocationMap } from "../../types/Allocation/LedgerAllocationMap"
import { useTheme } from "@material-ui/core/styles"
import { AllocationFilter } from "../../types/AllocationFilter"
import { LedgerAccount } from "../../types/Ledger/LedgerAccount"
import { setDate, setLedgerAccount, setVAT } from "../../app/AccountingSlice"
import { useDispatch } from "react-redux"
import SimilarAllocations, { Similar } from "./SimilarAllocations"
import { VATSpecificationData } from "../../model"
import { AccountSelectorWidth } from "../Editors/RGSAccountSelector"
import { PeriodSelectorWidth } from "../Editors/PeriodSelector"
import { DateString } from "../../types/DateString"

interface AllocationsTableProps {
    allocations: LedgerAllocationMap
    allocationFilter: AllocationFilter
    rows: LedgerAllocation[]
    isLoading: boolean
}

function AllocationsTable(props: AllocationsTableProps) {
    const { allocations, allocationFilter, rows, isLoading } = props
    const [similar, setSimilar] = useState<Similar | null>(null)
    const dispatch = useDispatch()

    const theme = useTheme()
    const onSm = useMediaQuery(theme.breakpoints.only('sm'));

    const debitCredit = !onSm
    const noData = !isLoading && rows.length === 0

    function updateLedgerAccount(ledgerAllocation: LedgerAllocation, ledgerAccount: LedgerAccount) {
        if (ledgerAllocation.journalEntry.allocatedLeg.ledgerAccountCode === ledgerAccount.code) {
            // No change, no further actions
            return
        }
        const similarAllocations = allocations.getSimilarAllocations(ledgerAllocation)

        if (similarAllocations.length > 1) {
            // Propose to update similar allocations (includes itself for reference)
            const similar: Similar = {
                allocation: ledgerAllocation,
                allocations: similarAllocations,
                account: ledgerAccount
            }
            setSimilar(similar)
        } else {
            // update the selected allocation
            dispatch(setLedgerAccount({
                allocationsData: [ledgerAllocation.data],
                accountCode: ledgerAccount.code
            }))
        }
    }

    function onSimilar(allocations: LedgerAllocation[]) {
        if (similar && allocations.length) {
            dispatch(setLedgerAccount({
                allocationsData: [...allocations.map(allocation => allocation.data)],
                accountCode: similar.account.code
            }))
        }
        setSimilar(null)
    }

    function updateVAT(ledgerAllocation: LedgerAllocation, vatSpecificationData: VATSpecificationData) {
        dispatch(setVAT({
            allocationData: ledgerAllocation.data,
            vatSpecificationData
        }))
    }

    function updateDate(ledgerAllocation: LedgerAllocation, date: Date) {
        dispatch(setDate({
            allocationData: ledgerAllocation.data,
            dateData: DateString.fromDate(date).data
        }))
    }

    return (
        <TableContainer component={Paper}>
        {similar && <SimilarAllocations similar={similar} onSimilar={onSimilar} />}
        <Table>
            <Thead>
                <Tr>
                    <Th style={{width: 85}}>Datum</Th>
                    <Th style={{width: 85}}>Factuur</Th>
                    <Th style={{width: PeriodSelectorWidth}}>Periode</Th>
                    {debitCredit && <Th style={{width: 100}} align={"right"}>Debit</Th>}
                    {debitCredit && <Th style={{width: 100}} align={"right"}>Credit</Th>}
                    {!debitCredit && <Th style={{width: 100}} colSpan={2} align={"right"}>Bedrag</Th>}
                    <Th style={{width: AccountSelectorWidth}}>Grootboek</Th>
                    <Th style={{width: 50}}>BTW</Th>
                    <Th>Omschrijving</Th>
                </Tr>
            </Thead>
            <Tbody>
                {rows.map((allocation) => {
                    if (! allocations.hasAllocation(allocation.id)) {
                        // rows and allocations can be out of sync for a moment (worker thread)
                        return null
                    } else {
                        return (
                            <AllocationsTableRow key={allocation.id}
                                                 allocation={allocation}
                                                 debitCredit={debitCredit}
                                                 updateDate={updateDate}
                                                 updateVAT={updateVAT}
                                                 updateLedgerAccount={updateLedgerAccount} />
                        )
                    }
                })}

                {(isLoading || noData) &&
                <Tr>
                    <Td colSpan={6} align={"center"}>
                        <AllocationsDataIndicator isLoading={isLoading}
                                                  noData={noData}
                                                  allocationFilter={allocationFilter}/>
                    </Td>
                </Tr>}
            </Tbody>
        </Table>
        </TableContainer>
    )
}

export default AllocationsTable;
