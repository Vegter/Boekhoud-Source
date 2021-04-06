import { StatementEntry } from "./StatementEntry"
import { Mocked } from "../mocks"
import { DateString } from "../DateString"
import { Amount } from "../Amount"

class MockLiquidAssets {
    static getAccountStatement = jest.fn()
}

jest.mock("../Accounting", () => {
    return {
        Accounting: class {
            get liquidAssets() { return MockLiquidAssets }
            static get State() { return "Any AccountingState" }
            static set CurrentState(_: any) {}
        }
    }
})

test("StatementEntry", () => {
    let mocked = new Mocked()

    let data = mocked.statementEntryData
    let entry = new StatementEntry(data)

    expect(entry.relatedParties).toEqual(data.relatedParties)
    expect(entry.valueDate).toEqual(new DateString(data.valueDate))
    expect(entry.bookDate).toEqual(new DateString(data.bookDate))
    expect(entry.amount).toEqual(new Amount(data.amountData));

    [data.remittanceInformation, data.relatedParties].forEach(e => {
        expect(entry.description.includes(e)).toEqual(true)
    })

    expect(entry.year).toEqual(data.valueDate.substr(0, 4))

    let otherData = {...data}
    otherData.relatedParties = ` ${data.relatedParties.toUpperCase()} `
    expect(entry.isSimilar(new StatementEntry(otherData))).toEqual(true)

    expect(entry.accountStatement).toBeUndefined()  // mocked
    expect(MockLiquidAssets.getAccountStatement).toHaveBeenCalledWith(data.accountStatementRef)
})