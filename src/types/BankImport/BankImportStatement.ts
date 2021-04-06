import {
    BankImportStatementData,
    PlainAccountStatementData,
    PlainBankAccountData,
    StatementEntryData
} from "../../model"

/**
 * Bank Import Statement
 *
 * A Bank Import Statement is either a MT940 or CAMT053 Bank Import Statement
 */
export class BankImportStatement {
    data: BankImportStatementData

    constructor(bankAccount: PlainBankAccountData,
                accountStatement: PlainAccountStatementData,
                statementEntries: StatementEntryData[]) {

        const statementRef = (ref: string) => [bankAccount.id, ref].join(".")

        // Make accountStatement id unique
        accountStatement.id = statementRef(accountStatement.id)
        statementEntries.forEach(s => s.accountStatementRef = statementRef(s.accountStatementRef))
        this.data = {
            bankAccountData: bankAccount,
            accountStatementData: accountStatement,
            statementEntriesData: statementEntries
        }
    }

    get statementEntryCount() { return this.data.statementEntriesData.length }
}
