import { AccountStatementMap } from "./AccountStatementMap"
import { Mocked } from "../mocks"
import { PeriodFilter } from "../PeriodFilter"

test("AccountStatementMap", () => {
    let mocked = new Mocked()

    let data = mocked.accountStatementData
    let dataBefore = { ...mocked.accountStatementData }
    dataBefore.id = data.id + "a"
    dataBefore.closingBalanceData.date = "1900-01-01"
    let dataAfter = { ...mocked.accountStatementData }
    dataAfter.id = data.id + "b"
    dataAfter.closingBalanceData.date = "2100-01-01"
    let st = new AccountStatementMap({
        [dataAfter.id]: dataAfter,
        [dataBefore.id]: dataBefore,
        [data.id]: data
    })
    expect(st.getAccountStatement(data.id).id).toEqual(data.id)

    expect(st.accountStatements.map(s => s.id)).toEqual([dataBefore.id, data.id, dataAfter.id])

    let filter = new PeriodFilter({periods: ["1950", "2050"]})
    expect(st.filterOnPeriod(filter).accountStatements.map(s => s.id)).toEqual([data.id])

    filter = new PeriodFilter({periods: ["1950", "2150"]})
    expect(st.filterOnPeriod(filter).accountStatements.map(s => s.id)).toEqual([data.id, dataAfter.id])

    filter = new PeriodFilter({periods: ["1850", "2150"]})
    expect(st.filterOnPeriod(filter).accountStatements.map(s => s.id)).toEqual([dataBefore.id, data.id, dataAfter.id])

})