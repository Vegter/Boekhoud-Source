import { AllocationFilterData } from "../model"
import { Period } from "./Period"
import { LedgerAccount } from "./Ledger/LedgerAccount"
import { LedgerScheme } from "./Ledger/LedgerScheme"

/**
 * Simple filter on period and account
 * Its data is used to be stored in the application state
 */
export class AllocationFilter {
    constructor(public data: AllocationFilterData = { periodId: null, ledgerAccountCode: null}) {}

    /**
     * Returns the period on which is filtered, or null
     */
    get period(): Period | null {
        const { periodId } = this.data
        return periodId ? new Period(periodId) : null
    }

    /**
     * Returns the ledgerAccount on which is filtered, or null
     */
    get ledgerAccount(): LedgerAccount | null {
        const { ledgerAccountCode } = this.data
        return ledgerAccountCode ? LedgerScheme.getAccount(ledgerAccountCode) : null
    }

    /**
     * Returns the code of the ledgerAccount on which is filtered, or null
     */
    get ledgerAccountCode(): string | null {
        const { ledgerAccountCode } = this.data
        return ledgerAccountCode
    }
}