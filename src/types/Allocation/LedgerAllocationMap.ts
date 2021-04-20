import { LedgerAllocationMapData } from "../../model"
import { PeriodFilter } from "../PeriodFilter"
import { LedgerAllocation } from "./LedgerAllocation"
import { StatementEntry } from "../LiquidAssets/StatementEntry"
import { Accounting } from "../Accounting"
import { JournalEntry } from "../Journal/JournalEntry"
import { LedgerAccount, UNMAPPED_ACCOUNT } from "../Ledger/LedgerAccount"
import { BankAccount } from "../LiquidAssets/BankAccount"
import { Period } from "../Period"
import assert from "assert"
import { sortedArray } from "../../services/utils"

/**
 * Record of LedgerAllocations indexed by id
 */
export class LedgerAllocationMap {
    constructor(readonly data: LedgerAllocationMapData) {}

    private static get accounting() { return new Accounting() }

    /**
     * Get a LedgerAllocation by id
     */
    getAllocation(id: string): LedgerAllocation {
        // assert(id in this.data)
        return new LedgerAllocation(this.data[id])
    }

    /**
     * Tells whether an allocation with the given id exists in the map
     * @param id
     */
    hasAllocation(id: string): boolean {
        return id in this.data
    }

    /**
     * Get all LedgerAllocations, sorted descending
     */
    get allocations(): LedgerAllocation[] {
        const allocations = Object.values(this.data).map(data => new LedgerAllocation(data))
        return sortedArray(allocations, a => a.sortKey, false)
    }

    /**
     * Tells the number of ledgerAllocations in the map
     */
    get length(): number {
        return Object.keys(this.data).length
    }

    /**
     * Returns a new LedgerAllocationMap with keys sorted on the sortKey of the LedgerAllocations
     */
    sorted(): LedgerAllocationMap {
        const sortedAllocations = this.allocations.sort(LedgerAllocation.sort)
        const data = sortedAllocations.reduce((result, allocation) => {
            result[allocation.id] = allocation.data
            return result
        }, {} as LedgerAllocationMapData)
        return new LedgerAllocationMap(data)
    }

    /**
     * Get all ledgerAccounts that are used in at least 1 ledgerAllocation
     * The results are sorted ascending
     */
    getLedgerAccounts(): LedgerAccount[] {
        const result = this.allocations.reduce((result, allocation) => {
            const ledgerAccount = allocation.ledgerAccount
            result[ledgerAccount.code] = allocation.ledgerAccount
            return result
        }, {} as Record<string, LedgerAccount>)
        return sortedArray(Object.values(result), LedgerAccount.sortKey)
    }

    /**
     * Get all periods that are used in at least 1 ledgerAllocation
     */
    getPeriods(): Period[] {
        const result = this.allocations.reduce((result, allocation) => {
            const period = allocation.period
            result[period.string] = period
            return result
        }, {} as Record<string, Period>)
        return Object.values(result)
    }

    /**
     * Gets the number of mapped and yet unmapped ledgerAllocations
     */
    getMappedUnmapped(): [number, number] {
        return Object.values(this.data)
            .reduce(([mapped, unmapped], allocationData): [number, number] => {
                const ledgerAccount = new LedgerAllocation(allocationData).ledgerAccount
                if (ledgerAccount.isUnmapped()) {
                    unmapped++
                } else {
                    mapped++
                }
                return [mapped, unmapped]
            }, [0, 0])
    }

    /**
     * Return a new LedgerAllocationMap that holds only ledgerAllocations that match the given filter
     */
    filterOnPeriod(periodFilter: PeriodFilter): LedgerAllocationMap {
        const data = Object.fromEntries(
            Object.entries(this.data)
                .filter(([_, allocationData]) => {
                    const allocation = new LedgerAllocation(allocationData)
                    const parentData = allocationData.parentRef && this.data[allocationData.parentRef]
                    const parent = parentData && new LedgerAllocation(parentData)
                    const children = allocationData.childrenRefs.map(c => new LedgerAllocation(this.data[c]))
                    return periodFilter.periodInRange(allocation.period) ||
                        (parent && periodFilter.periodInRange(parent.period)) ||
                        (children.some(c => periodFilter.periodInRange(c.period)))
                })
        )
        return new LedgerAllocationMap(data)
    }

