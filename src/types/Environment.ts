import { AccountingState } from "../app/AccountingSlice"
import { LedgerScheme, LedgerSchemeData } from "./Ledger/LedgerScheme"
import { Accounting } from "./Accounting"

/**
 * This class stores a reference to the current Accounting data
 *
 * The class is used to transfer the current Accounting state to a Web Worker
 * The Web Worker runs in a separate thread and uses the environment to re-create any Accounting classes
 *
 */

export interface EnvironmentData {
    ledgerScheme: LedgerSchemeData
    state: AccountingState
}

export class Environment {

    constructor(data?: EnvironmentData) {
        /**
         * Without any data the current Accounting state is returned
         */
        if (data) {
            /**
             * With data; a Web Worker can re-create the accounting classes from any received environment data
             */
            const { ledgerScheme, state } = data

            LedgerScheme.Data = ledgerScheme
            Accounting.State = state
        }
    }

    /**
     * Get the current Accounting data
     * This data can be passed to a Web Worker
     */
    get data(): EnvironmentData {
        return {
            ledgerScheme: LedgerScheme.Data,
            state: Accounting.State
        }
    }
}