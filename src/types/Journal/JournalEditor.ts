import { LedgerAccount } from "../Ledger/LedgerAccount"
import { JournalEntry } from "./JournalEntry"
import { LedgerScheme } from "../Ledger/LedgerScheme"
import { Amount, CreditDebit } from "../Amount"
import { EntryLeg } from "./EntryLeg"
import { Period } from "../Period"
import { DateString } from "../DateString"
import { Accounting } from "../Accounting"
import { EntryLegData, JournalEntryData } from "../../model"

class LegEditor {
    static readonly MANUAL_LEG = -1

    id: number
    account: LedgerAccount
    debit: string
    debitValue: number
    credit: string
    creditValue: number
    
    constructor() {
        this.id = LegEditor.MANUAL_LEG
        this.account = LedgerScheme.unmapped
        this.debit = "0"
        this.debitValue = 0
        this.credit = "0"
        this.creditValue = 0
    }
    
    static fromEntryLeg(leg: EntryLeg, id: number) {
        const legEditor = new LegEditor()
        const amount = leg.amount
        const debitValue = amount.isDebit ? -amount.value : 0
        const creditValue = amount.isCredit ? amount.value : 0
        legEditor.id = id
        legEditor.account = leg.ledgerAccount
        legEditor.debit = debitValue ? debitValue.toFixed(2)  : ""
        legEditor.debitValue = debitValue
        legEditor.credit = creditValue ? creditValue.toFixed(2) : ""
        legEditor.creditValue = creditValue
        return legEditor
    }

    get amount() {
        return Amount.fromAmountCurrency(this.creditValue - this.debitValue, Accounting.currency)
    }

    get entryLegData(): EntryLegData {
        return {
            ledgerAccountCode: this.account.code,
            amountData: this.amount.data
        }
    }

    updateAccount(account: LedgerAccount) {
        this.account = account
    }
    
    updateAmount(creditDebit: CreditDebit, value: string) {
        const stringValue = value || ""
        if (creditDebit === CreditDebit.Debit) {
            this.debit = stringValue
            this.credit = ""
            this.creditValue = 0
        } else {
            this.debit = ""
            this.debitValue = 0
            this.credit = stringValue
        }
        if (!isNaN(+value)) {
            const numericValue = +value
            if (creditDebit === CreditDebit.Debit) {
                this.debitValue = numericValue
            } else {
                this.creditValue = numericValue
            }
        }
    }

    finalizeAmount() {
        if (this.creditValue) {
            this.credit = this.creditValue.toFixed(2)
            this.debitValue = 0
            this.debit = ""
        } else if (this.debitValue) {
            this.debit = this.debitValue.toFixed(2)
            this.creditValue = 0
            this.credit = ""
        } else {
            this.debit = ""
            this.debitValue = 0
            this.credit = ""
            this.creditValue = 0
        }
    }
}

export class JournalEditor {
    private _reason: string
    private _date: Date
    private _period: Period
    private _legs: LegEditor[]

    constructor() {
        this._reason = ""
        this._date = new Date()
        this._period = Period.fromDate(DateString.fromDate(this._date))
        this._legs = []
        this.addLeg()
    }

    static fromJournalEntry(journalEntry: JournalEntry) {
        const journalEditor = new JournalEditor()
        journalEditor._reason = journalEntry.reason
        journalEditor._date = journalEntry.date.Date
        journalEditor._period = new Period(journalEntry.period.data)
        journalEditor._legs = journalEntry.legs.map((leg, i) =>
            LegEditor.fromEntryLeg(leg, i))
        return journalEditor
    }

    clone() {
        const journalEditor = new JournalEditor()
        journalEditor._reason = this._reason
        journalEditor._date = this._date
        journalEditor._period = this._period
        journalEditor._legs = this._legs
        return journalEditor
    }

    get reason() { return this._reason }
    set reason(reason: string) { this._reason = reason }

    get date() { return this._date }
    set date(date: Date) {
        this._date = date
        this._period = Period.fromDate(DateString.fromDate(date))
    }

    get legs() { return this._legs }
    addLeg() {
        this._legs.push(new LegEditor())
    }

    removeLeg(i: number) {
        this._legs.splice(i, 1)
    }

    totals() {
        return this.legs.reduce((sum, leg) => {
            let { debit, credit } = sum
            debit += leg.debitValue
            credit += leg.creditValue
            return { debit, credit }
        }, { debit: 0, credit: 0 })
    }

    isValid() {
        const { debit, credit } = this.totals()
        return debit !== 0 &&
            credit !== 0 &&
            debit === credit &&
            this.reason &&
            ! this.legs.find(leg => leg.account === LedgerScheme.unmapped)
    }

    canBeDeleted() {
        return this.isValid() && ! this.legs.find(leg => ! leg.account.isAllocatable)
    }

    apply(journalEntry?: JournalEntry): JournalEntryData {
        let data: JournalEntryData
        if (journalEntry) {
            data = { ...journalEntry.data }
            data.date = DateString.fromDate(this.date).data
            data.period = this._period.data
            data.reason = this.reason
            data.entryLegsData = []

            // Update or delete existing legs
            journalEntry.data.entryLegsData.forEach((leg, i) => {
                const legEditor = this.legs.find(l => l.id === i)
                if (legEditor) {
                    data.entryLegsData.push({
                        ...leg,
                        ...legEditor.entryLegData
                    })
                } else {
                    // leg has been deleted
                }
            })
            // Add new legs
        } else {
            data = {
                id: `memorial.${new Date().toISOString()}`,
                date: DateString.fromDate(this.date).data,
                period: this._period.data,
                reason: this.reason,
                entryLegsData: []
            }
        }

        this.legs.filter(leg => leg.id === LegEditor.MANUAL_LEG).forEach(leg => {
            data.entryLegsData.push(leg.entryLegData)
        })
        return data
    }

}