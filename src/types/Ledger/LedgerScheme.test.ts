import fetchMock from "jest-fetch-mock"
import mockConsole from 'jest-mock-console'

import { AssertionError } from "assert"

import { LedgerScheme } from "./LedgerScheme"
import { LedgerAccount, UNMAPPED_ACCOUNT } from "./LedgerAccount"
import { Mocked } from "../mocks"
import { LEDGER_ACCOUNT } from "../../config"

// Nivo 1
const BALANCE = "B"
const X = "X"
// Nivo 2
const BALANCE_2 = "BAbc"
const X_2 = "XAbc"
const ORPHAN_2 = "ZXyx"
const BANK_2 = "BLim"
// Nivo 3
const BANK_3 = "BLimBan"
const ALLOC_3 = "BAbcEfg"
const ORPHAN_3_NOT_IN_ACCOUNTS = "ZXyzAbc"
// Nivo 4
const BANK_4 = "BLimBanXyz"
const ALLOC_4 = "BAbcEfg123"

const accountData: [string, number][] = [
    [BALANCE, 1],
    [BALANCE_2, 2],
    [X, 1],
    [X_2, 2],
    [BANK_2, 2],
    [BANK_3, 3],
    [BANK_4, 4],
    [ALLOC_3, 3],
    [ALLOC_4, 4],
    [ORPHAN_2, 2],
    [ORPHAN_3_NOT_IN_ACCOUNTS, 5]
]
const testAccounts = accountData.map(([code, level]) => ({
    "Referentiecode": code,
    "ReferentieOmslagcode": null,
    "Sortering": null,
    "Referentienummer": null,
    "OmschrijvingKort": "BALANS",
    "Omschrijving": "BALANS",
    "DC": "D",
    "Nivo": level
}))

test("LedgerScheme", async () => {
    fetchMock.enableMocks()
    fetchMock.mockOnce(JSON.stringify(testAccounts))

    const codes = (accounts: LedgerAccount[]) => accounts.map(account => account.code)
    const unmapped = UNMAPPED_ACCOUNT.code
    const orphans = [ORPHAN_2, ORPHAN_3_NOT_IN_ACCOUNTS]

    const restoreConsole = mockConsole()

    await LedgerScheme.load(false)
    expect(LedgerScheme.ledgerAccounts.length).toEqual(testAccounts.length + 1)   // Include unmapped account
    expect(codes(LedgerScheme.allocatableAccounts)).toEqual([unmapped, BANK_4, ALLOC_4])   // Include unmapped account (level 4)
    expect(codes(LedgerScheme.bankAccounts)).toEqual([BANK_4])  // Only level 4 is allocatable
    expect(codes(LedgerScheme.balanceAccounts)).toEqual([unmapped, ALLOC_4])
    expect(codes(LedgerScheme.orphans)).toEqual([ORPHAN_2, ORPHAN_3_NOT_IN_ACCOUNTS])
    expect(console.warn).toHaveBeenCalledTimes(orphans.length)
    expect(LedgerScheme.getAccount(BALANCE_2).parents.map(p => p.code)).toEqual([BALANCE])
    expect(LedgerScheme.getAccount(BANK_4).parents.map(p => p.code)).toEqual([BANK_3, BANK_2, BALANCE])
    expect(LedgerScheme.getAccount(BANK_4).parent?.code).toEqual(BANK_3)

    expect(LedgerScheme.Levels()).toEqual([1,2,3,4,5])
    expect(LedgerScheme.Sides()).toEqual(["D"])
    expect(LedgerScheme.getMatchingAccounts(LedgerScheme.ledgerAccounts, BALANCE_2, false)
        .map(a => a.code))
        .toEqual([BALANCE_2, ALLOC_3, ALLOC_4])
    expect(LedgerScheme.getMatchingAccounts(LedgerScheme.ledgerAccounts, BALANCE_2, true)
        .map(a => a.code))
        .toEqual([BALANCE_2, BALANCE, ALLOC_3, ALLOC_4])

    expect(LedgerScheme.unmapped.code).toEqual(unmapped)

    accountData.forEach(([code, _]) =>
        expect(LedgerScheme.getAccount(code)).toBeDefined())
    expect(() => {
        LedgerScheme.getAccount("Non-Existing Account Code")
    }).toThrow(AssertionError)

    // Local loading
    await LedgerScheme.load()
    expect(LedgerScheme.ledgerAccounts.length).toEqual(2899)

    restoreConsole()

    let mocked = new Mocked()
    expect(LedgerScheme.getAccrualsAccount(mocked.getAmount(10)).code).toEqual(LEDGER_ACCOUNT.ACCRUED_EXPENSE)
    expect(LedgerScheme.getAccrualsAccount(mocked.getAmount(-10)).code).toEqual(LEDGER_ACCOUNT.ACCRUED_REVENUE)
})
