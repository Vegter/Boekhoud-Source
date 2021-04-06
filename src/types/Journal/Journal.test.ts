import { Amount } from "../Amount"
import { Journal } from "./Journal"
import { PeriodFilter } from "../PeriodFilter"
import { EntryLegData, JournalEntryData, JournalEntryMapData } from "../../model"
import { JournalEntry } from "./JournalEntry"
import { Mocked } from "../mocks"
import { AssertionError } from "assert"
import { Period } from "../Period"

test("Journal", () => {
    let mocked = new Mocked()
    let journalData: JournalEntryMapData = {}
    let filter: PeriodFilter = PeriodFilter.fromValues([2020, 2024])
    let journal = new Journal(journalData)

    expect(journal.distinctPeriods()).toEqual([])
    expect(journal.filterOnPeriod(filter).data).toEqual({})

    expect(() => {
        journal.getJournalEntry("any id")
    }).toThrow(AssertionError)

    const entries: JournalEntry[] = [[0, 2010], [1, 2020], [2, 2021], [3, 2030], [1, 2050]]
        .map(([id, period]) => ({
            id: String(id),
            date: "",
            period: String(period),
            reason: "",
            entryLegsData: [
                {
                    ledgerAccountCode: mocked.ledgerAccountA.code,
                    amountData: new Amount().data
                },
                {
                    ledgerAccountCode: mocked.ledgerAccountB.code,
                    amountData: new Amount().data
                }
            ] as EntryLegData[]
        } as JournalEntryData ))
        .map(data => new JournalEntry(data))

    entries.forEach(entry => {
        journal.add(entry)
    })

    expect(Object.keys(journal.data)).toEqual(["0", "1", "2", "3"])
    expect(journal.data["1"].period).toEqual("2020")  // Do not overwrite
    expect(journal.getJournalEntry("1").period).toEqual(new Period("2020"))

    expect(Object.keys(journal.filterOnPeriod(filter).data)).toEqual(["1", "2"])
    expect(journal.distinctPeriods().map(p => p.string)).toEqual(["2010", "2020", "2021", "2030"])

    expect(journal.journalEntries.length).toEqual(4)

    let onlyA = journal.filterOnAccount(leg => leg.ledgerAccountCode === mocked.ledgerAccountA.code)
    // The new journal contains only AccountA legs
    onlyA.journalEntries.forEach(e => {
        expect(e.legs.length).toEqual(1)
        expect(e.legs[0].ledgerAccountCode).toEqual(mocked.ledgerAccountA.code)
    })
    // The original journal is unchanged
    journal.journalEntries.forEach(e => {
        expect(e.legs.length).toEqual(2)
    })

    const revJournal = journal.reversed()
    const regEntries = journal.journalEntries
    const revEntries = revJournal.journalEntries
    expect(regEntries.length).toEqual(revEntries.length)
    for (let n = 0; n < regEntries.length; n++) {
        const regLegs = regEntries[n].legs
        const revLegs = revEntries[n].legs
        expect(regLegs.length).toEqual(revLegs.length)
        for (let m = 0; m < regLegs.length; m++) {
            const regLeg = regLegs[m]
            const revLeg = revLegs[m]
            expect(regLeg.ledgerAccountCode).toEqual(revLeg.ledgerAccountCode)
            expect(regLeg.amount).toEqual(revLeg.amount.reversed())
        }


    }

})
