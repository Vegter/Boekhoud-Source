import { LedgerAllocationData, VATSpecificationData } from "../../model"

import { LedgerAccount } from "../Ledger/LedgerAccount"
import { StatementEntry } from "../LiquidAssets/StatementEntry"
import { JournalEntry } from "../Journal/JournalEntry"
import { Accounting } from "../Accounting"
import { arrayRemoveElement } from "../../services/utils"
import { Period } from "../Period"
import { LedgerScheme } from "../Ledger/LedgerScheme"
import { AllocationFilter } from "../AllocationFilter"
import { Amount } from "../Amount"

/**
 * LedgerAllocation
 *
 * Allocate a BankAccount StatementEntry to a LedgerAccount
 * Creates a JournalEntry with two legs:
 * - AllocatedLeg for the allocation of the deposit or withdrawal of the BankAccount
 * - OppositeLeg for the BankAccount booking
 */
export class LedgerAllocation {
    constructor(readonly data: LedgerAllocationData) {}

    /**
     * Unique identification of the LedgerAllocation
     */
    get id(): string { return this.data.id }

    /**
     * Gets access to the Accounting environment in which the allocation lives
     */
    private static get accounting() { return new Accounting() }

    /**
     * A reference to the JournalEntry for this allocation
     */
    private get journalEntryRef(): string { return this.data.journalEntryRef }

    /**
     * A reference to the BankAccount StatementEntry for this allocation
     */
    private get statementEntryRef(): string { return this.data.statementEntryRef }

    /**
     * A reference to any parent of this allocation
     *
     * When an allocation is assigned a new period it is split in two allocations
     * The parent is the original allocation, the child is the new (splitted) allocation in the new period
     */
    get parentRef(): string | null { return this.data.parentRef }

    /**
     * A reference to any children of this allocation
     *
     * When an allocation is assigned a new period it is split in two allocations
     * The parent is the original allocation, the child is the new (splitted) allocation in the new period
     */
    get childrenRefs(): string[] { return this.data.childrenRefs }

    /**
     * The parent LedgerAllocation for this allocation
     */
    get parent(): LedgerAllocation | null {
        if (this.parentRef !== null) {
            return LedgerAllocation.accounting.allocations.getAllocation(this.parentRef)
        }
        return null
    }

    /**
     * A virtual attribute to allow sorting allocations
     *
     * Sorting is on the date of the statementEntry and the id of the allocation
     * Sorting on id takes care that parents come before any children
     */
    get sortKey(): string { return this.statementEntry.valueDate.string + "." + this.id }

    /**
     * Sort method for ledgerAllocation
     *
     * Compares two ledgerAllocations on the basis of their sortKey
     */
    static sort(a1: LedgerAllocation, a2: LedgerAllocation) {
        const s1 = a1.sortKey
        const s2 = a2.sortKey
        return s1 < s2 ? -1 : s1 > s2 ? 1 : 0
    }

    /**
     * Returns a list of LedgerAllocations that are children of this allocation
     */
    get children() : LedgerAllocation[] {
        return this.childrenRefs.map(id => LedgerAllocation.accounting.allocations.getAllocation(id))
    }

    /**
     * Returns the period for this allocation, being the period of the associated JournalEntry
     */
    get period(): Period {
        return this.journalEntry.period
    }

    /**
     * Returns the ledgerAccount for this allocation
     * Being the ledgerAccount of the allocated leg of the associated JournalEntry
     */
    get ledgerAccount(): LedgerAccount {
        return this.journalEntry.allocatedLeg.ledgerAccount
    }

    /**
     * Returns the code of the ledgerAccount for this allocation
     * Being the code of the ledgerAccount of the allocated leg of the associated JournalEntry
     */
    get ledgerAccountCode(): string {
        return this.journalEntry.allocatedLeg.ledgerAccountCode
    }

    /**
     * Returns the statementEntry for this allocation
     */
    get statementEntry(): StatementEntry {
        return LedgerAllocation.accounting.liquidAssets.getStatementEntry(this.statementEntryRef)
    }

    /**
     * Returns the journalEntry for this allocation
     */
    get journalEntry(): JournalEntry {
        return LedgerAllocation.accounting.journal.getJournalEntry(this.journalEntryRef)
    }

    /**
     * Returns the amount that has been allocated by this allocation
     */
    get amount(): Amount {
        return this.journalEntry.allocatedLeg.amount
    }

    /**
     * Tells whether this allocation is equal to another allocation
     * @param other
     */
    equals(other: LedgerAllocation) {
        return other.id === this.id
    }

    /**
     * Tells whether this allocation has any children
     */
    hasChildren() : boolean { return this.data.childrenRefs.length > 0}

    /**
     * Tells whether this allocation has a parent
     */
    hasParent(): boolean { return this.data.parentRef !== null }

