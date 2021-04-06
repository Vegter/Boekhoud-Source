import { BalanceInfo, Statement as MT940Statement, Transaction as MT940Transaction } from "mt940-js";
import { BankImportStatement } from "./BankImportStatement"
import { CreditDebit } from "../Amount"
import { AccountBalance } from "../LiquidAssets/AccountBalance"
import { LedgerScheme } from "../Ledger/LedgerScheme"
import {
    AccountBalanceData,
    StatementEntryData,
    PlainBankAccountData,
    PlainAccountStatementData
} from "../../model"
import { DEFAULT_CURRENCY } from "../../config"

/**
 * MT940 Import Statement
 */
export class MT940ImportStatement extends BankImportStatement {
    constructor(statement: MT940Statement) {
        super(MT940ImportStatement.getBankAccount(statement),
              MT940ImportStatement.getAccountStatement(statement),
              statement.transactions.map((transaction: MT940Transaction) =>
                  MT940ImportStatement.getStatementEntry(statement, transaction))
        )
    }

    /**
     * Gets the BankAccount data for the given statement
     */
    private static getBankAccount(statement: MT940Statement): PlainBankAccountData {
        const accountId = (statement.accountId ?? "").split(" ")[0]
        return {
            id: accountId,
            currency: DEFAULT_CURRENCY,
            ledgerAccountCode: LedgerScheme.DefaultBankAccountCode
        }
    }

    /**
     * Gets the AccountBalance for the given Balance data
     */
    private static getAccountBalance(balance?: BalanceInfo): AccountBalanceData {
        if (balance) {
            return {
                date: balance.date,
                amountData: {
                    amount: balance.value,
                    currency: balance.currency,
                    creditDebit: balance.isCredit ? CreditDebit.Credit : CreditDebit.Debit
                }
            }
        } else {
            return new AccountBalance().data
        }
    }

    /**
     * Get the Account Statement Data for the given statement
     */
    private static getAccountStatement(statement: MT940Statement): PlainAccountStatementData {
        return {
            id: statement.number ?? "",
            openingBalanceData: MT940ImportStatement.getAccountBalance(statement.openingBalance),
            closingBalanceData: MT940ImportStatement.getAccountBalance(statement.closingBalance),
        }
    }

    /**
     * Get the description tags for the given statement
     *
     * As a last resort a 999 tag is included that is the complete description text (without 999)
     */
    private static getDescriptionTags(transaction: MT940Transaction): Record<string, string> {
        const description = transaction.description

        function setTag(tagName?:string, tagValueStart?:number, tagValueEnd?:number) {
            if (tagName && tagValueStart) {
                tags[tagName] = description.substring(tagValueStart, tagValueEnd ?? description.length)
            }
        }

        const tags:Record<string, string> = {}
        const tagsRe = new RegExp("/([A-Z]{2,})/", "g")

        let match, tagName = "", tagStart = undefined
        do {
            match = tagsRe.exec(description)
            if (match) {
                const [nextTag, nextTagName] = match
                const nextTagStart = description.indexOf(nextTag)
                setTag(tagName, tagStart, nextTagStart);

                [tagName, tagStart] = [nextTagName, nextTagStart + nextTag.length]
            }
        } while (match)
        setTag(tagName, tagStart)

        // Last resort...
        tags["999"] = transaction.description.replace(/^999/, "")

        return tags
    }


    /**
     * Get the Statement Entry Data for the given statement and transaction
     */
    private static getStatementEntry(statement: MT940Statement, transaction: MT940Transaction): StatementEntryData {
        const tags = this.getDescriptionTags(transaction)
        return {
            id: transaction.id,
            amountData: {
                amount: transaction.amount,
                currency: transaction.currency,
                creditDebit: transaction.isCredit ? CreditDebit.Credit : CreditDebit.Debit
            },
            bookDate: transaction.valueDate,
            valueDate: transaction.valueDate,
            relatedParties: tags["NAME"] || "",
            remittanceInformation: tags["REMI"] || tags["TRTP"] || (tags["NAME"] ? "" : tags["999"]),
            accountStatementRef: statement.number || ""
        }
    }
}