    /**
     * Update the ledgerAllocations in the map for the ledgerAccount of the given bankAccount
     *
     * All parent ledgerAllocations that are bound to statementEntry of the given bankAccount
     * are updated for the new ledgerAccount of the given bankAccount
     */
    updateStatementEntries(bankAccount: BankAccount) {
        const statementEntries = bankAccount.statementEntryMap
        this.allocations.forEach(allocation => {
            if (!allocation.hasParent() && statementEntries.contains(allocation.statementEntry)) {
                allocation.journalEntry.oppositeLeg.ledgerAccount = bankAccount.ledgerAccount
            }
        })
    }

    /**
     * Add ledgerAllocations for the given statementEntries
     *
     * Each new ledgerAllocation is bound to a statementEntry and is unmapped
     */
    addStatementEntries(bankAccount: BankAccount, statementEntries: StatementEntry[]) {
        statementEntries.forEach(entry => {
            const allocation = LedgerAllocation.fromStatementEntry(entry)
            const period = Period.fromDate(entry.valueDate)
            this.add(allocation, bankAccount.ledgerAccount, period)
        })
    }

    /**
     * Adds an allocation to the map
     *
     * The opposite account is normally the ledgerAccount of the bankAccount
     */

    private add(allocation: LedgerAllocation, oppositeAccount: LedgerAccount, period: Period): void {
        // Add allocation, do not overwrite
        if (!this.data[allocation.id]) {
            this.data[allocation.id] = allocation.data

            const entry = allocation.statementEntry
            const journalEntry = JournalEntry.fromAllocation(
                allocation.id,
                entry.amount,
                entry.valueDate,
                period,
                entry.description,
                UNMAPPED_ACCOUNT,
                oppositeAccount)
            LedgerAllocationMap.accounting.journal.add(journalEntry)

            allocation.journalEntry = journalEntry
        }
    }

    /**
     * Add a child to the ledgerAllocationMap
     */
    addChild(parent: LedgerAllocation, child: LedgerAllocation, period: Period) {
        this.add(child, parent.ledgerAccount, period)
        parent.addChild(child)
    }

    /**
     * Removes a child
     *
     * The child is removed from the parent and the child is removed from the map
     */
    removeChild(child: LedgerAllocation) {
        assert(child.parent)
        child.parent.removeChild(child)
        this.remove(child)
    }

    /**
     * Removes an allocation from the map
     */
    private remove(allocation: LedgerAllocation): void {
        delete this.data[allocation.id]
        LedgerAllocationMap.accounting.journal.remove(allocation.journalEntry)
    }

    /**
     * Returns unmapped allocations that are bound to the given entries
     */
    private getUnallocatedEntries(entries: StatementEntry[]): LedgerAllocation[] {
        return entries
            .map(entry => this.getAllocation(entry.id))
            .filter(allocation => allocation.ledgerAccount.isUnmapped())
    }

    /**
     * Get a list of similar allocations
     *
     * Child allocations do not have similar allocations
     * For an unmapped allocation the allocations that are bound to similar statementEntries are returned
     * For a mapped allocation the allocations that are bound to the same ledgerAccount are returned
     */
    getSimilarAllocations(allocation: LedgerAllocation): LedgerAllocation[] {
        if (allocation.hasParent()) {
            // Similarity is at parent level, child allocations do not have similar allocations
            return []
        } else if (allocation.ledgerAccount.isUnmapped()) {
            // Return all similar unmapped allocations (bound to similar statementEntries)
            const statements = new Accounting().liquidAssets.getStatementEntryMap()
            const entries = statements.getSimilarEntries(allocation.statementEntry)
            return this.getUnallocatedEntries(entries)
        } else {
            // Return all allocations that are booked on the same account
            return this.allocations.filter(a => a.ledgerAccount.equals(allocation.ledgerAccount))
        }
    }
}