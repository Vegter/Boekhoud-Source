import { BankImportStatement } from "./BankImportStatement"
import { BkToCstmrStmt } from "./CAMT053";
import { CreditDebit } from "../Amount"
import { AccountBalance } from "../LiquidAssets/AccountBalance"
import { LedgerScheme } from "../Ledger/LedgerScheme"
import {
    AccountBalanceData,
    PlainAccountStatementData,
    PlainBankAccountData,
    StatementEntryData
} from "../../model"

type TNtry = BkToCstmrStmt["Ntry"][0]
type TBal = BkToCstmrStmt["Bal"][0]

/**
 * CAMT053 Import Statement
 */
export class CAMT053ImportStatement extends BankImportStatement {

    constructor(statement: BkToCstmrStmt) {
        super(CAMT053ImportStatement.getBankAccount(statement),
              CAMT053ImportStatement.getAccountStatement(statement),
              statement.Ntry.map((ntry, i) =>
                  CAMT053ImportStatement.getStatementEntry(statement, ntry, i))
        )
    }

    /**
     * Gets the Bank Account data for the given statement
     */
    private static getBankAccount(statement: BkToCstmrStmt): PlainBankAccountData {
        return {
            id: statement.Acct.Id.IBAN ?? Object.values(statement.Acct.Id.Othr).join(""),
            currency: statement.Acct.Ccy,
            ledgerAccountCode: LedgerScheme.DefaultBankAccountCode,
        }
    }

    /**
     * Converts CAMT053 CRDT or DBIT strings to CreditDebit enum
     */
    private static asCreditDebit(CdtDbtInd: string) {
        return CdtDbtInd === "CRDT" ? CreditDebit.Credit : CreditDebit.Debit
    }

    /**
     * Gets the Account Balance data for the given balance (if available)
     */
    private static getAccountBalance(balance?: TBal): AccountBalanceData {
        if (balance) {
            return {
                date: balance.Dt,
                amountData: {
                    amount: balance.Amt,
                    currency: balance.Ccy,
                    creditDebit: CAMT053ImportStatement.asCreditDebit(balance.CdtDbtInd)
                }
            }
        } else {
            return new AccountBalance().data
        }
    }

    /**
     * Get the Account Statement data for the given statement
     */
    private static getAccountStatement(statement: BkToCstmrStmt): PlainAccountStatementData {
        const openingBalance = statement.Bal.find((bal: TBal) => bal.Tp.CdOrPrtry.Cd === "OPBD")
        const closingBalance = statement.Bal.find((bal: TBal) => bal.Tp.CdOrPrtry.Cd === "CLBD")
        return {
            id: statement.Id,
            openingBalanceData: CAMT053ImportStatement.getAccountBalance(openingBalance),
            closingBalanceData: CAMT053ImportStatement.getAccountBalance(closingBalance),
        }
    }

    /**
     * Get the Statement Entry data for the given statement
     */
    private static getStatementEntry(statement: BkToCstmrStmt, ntry: TNtry, i: number): StatementEntryData {
        return {
            id: ntry.NtryRef || `${statement.Id}.${i}`,
            amountData: {
                amount: ntry.Amt,
                currency: ntry.Ccy,
                creditDebit: CAMT053ImportStatement.asCreditDebit(ntry.CdtDbtInd)
            },
            bookDate: ntry.BookgDt,
            valueDate: ntry.ValDt,
            relatedParties: ntry.Nm,
            remittanceInformation: ntry.RmtInf,
            accountStatementRef: statement.Id
        }
    }
}