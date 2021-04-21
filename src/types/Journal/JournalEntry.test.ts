import { JournalEntry } from "./JournalEntry"
import { Amount } from "../Amount"
import { Mocked } from "../mocks"
import { Period } from "../Period"
import { DateString } from "../DateString"
import { EntryLeg } from "./EntryLeg"
import { LEDGER_ACCOUNT } from "../../config"
import { AssertionError } from "assert"

test("JournalEntry", () => {
    let entry: JournalEntry
    let mocked = new Mocked()

    entry = new JournalEntry(mocked.journalEntryData)

    expect(entry.id).toEqual(mocked.journalEntryData.id)
    expect(entry.reason).toEqual(mocked.journalEntryData.reason)
    expect(entry.period).toEqual(new Period(mocked.journalEntryData.period))
    expect(entry.date).toEqual(new DateString(mocked.journalEntryData.date))
    expect(entry.legs).toEqual(mocked.journalEntryData.entryLegsData.map(data => new EntryLeg(data)))

    expect(entry.oppositeLeg).toEqual(new EntryLeg(mocked.journalEntryData.entryLegsData[0]))
    expect(entry.allocatedLeg).toEqual(new EntryLeg(mocked.journalEntryData.entryLegsData[1]))

    entry.reason = "Any other reason"
    expect(entry.reason).toEqual("Any other reason")

    entry.period = new Period("Any other period")
    expect(entry.period).toEqual(new Period("Any other period"))

    entry = JournalEntry.fromAllocation(mocked.journalEntryData.id,
        Amount.fromAmountCurrency(100, ""),
        new DateString(mocked.journalEntryData.date),
        new Period(mocked.journalEntryData.period),
        mocked.journalEntryData.reason,
        mocked.ledgerAccountA,
        mocked.ledgerAccountB
    )
    entry.checkIntegrity()

    expect(entry.reason).toEqual(mocked.journalEntryData.reason)
    expect(entry.period).toEqual(new Period(mocked.journalEntryData.period))
    expect(entry.date).toEqual(new DateString(mocked.journalEntryData.date))
    expect(entry.id).toEqual(mocked.journalEntryData.id)
    let legs = entry.legs
    expect(legs.length).toEqual(2)
    expect(entry.allocatedLeg.ledgerAccountCode).toEqual(mocked.ledgerAccountA.code)
    expect(entry.allocatedLeg.amount.value).toEqual(100)
    expect(entry.oppositeLeg.ledgerAccountCode).toEqual(mocked.ledgerAccountB.code)
    expect(entry.oppositeLeg.amount.value).toEqual(-100)

    expect(entry.vatDate).toBeNull()
    let vatData = {
        date: "2010-12-31",
        lines: [{
            id: "any id",
            bruto: "100",
            vat: "10",
            netto: "90"
        }]
    }
    let orgAmount = entry.allocatedLeg.amount.value
    entry.setVAT(vatData)
    expect(entry.data.vatSpecificationData).toEqual(vatData)
    expect(entry.allocatedLeg.amount.value).toEqual(90)
    expect(entry.vatLegs.map(leg => leg.ledgerAccountCode)).toEqual([LEDGER_ACCOUNT.VAT_TO_BE_PAID])
    expect(entry.vatDate).toEqual(new Date(vatData.date))

    let updateDate = new DateString("2020-01-25")
    entry.date = updateDate
    expect(entry.vatDate).toEqual(updateDate.Date)

    vatData.lines = []
    entry.setVAT(vatData)
    expect(entry.data.vatSpecificationData).toBeUndefined()
    expect(entry.allocatedLeg.amount.value).toEqual(orgAmount)
    expect(entry.vatLegs.map(leg => leg.ledgerAccountCode)).toEqual([])

    entry.setVAT(null)
    expect(entry.data.vatSpecificationData).toBeUndefined()
    expect(entry.allocatedLeg.amount.value).toEqual(orgAmount)
    expect(entry.vatLegs.map(leg => leg.ledgerAccountCode)).toEqual([])

    vatData.lines = [{
            id: "any id",
            bruto: "100",
            vat: "0",
            netto: "100"
        }]
    entry.setVAT(vatData)
    expect(entry.data.vatSpecificationData).toEqual(vatData)
    expect(entry.allocatedLeg.amount.value).toEqual(100)
    expect(entry.vatLegs.map(leg => leg.ledgerAccountCode)).toEqual([])

    entry = JournalEntry.fromAllocation(mocked.journalEntryData.id,
        Amount.fromAmountCurrency(-100, ""),
        new DateString(mocked.journalEntryData.date),
        new Period(mocked.journalEntryData.period),
        mocked.journalEntryData.reason,
        mocked.ledgerAccountA,
        mocked.ledgerAccountB
    )
    entry.checkIntegrity()

    vatData.lines = [{
        id: "any id",
        bruto: "-100",
        vat: "-10",
        netto: "-90"
    }]
    entry.setVAT(vatData)
    expect(entry.vatLegs.map(leg => leg.ledgerAccountCode)).toEqual([
        LEDGER_ACCOUNT.VAT_TO_BE_CLAIMED
    ])



    entry.allocatedLeg.data.amountData = Amount.fromAmountCurrency(100, "XYZ")
    entry.oppositeLeg.data.amountData = Amount.fromAmountCurrency(200, "XYZ")
    expect(() => entry.checkIntegrity()).toThrow(AssertionError)
})
