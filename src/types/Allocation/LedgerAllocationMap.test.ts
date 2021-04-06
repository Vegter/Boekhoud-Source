import { Mocked } from "../mocks"
import { LedgerAllocationMap } from "./LedgerAllocationMap"
import { LedgerAllocation } from "./LedgerAllocation"
import { Period } from "../Period"
import { Accounting } from "../Accounting"
import { JournalEntry } from "../Journal/JournalEntry"
import { LedgerScheme } from "../Ledger/LedgerScheme"
import { PeriodFilter } from "../PeriodFilter"
import { BankAccount } from "../LiquidAssets/BankAccount"
import { StatementEntry } from "../LiquidAssets/StatementEntry"

test("LedgerAllocationMap Basic methods", () => {
    let mocked = new Mocked()
    mocked.ledgerScheme()
    Accounting.State = mocked.state

    let data = {
        [mocked.ledgerAllocationData.id]: mocked.ledgerAllocationData
    }
    let map = new LedgerAllocationMap(data)

    expect(map.getAllocation(mocked.ledgerAllocationData.id).id).toEqual(mocked.ledgerAllocationData.id)
    expect(map.hasAllocation(mocked.ledgerAllocationData.id)).toEqual(true)
    expect(map.hasAllocation("Some unknown id")).toEqual(false)
    expect(map.getAllocation("Unknown ID").data).toBeUndefined()
    expect(map.getLedgerAccounts().map(a => a.code)).toEqual([
        new JournalEntry(mocked.journalEntryData).allocatedLeg.ledgerAccountCode
    ])

    expect(map.allocations.length).toEqual(1)
    expect(map.length).toEqual(1)

    let alloc = new LedgerAllocation(mocked.ledgerAllocationData)
    alloc.period = new Period("Any other period")
    let child = alloc.children[0]

    data = {
        [child.id]: child.data,
        [alloc.id]: alloc.data
    }
    map = new LedgerAllocationMap(data)
    let sorted = map.sorted()
    expect(Object.keys(sorted.data)).toEqual([alloc.id, child.id])
    expect(map.getLedgerAccounts().map(a => a.code)).toEqual([
        child.parent?.journalEntry.allocatedLeg.ledgerAccountCode,
        child.journalEntry.allocatedLeg.ledgerAccountCode,
    ])
    expect(map.getPeriods().map(p => p.string)).toEqual([
        child.parent?.period.string,
        child.period.string
    ])
    expect(map.getMappedUnmapped()).toEqual([2, 0])
    child.ledgerAccount = LedgerScheme.unmapped
    expect(map.getMappedUnmapped()).toEqual([1, 1])

    let filter = new PeriodFilter()
    expect(map.filterOnPeriod(filter).length).toEqual(map.length)
    filter = new PeriodFilter({periods: [alloc.period.data]})
    expect(map.filterOnPeriod(filter).length).toEqual(map.length) // match of parent includes child and viceversa
    filter = new PeriodFilter({periods: ["Unknown period"]})
    expect(map.filterOnPeriod(filter).length).toEqual(0)

})

test("LedgerAllocationMap StatementEntries", () => {
    let mocked = new Mocked()
    mocked.ledgerScheme()
    Accounting.State = mocked.state

    let alloc = new LedgerAllocation(mocked.ledgerAllocationData)
    alloc.period = new Period("Any other period")
    let child = alloc.children[0]

    let data = {
        [child.id]: child.data,
        [alloc.id]: alloc.data
    }
    let map = new LedgerAllocationMap(data)

    let bankAccount = new BankAccount(mocked.bankAccountData)
    expect(bankAccount.ledgerAccount.code).not.toEqual(mocked.ledgerAccountB.code)
    expect(alloc.journalEntry.oppositeLeg.ledgerAccountCode).toEqual(bankAccount.ledgerAccount.code)

    bankAccount.ledgerAccount = mocked.ledgerAccountB

    map.updateStatementEntries(bankAccount)
    expect(alloc.journalEntry.oppositeLeg.ledgerAccountCode).toEqual(bankAccount.ledgerAccount.code)

    map = new LedgerAllocationMap({})
    expect(map.length).toEqual(0)

    let entry = new StatementEntry(mocked.statementEntryData)
    map.addStatementEntries(bankAccount, [entry])
    expect(map.length).toEqual(1)

    // Do not duplicate
    map.addStatementEntries(bankAccount, [entry])
    expect(map.length).toEqual(1)

    alloc = map.allocations[0]
    expect(map.getSimilarAllocations(alloc).map(a => a.id)).toEqual([alloc.id])

})

test("LedgerAllocationMap Allocations", () => {
    let mocked = new Mocked()
    mocked.ledgerScheme()
    Accounting.State = mocked.state

    let alloc = new LedgerAllocation(mocked.ledgerAllocationData)
    alloc.period = new Period("Any other period")
    let child = alloc.children[0]

    let map = new LedgerAllocationMap({
        [alloc.id]: alloc.data,
        [child.id]: child.data
    })

    expect(map.getSimilarAllocations(alloc).map(a => a.id)).toEqual([alloc.id])
    expect(map.getSimilarAllocations(child)).toEqual([])

    alloc.ledgerAccount = mocked.ledgerAccountC
    child.ledgerAccount = mocked.ledgerAccountC

    expect(map.getSimilarAllocations(alloc).map(a => a.id)).toEqual([alloc.id, child.id])
    expect(map.getSimilarAllocations(child)).toEqual([])
})