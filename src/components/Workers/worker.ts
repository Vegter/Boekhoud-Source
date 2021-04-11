/* ./worker/worker.ts */
import { LedgerAllocation } from "../../types/Allocation/LedgerAllocation"
import { AllocationFilter } from "../../types/AllocationFilter"
import { Environment, EnvironmentData } from "../../types/Environment"
import { BankAccount } from "../../types/LiquidAssets/BankAccount"
import { BankAccountChartData } from "../Charts/BankAccountChart"
import { getBankAccountData } from "../Charts"
import { sortedArray } from "../../services/utils"

export function getBankAccountChartData(
    environment: EnvironmentData,
    _bankAccount: BankAccount): BankAccountChartData {

    new Environment(environment)
    const bankAccount = new BankAccount(_bankAccount.data)

    return getBankAccountData(bankAccount)
}

export function getAllocationRows(environment: EnvironmentData,
                                  _allocations: LedgerAllocation[],
                                  viewPort: number,
                                  _allocationFilter: AllocationFilter): LedgerAllocation[] {

    new Environment(environment)

    const allocationFilter = new AllocationFilter(_allocationFilter.data)

    const showRows: LedgerAllocation[] = []
    for (let _allocation of _allocations) {
        const allocation = new LedgerAllocation(_allocation.data)
        // Maximize number of rows to the current viewPort
        if (showRows.length >= viewPort) break
        // Handle children with its parent
        if (allocation.hasParent()) continue
        // Match against the current filter
        if (! (allocation.matches(allocationFilter) ||
            allocation.children.some(c => c.matches(allocationFilter)))) continue
        // Add the parent and its children to the rows
        showRows.push(allocation)
        allocation.children.forEach(child => showRows.push(child))
    }

    // Return allocations as a sorted list, most recent on top
    return sortedArray(showRows, a => a.journalEntry.date.sortKey, false)
}
