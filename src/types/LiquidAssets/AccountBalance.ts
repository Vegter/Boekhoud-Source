import { Amount } from "../Amount"
import { AccountBalanceData } from "../../model"
import { DateString } from "../DateString"

/**
 * The account balance is the amount of money present at a given moment
 */
export class AccountBalance {
    constructor(readonly data: AccountBalanceData = {
        date: "",
        amountData: new Amount().data
    }) {}

    /**
     * Returns the amount of money
     */
    get amount(): Amount { return new Amount(this.data.amountData)}

    /**
     * Returns the date for which the balance is valid
     */
    get date(): DateString { return new DateString(this.data.date) }
}