    /**
     * Tells whether the allocation matches the given allocationFilter
     *
     * In order to match period and ledgerAccount should match (if set in the filter)
     */
    matches(allocationFilter: AllocationFilter): boolean {
        const { period, ledgerAccountCode } = allocationFilter
        return ((period === null || period.equals(this.period)) &&
                (ledgerAccountCode === null || ledgerAccountCode === this.ledgerAccountCode))
    }

    /**
     * Creates a new LedgerAllocation from a BankAccount StatementEntry
     */
    static fromStatementEntry(entry: StatementEntry): LedgerAllocation {
        return new LedgerAllocation({
            id: entry.id,
            statementEntryRef: entry.id,
            journalEntryRef: "",
            parentRef: null,
            childrenRefs: []
        })
    }

    /**
     * Gets an id for a child ledgerAllocation
     */
    getSplitId(period: Period) { return `${this.id}.${period.string}` }

    /**
     * Splits an allocation
     *
     * Creates a new allocation in the given period
     * The parent of the new allocation is set to this allocation
     */
    private splitAllocation(period: Period): LedgerAllocation {
        const ledgerAllocationData: LedgerAllocationData = {
            id: this.getSplitId(period),
            statementEntryRef: this.statementEntry.id,
            journalEntryRef: "",
            parentRef: this.id,    // Connect child to parent
            childrenRefs: []
        }
        return new LedgerAllocation(ledgerAllocationData)
    }

    /**
     * Unsplit an allocation
     *
     * Removes the child from its parent
     */
    private unsplitAllocation(): void {
        this.parent!.removeChild(this)
    }

    /**
     * Updates the ledgerAccount of the allocation
     *
     * Any child will have a oppositeLeg that mirrors the allocatedLeg of the allocation
     * The mirroring is established by updating the oppositeLegs of any children allocations
     */
    set ledgerAccount(ledgerAccount: LedgerAccount) {
        // Update allocated leg
        this.journalEntry.allocatedLeg.ledgerAccount = ledgerAccount

        // Update any child entryLegsData
        this.children.forEach(child => {
            child.journalEntry.oppositeLeg.ledgerAccount = ledgerAccount
        })
    }

    getVAT(): VATSpecificationData | null {
        return this.journalEntry.getVAT()
    }

    setVAT(vatSpecificationData: VATSpecificationData | null) {
        this.journalEntry.setVAT(vatSpecificationData)
    }

    /**
     * Updates the parent of the allocation
     */
    private set _parent(parent: LedgerAllocation) {
        this.data.parentRef = parent.id
    }

    /**
     * Sets the allocation period
     *
     * If the period is not equal to this period and the allocation has no children
     * then the allocation is split:
     * [bankAccontLedgerAccount, allocatedLedgerAccount] =>
     * - [bankAccontLedgerAccount, AccrualsAccount] (parent)
     * - [AccrualsAccount, allocatedLedgerAccount]  (child)
     *
     * If the period is equal to the parent period then the allocation is unsplit.
     * The split is undone and the journalEntry gets the original value
     *
     */
    set period(period: Period) {
        if (period.equals(this.period)) return

        const { allocations } = LedgerAllocation.accounting
        const parent = this.parent
        if (parent) {
            if (period.equals(parent.period)) {
                // unsplit this child
                this.unsplitAllocation()

                if (this.getVAT()) {
                    // Set VAT back to the parent
                    parent.setVAT(this.getVAT())
                    this.setVAT(null)
                }

                parent.ledgerAccount = this.ledgerAccount
                allocations.removeChild(this)
            } else {
                // no subsplit, simply change period
                this.journalEntry.period = period
            }
        } else {
            if (this.hasChildren()) {
                // no multi split allowed
            } else {
                // split
                const child = this.splitAllocation(period)
                allocations.addChild(this, child, period)

                if (this.getVAT()) {
                    // Transfer VAT to the child
                    child.setVAT(this.getVAT())
                    this.setVAT(null)
                }

                child.ledgerAccount = this.ledgerAccount
                this.ledgerAccount = LedgerScheme.getAccrualsAccount(this.amount)
            }
        }
    }

    get reason() {
        return this.journalEntry.reason
    }

    set reason(reason: string) {
        if (this.reason !== reason) {
            this.journalEntry.reason = reason
            if (this.parent) {
                this.parent.reason = reason
            } else {
                this.children.forEach(child => child.reason = reason)
            }
        }
    }

    set journalEntry(journalEntry: JournalEntry) {
        this.data.journalEntryRef = journalEntry.id
    }

    addChild(child: LedgerAllocation) {
        this.childrenRefs.push(child.id)
        child._parent = this
    }

    removeChild(child: LedgerAllocation) {
        arrayRemoveElement(this.childrenRefs, child.id)
    }
}

