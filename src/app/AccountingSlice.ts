import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from './store';

import {
    BankAccountData,
    BankImportStatementData,
    JournalEntryMapData,
    LedgerAccountData,
    LedgerAllocationData,
    LedgerAllocationMapData,
    BankAccountMapData,
    AccountingMetaData,
    VATSpecificationData,
    JournalEntryData
} from "../model"

import { LiquidAssets } from "../types/LiquidAssets/LiquidAssets"
import { Journal } from "../types/Journal/Journal"
import { LedgerAllocationMap } from "../types/Allocation/LedgerAllocationMap"
import { Accounting } from "../types/Accounting"
import { ValueProxy } from "../services/ValueProxy"

export interface AccountingState {
    accountingMetaData: AccountingMetaData
    liquidAssetsData: BankAccountMapData
    ledgerAllocationsData: LedgerAllocationMapData
    journalData: JournalEntryMapData
}

const initialState: AccountingState = {
    accountingMetaData: { name: "" },
    liquidAssetsData: {},
    ledgerAllocationsData: {},
    journalData: {}
};

export const AccountingSlice = createSlice({
    name: 'accounting',
    initialState,
    reducers: {
        resetAccountingState: () => {
            invalidateAll()
            return { ...initialState }
        },

        restoreAccountingState: (state, action: PayloadAction<{state: AccountingState}>) => {
            invalidateAll()
            return {
                ...initialState,
                ...action.payload.state
            }
        },

        setMetaData: (state, action: PayloadAction<AccountingMetaData>) => {
            const accounting = new Accounting(state)
            accounting.setMetaData(action.payload)
        },

        addStatements: (state, action: PayloadAction<{statementsData: BankImportStatementData[]}>) => {
            invalidateAll()
            const { statementsData } = action.payload
            const accounting = new Accounting(state)
            accounting.addStatements(statementsData)
        },

        deleteJournalEntry: (state, action: PayloadAction<{journalEntryData: JournalEntryData}>) => {
            journal.invalidate()
            const { journalEntryData } = action.payload
            const accounting = new Accounting(state)
            accounting.deleteJournalEntry(journalEntryData)
        },

        updateJournalEntry: (state, action: PayloadAction<{journalEntryData: JournalEntryData}>) => {
            journal.invalidate()
            const { journalEntryData } = action.payload
            const accounting = new Accounting(state)
            accounting.updateJournalEntry(journalEntryData)
        },

        linkBankAccount: (state,
                          action: PayloadAction<{bankAccountData: BankAccountData, ledgerAccountData: LedgerAccountData}>) => {
            invalidateAll()
            const { bankAccountData, ledgerAccountData } = action.payload
            const accounting = new Accounting(state)
            accounting.linkBankAccount(bankAccountData, ledgerAccountData)
        },

        setPeriod: (state,
                    action: PayloadAction<{allocationData: LedgerAllocationData, period: string}>) => {
            ledgerAllocations.invalidate()
            journal.invalidate()
            const { allocationData, period } = action.payload
            const accounting = new Accounting(state)
            accounting.setPeriod(allocationData, period)
        },

        setReason: (state,
                    action: PayloadAction<{allocationData: LedgerAllocationData,
                                           reason: string}>) => {
            ledgerAllocations.invalidate()
            journal.invalidate()
            const { allocationData, reason } = action.payload
            const accounting = new Accounting(state)
            accounting.setReason(allocationData, reason)
        },

        setLedgerAccount: (state,
                           action: PayloadAction<{allocationsData: LedgerAllocationData[],
                                                  accountCode: string}>) => {
            ledgerAllocations.invalidate()
            journal.invalidate()
            const { allocationsData, accountCode } = action.payload
            const accounting = new Accounting(state)
            accounting.setLedgerAccount(allocationsData, accountCode)
        },

        setVAT: (state,
                 action: PayloadAction<{allocationData: LedgerAllocationData,
                                        vatSpecificationData: VATSpecificationData}>) => {
            const { allocationData, vatSpecificationData } = action.payload
            ledgerAllocations.invalidate()
            journal.invalidate()
            const accounting = new Accounting(state)
            accounting.setVAT(allocationData, vatSpecificationData)
        }
    },
});

export const { resetAccountingState,
    restoreAccountingState,
    setMetaData,
    addStatements,
    deleteJournalEntry,
    updateJournalEntry,
    linkBankAccount,
    setPeriod,
    setReason,
    setVAT,
    setLedgerAccount } = AccountingSlice.actions;

const invalidateAll = () => {
    liquidAssets.invalidate()
    ledgerAllocations.invalidate()
    journal.invalidate()
}

const liquidAssets = new ValueProxy<LiquidAssets>()
export const selectLiquidAssets = (state: RootState) =>
    liquidAssets.getValue(() => new LiquidAssets(state.accounting.liquidAssetsData))

let ledgerAllocations = new ValueProxy<LedgerAllocationMap>()
export const selectLedgerAllocations = (state: RootState) =>
    ledgerAllocations.getValue(() => new LedgerAllocationMap(state.accounting.ledgerAllocationsData))

let journal = new ValueProxy<Journal>()
export const selectJournal = (state: RootState) =>
    journal.getValue(() => new Journal(state.accounting.journalData))

export const selectAccountingState = (state: RootState) => state.accounting

export const selectMetaData = (state: RootState) => state.accounting.accountingMetaData

export default AccountingSlice.reducer