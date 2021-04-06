import { EntryLegData } from "../../model"
import { Amount } from "../Amount"
import { LedgerAccount } from "../Ledger/LedgerAccount"
import { LedgerScheme } from "../Ledger/LedgerScheme"

/**
 * EntryLeg
 * A leg (or side) of a JournalEntry
 */
export class EntryLeg {
    constructor(readonly data: EntryLegData) {}

    get amount(): Amount { return new Amount(this.data.amountData) }
    get ledgerAccount(): LedgerAccount { return LedgerScheme.getAccount(this.data.ledgerAccountCode) }
    get ledgerAccountCode(): string { return this.data.ledgerAccountCode }
    get tag(): string { return this.data.tag || ""}

    set ledgerAccount(ledgerAccount: LedgerAccount) {
        this.data.ledgerAccountCode = ledgerAccount.code
    }

    /**
     * Returns the reversed leg (DEBIT <-> CREDIT)
     */
    reversed() {
        return new EntryLeg({
            ...this.data,
            amountData: this.amount.reversed().data
        })
    }
}
