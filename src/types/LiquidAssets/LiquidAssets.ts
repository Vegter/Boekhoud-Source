import { BankAccount } from "./BankAccount"
import { PeriodFilter } from "../PeriodFilter"
import {
    BankAccountData,
    BankImportStatementData,
    BankAccountMapData,
    StatementEntryMapData,
    AccountStatementMapData
} from "../../model"
import { StatementEntryMap } from "./StatementEntryMap"
import { AccountStatementMap } from "./AccountStatementMap"
import { AccountBalance } from "./AccountBalance"
import { Amount } from "../Amount"
import { DataMapping } from "../DataMapping"
import { AccountStatement } from "./AccountStatement"
import { StatementEntry } from "./StatementEntry"
import { clear, memoize } from "../../services/memoize"

type AccountBalanceMap = Record<string, {
    beginBalance: AccountBalance | null,
    endBalance: AccountBalance | null
}>

/**
 * LiquidAssets
 *
 * A liquid asset is an asset that can easily be converted into cash in a short amount of time
 * In the current implementation the only LiquidAssets are BankAccounts
 */
export class LiquidAssets extends DataMapping<BankAccountMapData, BankAccountData> {

    /**
     * Returns the LiquidAssets hold in BankAccounts
     */
    get bankAccounts(): BankAccount[] { return this.getItems(BankAccount) }

    /**
     * Returns the BankAccount with the given id
     * @param id
     */
    getBankAccount(id: string): BankAccount { return this.getItem(BankAccount, id) }

    /**
     * Returns LiquidAssets with assets that match the given periodFilter
     */
    filterOnPeriod(filter: PeriodFilter): LiquidAssets {
        return this.modify(LiquidAssets,(bankAccountData) => {
            const accountStatements = new AccountStatementMap(bankAccountData.accountStatementMapData)
            const statementEntries = new StatementEntryMap(bankAccountData.statementEntryMapData)
            return {
                ...bankAccountData,
                accountStatementMapData: accountStatements.filterOnPeriod(filter).data,
                statementEntryMapData: statementEntries.filterOnPeriod(filter).data
            }
        })
    }

    /**
     * Returns the total of all beginBalances and all endBalances
     */
    getTotals(balances: AccountBalanceMap): [Amount, Amount] {
        return Object.values(balances).reduce(([begin, end], balance) => {
            if (balance.beginBalance !== null) {
                begin = begin.add(balance.beginBalance.amount)
            }
            if (balance.endBalance !== null) {
                end = end.add(balance.endBalance.amount)
            }
            return [begin, end]
        }, [new Amount(), new Amount()])    }

    /**
     * Returns a Record of begin- and enBalance per bankAccount
     */
    getBalances(): AccountBalanceMap {
        return this.bankAccounts.reduce((result, bankAccount) => {
            result[bankAccount.id] = {
                beginBalance: bankAccount.beginBalance(),
                endBalance: bankAccount.endBalance()
            }
            return result
        }, {} as AccountBalanceMap)
    }

    @memoize()
    /**
     * Returns a Record of AccountStatements indexed by their id
     */
    getAccountStatementMap(): AccountStatementMap {
        const data = this.bankAccounts.reduce((result, bankAccount) => {
            result = {
                ...result,
                ...bankAccount.data.accountStatementMapData
            }
            return result
        }, {} as AccountStatementMapData)
        return new AccountStatementMap(data)
    }

    /**
     * Returns the AccountStatement with the given id
     * @param id
     */
    getAccountStatement(id: string) {
        return this.getAccountStatementMap().getAccountStatement(id)
    }

    @memoize()
    /**
     * Returns a Record of StatementEntries indexed by their id
     */
    getStatementEntryMap(): StatementEntryMap {
        const data = this.bankAccounts.reduce((result, bankAccount) => {
            result = {
                ...result,
                ...bankAccount.data.statementEntryMapData
            }
            return result
        }, {} as StatementEntryMapData)
        return new StatementEntryMap(data)
    }

    /**
     * Returns the StatementEntry with the given id
     * @param id
     */
    getStatementEntry(id: string) {
        return this.getStatementEntryMap().getStatementEntry(id)
    }

    @clear()
    addBankImportStatement(statementData: BankImportStatementData): {
        bankAccount: BankAccount,
        accountStatement: AccountStatement | null,
        statementEntries: StatementEntry[]
    } {
        const bankAccountId = statementData.bankAccountData.id
        this.addItemIfNotExists(bankAccountId, {
            ...statementData.bankAccountData,
            accountStatementMapData: {},
            statementEntryMapData: {}
        })

        const bankAccount = this.getItem(BankAccount, bankAccountId)
        const [ accountStatement, statementEntries] = bankAccount.add(statementData.accountStatementData,
                                                                      statementData.statementEntriesData)
        return { bankAccount, accountStatement, statementEntries }
    }
}
