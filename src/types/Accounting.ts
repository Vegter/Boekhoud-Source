import { AccountingState } from "../app/AccountingSlice"
import { Journal } from "./Journal/Journal"
import { LiquidAssets } from "./LiquidAssets/LiquidAssets"
import { LedgerAllocationMap } from "./Allocation/LedgerAllocationMap"
import {
    AccountingMetaData,
    BankAccountData,
    BankImportStatementData,
    JournalEntryData,
    LedgerAccountData,
    LedgerAllocationData,
    VATSpecificationData
} from "../model"
import { LedgerScheme } from "./Ledger/LedgerScheme"
import { Period } from "./Period"
import { JournalEntry } from "./Journal/JournalEntry"
import { memoize } from "../services/memoize"

export class Accounting {
    /**
     * Current state is a class property
     * Set on every instantiation
     * - Allows reducers to work on the Draft<State> model
     * - Allows components to work on the current State model (set by middleware)
     */
    private static _CurrentState: AccountingState

    constructor(data?: AccountingState) {
        if (data) {
            // Used by reducers to work on writable draft-state
            Accounting.State = data
        }   // Else use the current state
    }

    static get State(): AccountingState {
        return this._CurrentState
    }

    static set State(state: AccountingState) {
        // Explicitly set the state (post-action in redux middleware)
        this._CurrentState = state
    }

    /**
     * The currency is determined by the currency of the first allocated statement entry
     */
    @memoize()
    static get currency(): string {
        return new Accounting().allocations.allocations[0].statementEntry.amount.currency
    }

    /**
     * Returns the journal (dictionary of journalEntries)
     */
    get journal() { return new Journal(Accounting.State.journalData) }

    /**
     * Returns the liquid assets (dictionary of bank accounts
     */
    get liquidAssets() { return new LiquidAssets(Accounting.State.liquidAssetsData) }

    /**
     * Returns the allocations (dictionary of allocations)
     *
     * Allocations connect a statement entry of a bank account to a ledger account
     */
    get allocations() { return new LedgerAllocationMap(Accounting.State.ledgerAllocationsData) }

    setMetaData(metaData: AccountingMetaData) {
        /**
         * Update the metadata (name)
         */
        Accounting._CurrentState.accountingMetaData = metaData
    }

    addStatements(statementsData: BankImportStatementData[]) {
        /**
         * Add bankAccount statements and its statementEntries
         */
        statementsData.forEach(statementData => {
            const { bankAccount, statementEntries } = this.liquidAssets.addBankImportStatement(statementData)
            this.allocations.addStatementEntries(bankAccount, statementEntries)
        })
        Accounting._CurrentState.ledgerAllocationsData = this.allocations.sorted().data
    }

    deleteJournalEntry(journalEntryData: JournalEntryData) {
        if (this.journal.hasJournalEntry(journalEntryData.id)) {
            // Remove any existing journalEntry with the same id
            this.journal.remove(this.journal.getJournalEntry(journalEntryData.id))
        }
    }

    updateJournalEntry(journalEntryData: JournalEntryData) {
        // Remove any existing journalEntry with the same id
        this.deleteJournalEntry(journalEntryData)
        // Add the journalEntry to the journal
        this.journal.add(new JournalEntry(journalEntryData))
    }

    linkBankAccount(bankAccountData: BankAccountData, ledgerAccountData: LedgerAccountData) {
        /**
         * Associate a bankAccount with a (Balance) ledgerAccount
         */
        const ledgerAccount = LedgerScheme.getAccount(ledgerAccountData.Referentiecode)
        const bankAccount = this.liquidAssets.getBankAccount(bankAccountData.id)
        bankAccount.ledgerAccount = ledgerAccount
        this.allocations.updateStatementEntries(bankAccount)
    }

    setPeriod(allocationData: LedgerAllocationData, period: string) {
        /**
         * Setting a period splits an allocation in two parts:
         * - The original allocation gets associated with an accruals account
         * - A new allocation will be made with the new period and the original account
         * If the period of a split allocation is set back to its original value
         * then the split will be undone
         */
        const allocation = this.allocations.getAllocation(allocationData.id)
        allocation.period = new Period(period)
    }

    setReason(allocationData: LedgerAllocationData, reason: string) {
        /**
         * Change the reason (description) of a journalEntry
         */
        const allocation = this.allocations.getAllocation(allocationData.id)
        allocation.reason = reason
    }

    setLedgerAccount(allocationsData: LedgerAllocationData[], accountCode: string) {
        /**
         * Change the ledgerAccount of a set of allocations
         */
        const ledgerAccount = LedgerScheme.getAccount(accountCode)
        allocationsData.forEach(allocationData => {
            const allocation = this.allocations.getAllocation(allocationData.id)
            allocation.ledgerAccount = ledgerAccount
        })
    }

    setVAT(allocationData: LedgerAllocationData, vatSpecificationData: VATSpecificationData) {
        /**
         * Specifies the VAT or deletes the VAT for the allocation
         */
        const allocation = this.allocations.getAllocation(allocationData.id)
        allocation.setVAT(vatSpecificationData)
    }
}