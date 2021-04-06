import { EntryLeg } from "./EntryLeg"
import { Mocked } from "../mocks"
import { Amount } from "../Amount"

test("EntryLeg", () => {
    let mocked = new Mocked()
    let data = mocked.journalEntryData.entryLegsData[0]
    let leg = new EntryLeg(data)

    expect(leg.amount).toEqual(new Amount(data.amountData))
    expect(leg.ledgerAccountCode).toEqual(data.ledgerAccountCode)
    expect(leg.tag).toEqual("")

    mocked.ledgerScheme()
    let account = mocked.ledgerAccountA
    leg.ledgerAccount = account
    expect(leg.ledgerAccount).toEqual(account)

    const revLeg = leg.reversed()
    expect(revLeg.ledgerAccountCode).toEqual(leg.ledgerAccountCode)
    expect(revLeg.amount).toEqual(leg.amount.reversed())

    leg.data.tag = "Any tag"
    expect(leg.tag).toEqual("Any tag")
})
