import { AccountSummaryMap } from "./AccountSummaryMap"
import { JournalEntry } from "./Journal/JournalEntry"
import { Mocked } from "./mocks"
import { JournalEntryData, LedgerAccountData } from "../model"
import { LedgerAccount } from "./Ledger/LedgerAccount"

test("AccountSummaryMap - Empty", () => {
    let summary = new AccountSummaryMap([])
    expect(summary.accountSummaryMap).toEqual({})
    expect(summary.getAccounts()).toEqual([])
})

test("AccountSummaryMap - NonEmpty", () => {
    let mocked = new Mocked()
    mocked.ledgerScheme()

    const data = mocked.journalEntryData

    const mockEntry = (template: JournalEntryData, amount: number): JournalEntry => {
        return new JournalEntry({
                ...template,
                entryLegsData: [
                    { ...template.entryLegsData[0], amountData: mocked.getAmount(amount)},
                    { ...template.entryLegsData[1], amountData: mocked.getAmount(-amount)},
                ]
            }
        )
    }

    const entries = [
        mockEntry(data, 10),
        mockEntry(data, -15),
        mockEntry(data, 20)
    ]
    let summary = new AccountSummaryMap(entries)
    expect(Object.keys(summary.accountSummaryMap)).toEqual(["A", "C"])
    expect(summary.getAccounts().map(a => a.code)).toEqual(["A", "C"])

    let summaryA = summary.getAccountSummary(mocked.ledgerAccountA)
    expect(summaryA.balance).toEqual(mocked.getAmount(15))
    expect(summaryA.debitBalance).toEqual(mocked.getAmount(0))
    expect(summaryA.creditBalance).toEqual(mocked.getAmount(15))
    expect(summaryA.debitAmount).toEqual(mocked.getAmount(-15))
    expect(summaryA.creditAmount).toEqual(mocked.getAmount(30))
    expect(summaryA.bookings.length).toEqual(3)
    expect(summaryA.bookings).toEqual(entries.map(entry => ({
        journalEntry: entry,
        leg: entry.oppositeLeg
    })))

    let total = summary.getTotalisation(account => account.code === mocked.ledgerAccountA.code)
    expect(total.balance).toEqual(mocked.getAmount(15))
    expect(total.debitBalance.value).toEqual(0) // No currency, because amount = 0
    expect(total.creditBalance).toEqual(mocked.getAmount(15))
    expect(total.debitAmount).toEqual(mocked.getAmount(-15))
    expect(total.creditAmount).toEqual(mocked.getAmount(30))

    let summaryC = summary.getAccountSummary(mocked.ledgerAccountC)
    expect(summaryC.balance).toEqual(mocked.getAmount(-15))
    expect(summaryC.debitBalance).toEqual(mocked.getAmount(-15))
    expect(summaryC.creditBalance).toEqual(mocked.getAmount(0))
    expect(summaryC.debitAmount).toEqual(mocked.getAmount(-30))
    expect(summaryC.creditAmount).toEqual(mocked.getAmount(15))
    expect(summaryC.bookings.length).toEqual(3)
    expect(summaryC.bookings).toEqual(entries.map(entry => ({
        journalEntry: entry,
        leg: entry.allocatedLeg
    })))

    total = summary.getTotalisation()
    expect(total.balance).toEqual(mocked.getAmount(0))
    expect(total.debitBalance).toEqual(mocked.getAmount(-15))
    expect(total.creditBalance).toEqual(mocked.getAmount(15))
    expect(total.debitAmount).toEqual(mocked.getAmount(-45))
    expect(total.creditAmount).toEqual(mocked.getAmount(45))
    expect(total.bookings.length).toEqual(0)  // Not registered for totals
    // expect(total.bookings).toEqual(entries.map(entry => ({
    //     journalEntry: entry,
    //     leg: entry.oppositeLeg
    // })).concat(entries.map(entry => ({
    //     journalEntry: entry,
    //     leg: entry.allocatedLeg
    // }))))
})

test("Sort on category", () => {
    let mocked = new Mocked()
    mocked.ledgerScheme()

    const data = mocked.journalEntryData

    const mockEntry = (template: JournalEntryData, account: LedgerAccountData): JournalEntry => {
        return new JournalEntry({
                ...template,
                entryLegsData: [
                    { ...template.entryLegsData[0], ledgerAccountCode: account.Referentiecode},
                    { ...template.entryLegsData[1], ledgerAccountCode: account.Referentiecode},
                ]
            }
        )
    }

    const entries = [
        mockEntry(data, mocked.ledgerAccountDataWRev),
        mockEntry(data, mocked.ledgerAccountDataWExp),
        mockEntry(data, mocked.ledgerAccountDataB)
    ]
    let summary = new AccountSummaryMap(entries)

    expect(new LedgerAccount(mocked.ledgerAccountDataWRev).category).toEqual("W+")

    expect(Object.keys(summary.accountSummaryMap)).toEqual(["WRev", "WExp", "B"])
    expect(summary.getAccounts().map(a => a.code)).toEqual(["B", "WRev", "WExp"])
})
