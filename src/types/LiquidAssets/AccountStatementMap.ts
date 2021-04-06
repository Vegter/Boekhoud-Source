import {
    AccountStatementData,
    AccountStatementMapData,
} from "../../model"
import { PeriodFilter } from "../PeriodFilter"
import { DateString } from "../DateString"
import { DataMapping } from "../DataMapping"
import { AccountStatement } from "./AccountStatement"
import { sortedArray } from "../../services/utils"
import { AccountBalance } from "./AccountBalance"
import { memoize } from "../../services/memoize"

/**
 * A Record of AccountStatements indexed by id
 */
export class AccountStatementMap extends DataMapping<AccountStatementMapData, AccountStatementData> {

    /**
     * Returns an AccountStatementMap with statements that match the given periodFilter
     */
    filterOnPeriod(periodFilter: PeriodFilter): AccountStatementMap {
        const filterCondition = (_: string, accountStatementData: AccountStatementData) =>
            periodFilter.dateInRange(new DateString(accountStatementData.closingBalanceData.date))
        return this.filter(AccountStatementMap, filterCondition)
    }

    /**
     * Returns a list of AccountStatements sorted on data, ascending
     */
    @memoize()
    get accountStatements(): AccountStatement[] {
        return sortedArray(Object.values(this.data), data => new AccountBalance(data.closingBalanceData).date.id)
            .map(data => new AccountStatement(data))
    }

    /**
     * Returns the AccountStatement with the given id
     */
    getAccountStatement(id: string): AccountStatement {
        return this.getItem(AccountStatement, id)
    }
}