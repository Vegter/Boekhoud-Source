import { AccountStatement } from "./AccountStatement"
import { AccountBalance } from "./AccountBalance"
import { LedgerScheme } from "../Ledger/LedgerScheme"
import {
    AccountBalanceData,
    BankAccountData,
    StatementEntryData,
    PlainAccountStatementData
} from "../../model"
import { LedgerAccount } from "../Ledger/LedgerAccount"
import { StatementEntryMap } from "./StatementEntryMap"
import { IBAN } from "../IBAN"
import { StatementEntry } from "./StatementEntry"
import { AccountStatementMap } from "./AccountStatementMap"

/**
 * A bank account is a financial account maintained by a bank or other financial institution
 * in which the financial transactions between the bank and a customer are recorded
 */
export class BankAccount {

    constructor(readonly data: BankAccountData) {}

    /**
     * The unique identification of the BankAccount
     */
    get id(): string { return this.data.id }

    /**
     * Returns the international bank account number (IBAN) of the BankAccount
     *
     * A standard international numbering system for individual bank accounts around the world
     */
    get IBAN(): IBAN { return new IBAN(this.data.id) }

    /**
     * Returns the LedgerAccount that is associated with the BankAccount
     */
    get ledgerAccount() { return LedgerScheme.getAccount(this.data.ledgerAccountCode) }

    /**
     * Add a statement and its entries to the BankAccount
     *
     * If the statement of an entry already exists it will be skipped
     * Only new statements and entries will be registered
     */
    public add(statement: PlainAccountStatementData,
               entries: StatementEntryData[]): [ AccountStatement | null, StatementEntry[]] {
        let newStatement : AccountStatement | null = null
        const newEntries: StatementEntry[] = []

        const statementId = statement.id
        if (!this.data.accountStatementMapData[statementId]) {
            // Add new statement
            newStatement = new AccountStatement(statement)
            this.data.accountStatementMapData[statementId] = newStatement.data
        }

        entries.forEach(entryData => {
            const entryId = entryData.id
            if (!this.data.statementEntryMapData[entryId]) {
                // Add new statement entries
                const newEntry = new StatementEntry(entryData)
                this.data.statementEntryMapData[entryData.id] = newEntry.data
                newEntries.push(newEntry)
            }
        })

        return [ newStatement, newEntries ]
    }

    /**
     * Returns a Record of statements indexed by statement id
     */
    get accountStatementMap(): AccountStatementMap {
        return new AccountStatementMap(this.data.accountStatementMapData)
    }

    /**
     * Returns a Record of statementEntries indexed by entry id
     */
    get statementEntryMap() {
        return new StatementEntryMap(this.data.statementEntryMapData)
    }

    /**
     * Returns the oldest begin balance of the bankAccount
     */
    public beginBalance(): AccountBalance | null {
        let result: Partial<AccountBalanceData> = {}
        const statements = Object.values(this.data.accountStatementMapData)
        statements.forEach(statement => {
            // Take first openingBalance for the specific date
            if (!result.date || statement.openingBalanceData.date < result.date) {
                result.date = statement.openingBalanceData.date
                result.amountData = statement.openingBalanceData.amountData
            }
        })
        return result.date ? new AccountBalance(result as AccountBalanceData) : null
    }

    /**
     * Returns the latest end balance of the bankAccount
     */
    public endBalance(): AccountBalance | null {
        let result: Partial<AccountBalanceData> = {}
        const statements = Object.values(this.data.accountStatementMapData)
        statements.forEach(statement => {
            // Take last closingBalance for the specific date
            if (!result.date || statement.closingBalanceData.date >= result.date) {
                result.date = statement.closingBalanceData.date
                result.amountData = statement.closingBalanceData.amountData
            }
        })
        return result.date ? new AccountBalance(result as AccountBalanceData) : null
    }

    /**
     * Updates the LedgerAccount that is associated with the BankAccount
     */
    set ledgerAccount(ledgerAccount: LedgerAccount) {
        this.data.ledgerAccountCode = ledgerAccount.code
    }
}
