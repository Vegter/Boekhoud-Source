import { AllocationFilter } from "./AllocationFilter"
import { Mocked } from "./mocks"
import { LedgerScheme } from "./Ledger/LedgerScheme"
import { Period } from "./Period"
import { LedgerAccount } from "./Ledger/LedgerAccount"

test("AllocationFilter", () => {
    let filter = new AllocationFilter()
    expect(filter.period).toEqual(null)
    expect(filter.ledgerAccount).toEqual(null)
    expect(filter.ledgerAccountCode).toEqual(null)

    let mocked = new Mocked()
    LedgerScheme.Data = mocked.ledgerAccounts

    let period = new Period("Any Period")
    let account = new LedgerAccount(mocked.ledgerAccountDataA)
    filter = new AllocationFilter({
        periodId: period.id,
        ledgerAccountCode: account.code
    })
    expect(filter.period).toEqual(period)
    expect(filter.ledgerAccount).toEqual(account)
    expect(filter.ledgerAccountCode).toEqual(account.code)
})
