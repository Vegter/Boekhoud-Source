import { LedgerAllocation } from "./LedgerAllocation"
import { Mocked } from "../mocks"
import { Accounting } from "../Accounting"
import { Period } from "../Period"
import { LedgerAccount } from "../Ledger/LedgerAccount"
import { AllocationFilter } from "../AllocationFilter"
import { StatementEntry } from "../LiquidAssets/StatementEntry"

test("LedgerAllocation", () => {
    let mocked = new Mocked()

    mocked.ledgerScheme()

    new Accounting(mocked.state)

    let data = mocked.ledgerAllocationData
    let alloc = new LedgerAllocation(data)
    expect(alloc.id).toEqual(data.id)

    expect(alloc.parentRef).toEqual(data.parentRef)
    expect(alloc.parent).toBeNull()
    expect(alloc.hasParent()).toEqual(false)
    expect(alloc.childrenRefs).toEqual(data.childrenRefs)
    expect(alloc.children).toEqual([])
    expect(alloc.hasChildren()).toEqual(false)


    let entry = alloc.statementEntry
    expect(alloc.sortKey).toEqual(entry.valueDate.string + "." + data.id)

    expect(alloc.period).toEqual(new Period(mocked.journalEntryData.period))
    expect(alloc.ledgerAccount).toEqual(new LedgerAccount(mocked.ledgerAccountDataC))

    expect(alloc.equals(alloc)).toBe(true)
    expect(alloc.matches(new AllocationFilter())).toEqual(true)
    let filter = new AllocationFilter({periodId: "Any Other Period", ledgerAccountCode: null})
    expect(alloc.matches(filter)).toEqual(false)
    filter = new AllocationFilter({periodId: null, ledgerAccountCode: "Any Other LedgerAccountCode"})
    expect(alloc.matches(filter)).toEqual(false)

    alloc = LedgerAllocation.fromStatementEntry(new StatementEntry(mocked.statementEntryData))
    expect(alloc.statementEntry.id).toEqual(mocked.statementEntryData.id)

    let period = new Period("Any Split Period")
    let splitId = alloc.getSplitId(period)
    // The main allocation comes before the split allocation
    expect(alloc.id < splitId).toEqual(true)
    expect(splitId).toEqual(alloc.id + "." + period.string)
})

test("Split Allocation", () => {
    let mocked = new Mocked()
    mocked.ledgerScheme()
    Accounting.State = mocked.state
    let accounting = new Accounting()

    let data = mocked.ledgerAllocationData
    let alloc = new LedgerAllocation(data)

    let newPeriod = new Period("Any other period")

    let allocatedCode = alloc.journalEntry.allocatedLeg.ledgerAccountCode
    let oppositeCode = alloc.journalEntry.oppositeLeg.ledgerAccountCode

    alloc.period = newPeriod
    expect(alloc.children.length).toEqual(1)
    let child = alloc.children[0]

    // Accruals account
    expect(alloc.journalEntry.allocatedLeg.ledgerAccountCode).toEqual(child.journalEntry.oppositeLeg.ledgerAccountCode)
    // Opposite (bankAccount) is on the original allocation
    expect(alloc.journalEntry.oppositeLeg.ledgerAccountCode).toEqual(oppositeCode)
    // Allocated is on the child
    expect(child.journalEntry.allocatedLeg.ledgerAccountCode).toEqual(allocatedCode)

    expect(child.parent!.id).toEqual(alloc.id)
    expect(child.statementEntry.id).toEqual(alloc.statementEntry.id)
    // Child should be added to the collection
    expect(accounting.allocations.getAllocation(child.id)).toEqual(child)

    let anotherPeriod = new Period("Even another period")

    // multisplit is not allowed
    alloc.period = anotherPeriod
    expect(alloc.children.length).toEqual(1)
    expect(child.parent!.id).toEqual(alloc.id)
    expect(child.hasChildren()).toEqual(false)

    // Change child period
    child.period = anotherPeriod
    expect(child.period).toEqual(anotherPeriod)
    // No subsplit
    expect(child.hasChildren()).toEqual(false)

    // Sorting
    expect(LedgerAllocation.sort(alloc, child)).toEqual(-1) // parent before child
    expect(LedgerAllocation.sort(alloc, alloc)).toEqual(0)
    expect(LedgerAllocation.sort(child, alloc)).toEqual(1)  // child after parent

    // United journalEntry reason
    let newReason = "Any new reason"
    alloc.reason = newReason
    expect(alloc.reason).toEqual(newReason)
    expect(child.reason).toEqual(newReason)

    newReason = "Any other new reason"
    child.reason = newReason
    expect(child.reason).toEqual(newReason)
    expect(alloc.reason).toEqual(newReason)

    // Unsplit
    child.period = child.parent!.period
    expect(alloc.journalEntry.oppositeLeg.ledgerAccountCode).toEqual(oppositeCode)
    // Allocated is back to in the parent
    expect(alloc.journalEntry.allocatedLeg.ledgerAccountCode).toEqual(allocatedCode)
    // Child should be removed from the collection
    expect(accounting.allocations.getAllocation(child.id).data).toBeUndefined()


})
