import { AccountStatementData } from "../../model"
import { AccountBalance } from "./AccountBalance"

/**
 * An account statement is a periodic summary of account activity with a beginning date and an ending date
 */
export class AccountStatement {
    constructor(readonly data: AccountStatementData) {}

    /**
     * The unique identification of the accountStatement
     */
    get id() {
        return this.data.id
    }

    /**
     * The amount of money present at the end date of the accountStatement
     */
    get closingBalance() {
        return new AccountBalance(this.data.closingBalanceData)
    }

    /**
     * The amount of money present at the begin date of the accountStatement
     */
    get openingBalance() {
        return new AccountBalance(this.data.openingBalanceData)
    }
}
