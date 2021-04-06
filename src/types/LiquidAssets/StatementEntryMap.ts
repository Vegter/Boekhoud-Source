import { StatementEntryData, StatementEntryMapData } from "../../model"
import { Amount, CreditDebit } from "../Amount"
import { StatementEntry } from "./StatementEntry"
import { DataMapping } from "../DataMapping"
import { PeriodFilter } from "../PeriodFilter"
import { DateString } from "../DateString"

export interface EntryTotals {
    statements: number,
    total: Amount,
    debit: Amount,
    credit: Amount
}

/**
 * Record of StatementEntries indexed by id
 */
export class StatementEntryMap extends DataMapping<StatementEntryMapData, StatementEntryData> {

    /**
     * Get a list of all StatementEntries
     */
    get statementEntries(): StatementEntry[] { return this.getItems(StatementEntry) }

    /**
     * Get a StatementEntry by id
     */
    getStatementEntry(id: string): StatementEntry { return this.getItem(StatementEntry, id) }

    /**
     * Tells whether the given StatementEntry is contained in this Record
     */
    contains(statementEntry: StatementEntry) { return this.hasItem(statementEntry.id) }

    /**
     * Get a list of StatementEntries that are considered similar to the given statementEntry
     *
     * The list will at least have one StatementEntry as an entry is considered similar to itself
     */
    getSimilarEntries(entry: StatementEntry): StatementEntry[] {
        return this.getItems(StatementEntry)
            .filter(e => e.isSimilar(entry))
    }

    /**
     * Returns a new StatementEntryMap with only entries that match the given filter
     */
    filterOnPeriod(periodFilter: PeriodFilter): StatementEntryMap {
        return this.filter(StatementEntryMap,(_, statementEntryData) =>
            periodFilter.dateInRange(new DateString(statementEntryData.valueDate)))
    }

    /**
     * Get the totals (count, total, total debit, total credit) of all entries in this Record
     */
    getTotals(): EntryTotals {
        return this.getItems(StatementEntry)
            .reduce((totals: EntryTotals, statement) => {
                const amount = statement.amount

                totals.statements += 1
                totals.total = totals.total.add(amount)
                if (amount.creditDebit === CreditDebit.Credit) {
                    totals.credit = totals.credit.add(amount)
                } else {
                    totals.debit = totals.debit.add(amount)
                }
                return totals
            }, {
                statements: 0,
                total: new Amount(),
                debit: new Amount(),
                credit: new Amount()
            } as EntryTotals)
    }
}