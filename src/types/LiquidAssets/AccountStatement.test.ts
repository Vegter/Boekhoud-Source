import { Mocked } from "../mocks"
import { AccountStatement } from "./AccountStatement"
import { AccountBalance } from "./AccountBalance"

test("AccountStatement", () => {
    let mocked = new Mocked()
    let st = new AccountStatement(mocked.accountStatementData)

    expect(st.id).toEqual(mocked.accountStatementData.id)
    expect(st.openingBalance).toEqual(new AccountBalance(mocked.accountStatementData.openingBalanceData))
    expect(st.closingBalance).toEqual(new AccountBalance(mocked.accountStatementData.closingBalanceData))
})