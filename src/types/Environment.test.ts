import { Accounting } from "./Accounting"
import { LedgerScheme } from "./Ledger/LedgerScheme"

import { Environment } from "./Environment"

jest.mock("./Accounting", () => {
    return {
        Accounting: class {
            static get State() { return "Any AccountingState" }
            static set State(_: any) {}
        }
    }
})

test("Environment", () => {
    const ledgerSchemeData = LedgerScheme.Data
    const state = {
        liquidAssetsData: {},
        ledgerAllocationsData: {},
        journalData: {}
    }

    const setState = jest.spyOn(Accounting, 'State', 'set')
    const getState = jest.spyOn(Accounting, 'State', 'get')

    let env = new Environment()

    expect(getState).toHaveBeenCalledTimes(0)
    expect(setState).toHaveBeenCalledTimes(0)

    expect(env.data).toEqual({
        ledgerScheme: ledgerSchemeData,
        state: Accounting.State
    })

    expect(setState).toHaveBeenCalledTimes(0)

    env = new Environment({
        ledgerScheme: ledgerSchemeData,
        state
    })

    expect(setState).toHaveBeenCalledTimes(1)
    expect(setState).toHaveBeenCalledWith(state)

    expect(env.data).toEqual({
        ledgerScheme: ledgerSchemeData,
        state: Accounting.State
    })
})
