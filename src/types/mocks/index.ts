import {
    AccountStatementData,
    BankAccountData,
    JournalEntryData,
    LedgerAccountData,
    LedgerAllocationData,
    StatementEntryData
} from "../../model"
import { LEDGER_ACCOUNT } from "../../config"
import { Amount, CreditDebit } from "../Amount"
import { AccountingState } from "../../app/AccountingSlice"
import { LedgerAccount } from "../Ledger/LedgerAccount"
import { LedgerScheme, LedgerSchemeData } from "../Ledger/LedgerScheme"

export class Mocked {

    getAmount(value: number) {
        return new Amount({
            amount: Math.abs(value),
            currency: "CUR",
            creditDebit: value < 0 ? CreditDebit.Debit : CreditDebit.Credit
        })
    }

    get ledgerAccountDataA(): LedgerAccountData {
        return {
            Referentiecode: "A",
            ReferentieOmslagcode: null,
            Sortering: "",
            Referentienummer: "",
            OmschrijvingKort: "A",
            Omschrijving: "A A",
            DC: "D",
            Nivo: 1,
            Parents: []
        }
    }

    get ledgerAccountA(): LedgerAccount { return new LedgerAccount(this.ledgerAccountDataA)}

    get ledgerAccountDataB(): LedgerAccountData {
        return {
            Referentiecode: "B",
            ReferentieOmslagcode: null,
            Sortering: "",
            Referentienummer: "",
            OmschrijvingKort: "B",
            Omschrijving: "B B",
            DC: null,
            Nivo: 1,
            Parents: []
        }
    }

    get ledgerAccountB(): LedgerAccount { return new LedgerAccount(this.ledgerAccountDataB)}

    get ledgerAccountDataC(): LedgerAccountData {
        return {
            Referentiecode: "C",
            ReferentieOmslagcode: null,
            Sortering: "",
            Referentienummer: "",
            OmschrijvingKort: "C",
            Omschrijving: "C C",
            DC: "C",
            Nivo: 1,
            Parents: []
        }
    }

    get ledgerAccountDataWRev(): LedgerAccountData {
        return {
            Referentiecode: "WRev",
            ReferentieOmslagcode: null,
            Sortering: "",
            Referentienummer: "",
            OmschrijvingKort: "WRev",
            Omschrijving: "Revenues",
            DC: "C",
            Nivo: 1,
            Parents: []
        }
    }

    get ledgerAccountDataWExp(): LedgerAccountData {
        return {
            Referentiecode: "WExp",
            ReferentieOmslagcode: null,
            Sortering: "",
            Referentienummer: "",
            OmschrijvingKort: "WExp",
            Omschrijving: "Expenses",
            DC: "D",
            Nivo: 1,
            Parents: []
        }
    }

    get ledgerAccountC(): LedgerAccount { return new LedgerAccount(this.ledgerAccountDataC)}

    get ledgerAccounts(): LedgerSchemeData {
        const result = {
            [this.ledgerAccountDataA.Referentiecode]: new LedgerAccount(this.ledgerAccountDataA),
            [this.ledgerAccountDataB.Referentiecode]: new LedgerAccount(this.ledgerAccountDataB),
            [this.ledgerAccountDataC.Referentiecode]: new LedgerAccount(this.ledgerAccountDataC),
            [this.ledgerAccountDataWExp.Referentiecode]: new LedgerAccount(this.ledgerAccountDataWExp),
            [this.ledgerAccountDataWRev.Referentiecode]: new LedgerAccount(this.ledgerAccountDataWRev),
        }

        Object.values(LEDGER_ACCOUNT).forEach((value: string) => {
            result[value] = new LedgerAccount({
                Referentiecode: value,
                ReferentieOmslagcode: null,
                Sortering: "",
                Referentienummer: "",
                OmschrijvingKort: value,
                Omschrijving: value,
                DC: null,
                Nivo: 1,
                Parents: []
            })
        })

        return result
    }

    ledgerScheme() {
        LedgerScheme.Data = this.ledgerAccounts
    }

    get accountStatementData(): AccountStatementData {
        return {
            id: "Statement 1",
            openingBalanceData: {
                date: "2000-12-31",
                amountData: new Amount().data
            },
            closingBalanceData: {
                date: "2001-01-01",
                amountData: new Amount().data
            }
        }
    }

    get statementEntryData(): StatementEntryData {
        return {
            id: "Entry 1",
            amountData: new Amount().data,
            bookDate: "2001-01-01",
            valueDate: "2000-12-31",
            relatedParties: "Party 1",
            remittanceInformation: "Info",
            accountStatementRef: this.accountStatementData.id
        }
    }

    get bankAccountData(): BankAccountData {
        return {
            id: "12.34.56.789",
            currency: "CUR",
            ledgerAccountCode: this.ledgerAccountDataA.Referentiecode,
            accountStatementMapData: {
                [this.accountStatementData.id]: this.accountStatementData
            },
            statementEntryMapData: {
                [this.statementEntryData.id]: this.statementEntryData
            }
        }
    }

    get journalEntryData(): JournalEntryData {
        return {
            id: "456",
            date: "2001-01-01",
            period: "2001",
            reason: "Any Reason",
            entryLegsData: [
                {
                    ledgerAccountCode: this.bankAccountData.ledgerAccountCode,
                    amountData: new Amount().data
                },
                {
                    ledgerAccountCode: this.ledgerAccountDataC.Referentiecode,
                    amountData: new Amount().data
                }
            ]
        }
    }

    get ledgerAllocationData(): LedgerAllocationData {
        return {
            id: "123",
            statementEntryRef: this.statementEntryData.id,
            journalEntryRef: this.journalEntryData.id,
            parentRef: null,
            childrenRefs: []
        }
    }

    get emptyState(): AccountingState {
        return {
            accountingMetaData: { name: "" },
            liquidAssetsData: {},
            ledgerAllocationsData: {},
            journalData: {}
        }
    }

    get state(): AccountingState {
        return {
            accountingMetaData: {
                name: "Any name"
            },
            liquidAssetsData: {
                [this.bankAccountData.id]: this.bankAccountData
            },
            ledgerAllocationsData: {
                [this.ledgerAllocationData.id]: this.ledgerAllocationData
            },
            journalData: {
                [this.journalEntryData.id]: this.journalEntryData
            }
        }
    }
}
