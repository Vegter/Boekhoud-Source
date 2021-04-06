import { StatementEntryData } from "../../model"
import { Amount } from "../Amount"
import { DateString } from "../DateString"
import { AccountStatement } from "./AccountStatement"
import { Accounting } from "../Accounting"
import { memoize } from "../../services/memoize"

/**
 * StatementEntry
 *
 * Specification of a deposit made into the bank account or a payment made out
 *
 * - Deposits in the form of income, cash deposits, etc.
 * - Withdrawals in the form of cash, cheques, etc.
 * - Any interest that was made on the account
 * - Any bank fees or charges for service
 */
export class StatementEntry {
    constructor(readonly data: StatementEntryData) {}

    /**
     * Unique identification of the StatementEntry
     */
    get id(): string {
        return this.data.id
    }

    /**
     * Returns the AccountStatement on which this StatementEntry is mentioned
     */
    @memoize()
    get accountStatement(): AccountStatement {
        return new Accounting().liquidAssets.getAccountStatement(this.data.accountStatementRef)
    }

    /**
     * Returns the party that is at the other side of this StatementEntry (creditor, debtor or bank)
     */
    get relatedParties(): string {
        return this.data.relatedParties
    }

    /**
     * The date when the transaction actually carries out or is supposed to carry out.
     */
    get valueDate(): DateString {
        return new DateString(this.data.valueDate)
    }

    /**
     * The date when the bank posts it in your account
     */
    get bookDate(): DateString {
        return new DateString(this.data.bookDate)
    }

    /**
     * The amount that is deposited of withdrawn from the BankAccount
     */
    get amount(): Amount {
        return new Amount(this.data.amountData)
    }

    /**
     * A description for the deposit of withdrawal
     */
    get description(): string {
        return [this.data.relatedParties, this.data.remittanceInformation].join(" ").trim()
    }

    /**
     * The year in which the transaction is booked (valueDate)
     */
    get year(): string {
        return this.valueDate.year
    }

    /**
     * Tells whether a StatementEntry is similar to another StatementEntry
     *
     * This can be used to book similar entries on the same LedgerAccount
     */
    isSimilar(other: StatementEntry) {
        return this.relatedParties.trim().toLowerCase() === other.relatedParties.trim().toLowerCase()
    }
}