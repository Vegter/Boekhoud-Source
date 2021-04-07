import { Accounting } from "./Accounting"
import { Journal } from "./Journal/Journal"
import { LiquidAssets } from "./LiquidAssets/LiquidAssets"
import { LedgerAllocationMap } from "./Allocation/LedgerAllocationMap"
import { Period } from "./Period"
import { LedgerScheme } from "./Ledger/LedgerScheme"
import { LEDGER_ACCOUNT } from "../config"

import { Amount } from "./Amount"
import { Mocked } from "./mocks"

LedgerScheme.Data = new Mocked().ledgerAccounts

test("Accounting", () => {
    const mocked = new Mocked()

    // Initially the state is undefined
    expect(Accounting.State).toBeUndefined()

    // It stays undefined on instance creation
    let accounting = new Accounting()

    expect(Accounting.State).toBeUndefined()
    
    Accounting.State = mocked.state

    expect(Accounting.State).toEqual(mocked.state)

    expect(accounting.liquidAssets).toEqual(new LiquidAssets(mocked.state.liquidAssetsData))
    expect(accounting.allocations).toEqual(new LedgerAllocationMap(mocked.state.ledgerAllocationsData))
    expect(accounting.journal).toEqual(new Journal(mocked.state.journalData))

    accounting = new Accounting(mocked.emptyState)

    expect(accounting.liquidAssets).toEqual(new LiquidAssets(mocked.emptyState.liquidAssetsData))
    expect(accounting.allocations).toEqual(new LedgerAllocationMap(mocked.emptyState.ledgerAllocationsData))
    expect(accounting.journal).toEqual(new Journal(mocked.emptyState.journalData))

    expect(Accounting.State).toEqual(mocked.emptyState)

})

test("Set metadata", () => {
    const mocked = new Mocked()
    const accounting = new Accounting(mocked.emptyState)

    let meta = Accounting.State.accountingMetaData
    expect(meta).toEqual({ name: ""})

    accounting.setMetaData({ name: "Any other name"})
    meta = Accounting.State.accountingMetaData
    expect(meta).toEqual({ name: "Any other name"})
})

test("Add statements", () => {
    const mocked = new Mocked()
    const accounting = new Accounting(mocked.emptyState)

    // Start with empty state without bankaccounts
    let bankAccounts = accounting.liquidAssets.bankAccounts
    expect(bankAccounts.length).toEqual(0)

    // Expect the references to be set while adding statements
    mocked.statementEntryData.accountStatementRef = ""

    accounting.addStatements([{
        bankAccountData: mocked.bankAccountData,
        accountStatementData: mocked.accountStatementData,
        statementEntriesData: [mocked.statementEntryData]
    }])

    bankAccounts = accounting.liquidAssets.bankAccounts
    expect(bankAccounts.length).toEqual(1)

    const bankAccount = bankAccounts[0]
    expect(bankAccount.statementEntryMap.data).toEqual({[mocked.statementEntryData.id]: mocked.statementEntryData})
    expect(bankAccount.accountStatementMap.data).toEqual({[mocked.accountStatementData.id]: mocked.accountStatementData})
})

test("Link bankaccount", () => {
    const mocked = new Mocked()
    const accounting = new Accounting(mocked.state)

    let account = accounting.liquidAssets.getBankAccount(mocked.bankAccountData.id)
    let entry = accounting.journal.getJournalEntry(mocked.journalEntryData.id)
    expect(account.ledgerAccount.code).not.toEqual(mocked.ledgerAccountDataB.Referentiecode)
    expect(entry.oppositeLeg.ledgerAccountCode).toEqual(account.ledgerAccount.code)

    accounting.linkBankAccount(mocked.bankAccountData, mocked.ledgerAccountDataB)

    // Expect the account to have changed
    account = accounting.liquidAssets.getBankAccount(mocked.bankAccountData.id)
    expect(account.ledgerAccount.code).toEqual(mocked.ledgerAccountDataB.Referentiecode)

    // And the associated journal entries for the bankaccount
    entry = accounting.journal.getJournalEntry(mocked.journalEntryData.id)
    expect(entry.oppositeLeg.ledgerAccountCode).toEqual(mocked.ledgerAccountDataB.Referentiecode)
})

