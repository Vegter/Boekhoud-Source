import React from 'react'

import ItemSelect from "./ItemSelect"

import { LedgerAccount } from "types/Ledger/LedgerAccount"
import { LedgerAllocationMap } from "types/Allocation/LedgerAllocationMap"
import { AllocationFilter } from "types/AllocationFilter"

interface Props {
    title: string
    width: number
    allocations: LedgerAllocationMap
    allocationFilter: AllocationFilter
    onAccount: (account: LedgerAccount | null) => void
}

function AccountSelect(props: Props) {
    const { width, allocations, allocationFilter, onAccount } = props

    const { ledgerAccount: ledgerAccountFilter } = allocationFilter

    const accounts = allocations.getLedgerAccounts()
    const account = accounts.find(a => ledgerAccountFilter && a.equals(ledgerAccountFilter)) || null

    const items = accounts.map(account => account.shortDescription)
    const item = account ? account.shortDescription : ""

    const title = ledgerAccountFilter && !item ? ledgerAccountFilter.shortDescription : props.title

    function onItem(item: string | null) {
        const account = item ? accounts.find(account => account.shortDescription === item) : null
        onAccount(account ?? null)
    }

    return (
        <ItemSelect title={title} width={width} items={items} item={item} onItem={onItem} />
    )
}

function areEqual(prevProps: Props, nextProps: Props) {
    return prevProps.allocationFilter.ledgerAccountCode === nextProps.allocationFilter.ledgerAccountCode
}

export default React.memo(AccountSelect, areEqual)