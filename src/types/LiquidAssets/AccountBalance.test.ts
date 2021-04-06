import { AccountBalance } from "./AccountBalance"
import { Mocked } from "../mocks"
import { Amount } from "../Amount"
import { DateString } from "../DateString"

test("AccountBalance", () => {
    let mocked = new Mocked()
    let balance = new AccountBalance(mocked.accountStatementData.openingBalanceData)

    expect(balance.amount).toEqual(new Amount(mocked.accountStatementData.openingBalanceData.amountData))
    expect(balance.date).toEqual(new DateString(mocked.accountStatementData.openingBalanceData.date))

    balance = new AccountBalance()
    expect(balance.amount).toEqual(new Amount())
    expect(balance.date).toEqual(new DateString(""))
})