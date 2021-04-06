import { Mocked } from "../mocks"
import { LiquidAssets } from "./LiquidAssets"
import { BankAccount } from "./BankAccount"
import { PeriodFilter } from "../PeriodFilter"
import { AccountStatement } from "./AccountStatement"
import { StatementEntry } from "./StatementEntry"
import { Amount } from "../Amount"

test("LiquidAssets", () => {
    let mocked = new Mocked()
    let data = mocked.state.liquidAssetsData
    let assets = new LiquidAssets(data)

    expect(assets.bankAccounts.map(a => a.id)).toEqual([mocked.bankAccountData.id])
    expect(assets.getBankAccount(mocked.bankAccountData.id)).toEqual(new BankAccount(mocked.bankAccountData))

    let filter = new PeriodFilter({periods: ["1950", "2050"]})
    let filteredAssets = assets.filterOnPeriod(filter)
    let bankAccount = filteredAssets.getBankAccount(mocked.bankAccountData.id)
    expect(bankAccount.accountStatementMap.accountStatements.map(s => s.id))
        .toEqual([mocked.accountStatementData.id])
    expect(bankAccount.statementEntryMap.statementEntries.map(e => e.id))
        .toEqual([mocked.statementEntryData.id]);

    [["1900", "1950"], ["2050", "2100"]].forEach(periods => {
        filter = new PeriodFilter({periods})
        filteredAssets = assets.filterOnPeriod(filter)
        bankAccount = filteredAssets.getBankAccount(mocked.bankAccountData.id)
        expect(bankAccount.accountStatementMap.accountStatements).toEqual([])
        expect(bankAccount.statementEntryMap.statementEntries).toEqual([])
    })

    expect(assets.getAccountStatementMap().accountStatements.map(s => s.id)).toEqual([mocked.accountStatementData.id])
    expect(assets.getAccountStatement(mocked.accountStatementData.id)).toEqual(new AccountStatement(mocked.accountStatementData))
    expect(assets.getAccountStatement("Any Unknown Id").data).toBeUndefined()

    expect(assets.getStatementEntryMap().statementEntries.map(e => e.id)).toEqual([mocked.statementEntryData.id])
    expect(assets.getStatementEntry(mocked.statementEntryData.id)).toEqual(new StatementEntry(mocked.statementEntryData))
    expect(assets.getStatementEntry("Any Unknown Id").data).toBeUndefined()

    let balances = assets.getBalances()
    expect(Object.keys(balances)).toEqual([mocked.bankAccountData.id])
    balances[mocked.bankAccountData.id].beginBalance!.data.amountData = mocked.getAmount(10).data
    balances[mocked.bankAccountData.id].endBalance!.data.amountData = mocked.getAmount(20).data
    expect(assets.getTotals(balances)).toEqual([mocked.getAmount(10), mocked.getAmount(20)])

    balances[mocked.bankAccountData.id].beginBalance = null
    balances[mocked.bankAccountData.id].endBalance = null
    expect(assets.getTotals(balances)).toEqual([new Amount(), new Amount()])
})