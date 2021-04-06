import { Mocked } from "../mocks"
import { StatementEntryMap } from "./StatementEntryMap"
import { StatementEntry } from "./StatementEntry"

test("StatementEntryMap", () => {
    const mocked = new Mocked()
    let map = new StatementEntryMap({
        [mocked.statementEntryData.id]: mocked.statementEntryData
    })

    expect(map.statementEntries.map(e => e.id)).toEqual([mocked.statementEntryData.id])
    let entry = map.getStatementEntry(mocked.statementEntryData.id)
    expect(entry).toEqual(new StatementEntry(mocked.statementEntryData))
    expect(map.contains(new StatementEntry(mocked.statementEntryData))).toEqual(true)

    let otherEntry = new StatementEntry({
        ...entry.data,
        id: "Any other Id",
        amountData: mocked.getAmount(10)
    })
    expect(map.contains(otherEntry)).toEqual(false)

    let andAnotherEntry = new StatementEntry({
        ...entry.data,
        id: "And Any other Id",
        relatedParties: "Any other Party",
        amountData: mocked.getAmount(-15)
    })

    map = new StatementEntryMap({
        [mocked.statementEntryData.id]: mocked.statementEntryData,
        [otherEntry.id]: otherEntry.data,
        [andAnotherEntry.id]: andAnotherEntry.data
    })
    expect(map.getSimilarEntries(entry)).toEqual([entry, otherEntry])

    expect(map.getTotals()).toEqual({
        statements: 3,
        total: mocked.getAmount(-5),
        debit: mocked.getAmount(-15),
        credit: mocked.getAmount(10)
    })


})