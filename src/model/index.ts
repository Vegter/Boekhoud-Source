// Attention
//
// Changes in this file may break any import, api download or state reload
//

export interface AccountingMetaData {
    name: string
}

export type PlainBankAccountData = Omit<BankAccountData, "accountStatementMapData" | "statementEntryMapData">
export type PlainAccountStatementData = AccountStatementData

export interface BankImportStatementData {
    bankAccountData: PlainBankAccountData
    accountStatementData: PlainAccountStatementData
    statementEntriesData: StatementEntryData[]
}

export type BankAccountMapData = Record<string, BankAccountData>

export interface BankAccountData {
    id: string
    currency: string
    ledgerAccountCode: string
    accountStatementMapData: AccountStatementMapData
    statementEntryMapData: StatementEntryMapData
}

export type AccountStatementMapData = Record<string, AccountStatementData>

export interface AccountBalanceData {
    date: string
    amountData: AmountData
}

export interface AccountStatementData {
    id: string
    openingBalanceData: AccountBalanceData
    closingBalanceData: AccountBalanceData
}

export type StatementEntryMapData = Record<string, StatementEntryData>

export interface StatementEntryData {
    id: string
    amountData: AmountData
    bookDate: string
    valueDate: string
    relatedParties: string
    remittanceInformation: string
    accountStatementRef: string
}

export type LedgerAllocationMapData = Record<string, LedgerAllocationData>

export interface LedgerAllocationData {
    id: string
    statementEntryRef: string
    journalEntryRef: string
    parentRef: string | null
    childrenRefs: string[]     // References to pseudo entryRefs
}

export type JournalEntryMapData = Record<string, JournalEntryData>

export interface VATSpecificationEntryData {
    id: string
    bruto: string
    vat: string
    netto: string
}

export interface VATSpecificationData {
    date: string
    lines: VATSpecificationEntryData[]
}

export interface JournalEntryData {
    id: string
    date: string
    period: string
    reason: string
    entryLegsData: EntryLegData[]
    vatSpecificationData?: VATSpecificationData
}

export interface EntryLegData {
    ledgerAccountCode: string
    amountData: AmountData
    tag?: string
}

export interface AmountData {
    amount: number,
    currency: string,
    creditDebit: number
}

export interface LedgerAccountData {
    Referentiecode: string
    ReferentieOmslagcode: string | null
    Sortering: string
    Referentienummer: string
    OmschrijvingKort: string
    Omschrijving: string
    DC: string | null
    Nivo: number
    Parents: LedgerAccountData[]
}

export interface PeriodFilterData {
    periods: string[]
}

export interface VATPeriodData {
    period: string
}

export interface AllocationFilterData {
    periodId: string | null
    ledgerAccountCode: string | null
}