test("setPeriod", () => {
    const mocked = new Mocked()

    const accounting = new Accounting(mocked.state)

    let allocation = accounting.allocations.getAllocation(mocked.ledgerAllocationData.id)
    const period = allocation.period
    const ledgerAccountCode = allocation.ledgerAccountCode
    const length = accounting.allocations.length

    // Set with same period, should be no-op
    accounting.setPeriod(mocked.ledgerAllocationData, period.data)
    expect(allocation.period).toEqual(period)
    expect(allocation.ledgerAccountCode).toEqual(ledgerAccountCode)
    expect(accounting.allocations.length).toEqual(length)

    // No split allocation should be generated
    let splitAllocation = accounting.allocations.getAllocation(allocation.getSplitId(period))
    expect(splitAllocation.data).toBeUndefined()

    const anyPeriod = new Period("Any Other Period")
    accounting.setPeriod(allocation.data, anyPeriod.data)

    // Set the allocation to the corresponding accrual account
    allocation = accounting.allocations.getAllocation(mocked.ledgerAllocationData.id)
    expect(allocation.period).toEqual(period)
    expect(allocation.ledgerAccountCode).toEqual(LEDGER_ACCOUNT.ACCRUED_REVENUE)

    // Generate a new allocation for the new period with the original ledger accountCode
    splitAllocation = accounting.allocations.getAllocation(allocation.getSplitId(anyPeriod))
    expect(splitAllocation.period).toEqual(anyPeriod)
    expect(splitAllocation.ledgerAccountCode).toEqual(ledgerAccountCode)

    expect(accounting.allocations.length).toEqual(length + 1)

    // Restore the original allocation on setting the period back to its original value
    accounting.setPeriod(splitAllocation.data, period.data)
    allocation = accounting.allocations.getAllocation(mocked.ledgerAllocationData.id)
    expect(allocation.period).toEqual(period)
    expect(allocation.ledgerAccountCode).toEqual(ledgerAccountCode)

    // And delete the split allocation
    splitAllocation = accounting.allocations.getAllocation(allocation.getSplitId(anyPeriod))
    expect(splitAllocation.data).toBeUndefined()

    expect(accounting.allocations.length).toEqual(length)
})

test("setReason", () => {
    const mocked = new Mocked()

    const accounting = new Accounting(mocked.state)

    const anyReason = "Any Other Reason"
    accounting.setReason(mocked.ledgerAllocationData, anyReason)
    expect(accounting.journal.getJournalEntry(mocked.ledgerAllocationData.journalEntryRef).reason).toEqual(anyReason)
})

test("setLedgerAccount", () => {
    const mocked = new Mocked()

    const accounting = new Accounting(mocked.state)
    expect(accounting.allocations.getAllocation(mocked.ledgerAllocationData.id).ledgerAccountCode)
        .toEqual(mocked.ledgerAccountDataC.Referentiecode)

    accounting.setLedgerAccount([mocked.ledgerAllocationData], mocked.ledgerAccountDataA.Referentiecode)
    expect(accounting.allocations.getAllocation(mocked.ledgerAllocationData.id).ledgerAccountCode)
        .toEqual(mocked.ledgerAccountDataA.Referentiecode)
})

test("update and delete journal entry", () => {
    const mocked = new Mocked()

    const accounting = new Accounting(mocked.state)
    let journalEntry = accounting.journal.getJournalEntry(mocked.journalEntryData.id)

    const update = { ...journalEntry.data}
    const originalReason = journalEntry.reason
    update.reason = "Another reason"

    accounting.updateJournalEntry(journalEntry.data)
    journalEntry = accounting.journal.getJournalEntry(mocked.journalEntryData.id)
    expect(journalEntry.reason).toEqual(originalReason)
    accounting.updateJournalEntry(update)
    journalEntry = accounting.journal.getJournalEntry(mocked.journalEntryData.id)
    expect(journalEntry.reason).toEqual("Another reason")

    accounting.deleteJournalEntry(update)
    expect(accounting.journal.hasJournalEntry(mocked.journalEntryData.id)).toEqual(false)

    accounting.deleteJournalEntry(update)
})

test("setVAT", () => {
    const mocked = new Mocked()

    const accounting = new Accounting(mocked.state)
    const allocation = accounting.allocations.getAllocation(mocked.ledgerAllocationData.id)
    let vatLegs = allocation.journalEntry.vatLegs
    expect(vatLegs).toEqual([])

    const data = {
        date: "any date",
        lines: [{
            id: "any id",
            bruto: "100",
            vat: "10",
            netto: "90"
        }]
    }
    let journalEntry = allocation.journalEntry
    journalEntry.oppositeLeg.data.amountData = Amount.fromAmountCurrency(-100, '')
    journalEntry.allocatedLeg.data.amountData = Amount.fromAmountCurrency(100, '')
    accounting.setVAT(mocked.ledgerAllocationData, data)

    vatLegs = allocation.journalEntry.vatLegs
    expect(vatLegs.length).toEqual(1)
    let vatLeg = vatLegs[0]
    expect(vatLeg.amount.amount).toEqual(10)
    expect(allocation.journalEntry.data.vatSpecificationData).toEqual(data)

})
