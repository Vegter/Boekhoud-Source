import { LedgerAccount } from "../Ledger/LedgerAccount"
import { JournalEntry } from "./JournalEntry"
import { LedgerScheme } from "../Ledger/LedgerScheme"
import { Amount, CreditDebit } from "../Amount"
import { EntryLeg } from "./EntryLeg"
import { Period } from "../Period"
import { DateString } from "../DateString"
import { Accounting } from "../Accounting"
import { EntryLegData, JournalEntryData } from "../../model"

export const EditorTemplates = {
    'Lonen': {
        accounts: [
            "BSchSalNet",
            "BSchSalOna",
            "BSchBepLhe",
            "BSchSalPsv",
            "BSchOvsStp",
            "BSchOvsStp",
            "BSchSalTvg",
            "WPerLesLon",
            "WPerSolPsv",
            "WPerLesVag",
            "WPerPenPen",
            "WBedWkrWkg",
            "WBedAdlBet",
        ],
        rules: [
            "WPerLesLon = BSchSalNet + BSchBepLhe + BSchOvsStp",
            "WPerSolPsv = BSchSalPsv",
            "WPerLesVag = BSchSalTvg",
            "WPerPenPen = BSchOvsStp",
            "WBedWkrWkg = BSchSalOna",
        ]
    },
    'Lonen kort': {
        accounts: [
            "BSchSalNet",
            "BSchBepLhe",
            "WPerLesLon",
            "WBedAdlBet",
        ],
        rules: [
            "WPerLesLon = BSchSalNet + BSchBepLhe",
        ]
    }
}

class LegEditor {
    static readonly MANUAL_LEG = -1     // Manually added leg, not bound to a journalEntry leg

    id: number
    account: LedgerAccount
    debit: string
    debitValue: number
    credit: string
    creditValue: number
    
    constructor(private journalEditor: JournalEditor) {
        this.id = LegEditor.MANUAL_LEG
        this.account = LedgerScheme.unmapped
        this.debit = "0"
        this.debitValue = 0
        this.credit = "0"
        this.creditValue = 0
    }

    /**
     * Construct a legEditor from an entryLeg
     */
    static fromEntryLeg(leg: EntryLeg, id: number, journalEditor: JournalEditor) {
        const legEditor = new LegEditor(journalEditor)
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

    /**
     * Convert this leg to entryLegData
     */
    get entryLegData(): EntryLegData {
        return {
            ledgerAccountCode: this.account.code,
            amountData: this.amount.data
        }
    }

    /**
     * Update the account for this leg
     * @param account
     */
    updateAccount(account: LedgerAccount) {
        this.account = account
    }

    /**
     * Update the leg amount
     * Allow for data that is no number (eg 1.) but convert to a number whenever possible
     */
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

    /**
     * Finalize the amounts
     * If a debit amount has been registered then clear the credit amount (and vice versa)
     */
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
        this.journalEditor.onLegAmount(this)
    }
}

export class JournalEditor {
    private _reason: string
    private _date: Date
    private _period: Period
    private _legs: LegEditor[]
    private rules: string[] = []

    constructor() {
        this._reason = ""
        this._date = new Date()
        this._period = Period.fromDate(DateString.fromDate(this._date))
        this._legs = []
        // Minimally one leg is required
        this.addLeg()
    }

    /**
     * Creates a new editor for the given journalEntry
     */
    static fromJournalEntry(journalEntry: JournalEntry): JournalEditor {
        const journalEditor = new JournalEditor()
        journalEditor._reason = journalEntry.reason
        journalEditor._date = journalEntry.date.Date
        journalEditor._period = new Period(journalEntry.period.data)
        journalEditor._legs = journalEntry.legs.map((leg, i) =>
            LegEditor.fromEntryLeg(leg, i, journalEditor))
        return journalEditor
    }

    static fromTemplate(id: string): JournalEditor {
        const template = EditorTemplates[id as keyof typeof EditorTemplates]
        const editor = new JournalEditor()
        if (template) {
            editor.rules = template.rules
            editor._legs = template.accounts.map(account => {
                const legEditor = new LegEditor(editor)
                legEditor.account = LedgerScheme.getAccount(account)
                legEditor.updateAmount(legEditor.account.CreditDebit ?? CreditDebit.Debit, "0")
                return legEditor
            })
        }
        return editor
    }

    /**
     * Returns a shallow clone of the current editor
     */
    clone() {
        const journalEditor = new JournalEditor()
        journalEditor._reason = this._reason
        journalEditor._date = this._date
        journalEditor._period = this._period
        journalEditor._legs = this._legs
        return journalEditor
    }

    /**
     * Apply any rules that are affected by the change in the leg amount value
     */
    onLegAmount(legEditor: LegEditor) {
        this.rules
            .map(rule => rule.split("="))
            .filter(([, rhs]) => rhs.includes(legEditor.account.code))  // Evaluate RHS's that have changed
            .forEach(([lhs, rhs]) => {
                this.legs.forEach(leg => {
                    // Substitute account by its value
                    rhs = rhs.replace(leg.account.code, leg.amount.value.toString())
                })
                this.legs.filter(leg => leg.account.CreditDebit && leg.account.code === lhs.trim())
                    // Select legs that match the LHS of the rule
                    .forEach(leg => {
                        try {
                            // eslint-disable-next-line no-new-func
                            const evalRhs = new Function(`return (${rhs})`)()
                            leg.updateAmount(leg.account.CreditDebit!, evalRhs)
                            leg.finalizeAmount()
                        } catch {}
                    })
            })
    }

    get reason() { return this._reason }
    set reason(reason: string) { this._reason = reason }

    get date() { return this._date }
    set date(date: Date) {
        this._date = date
        this._period = Period.fromDate(DateString.fromDate(date))
    }

    get legs() { return this._legs }
    get nonZeroLegs() { return this._legs.filter(leg => !leg.amount.isZero())}
    addLeg() {
        const leg = new LegEditor(this)
        const { debit, credit } = this.totals()
        const amount = Amount.fromAmountCurrency(credit - debit).reversed()  // To get to debit === credit
        leg.updateAmount(amount.creditDebit, amount.isZero() ? "" : Math.abs(amount.value).toString())
        leg.finalizeAmount()
        this._legs.push(leg)
    }

    /**
     * Remove leg by its index
     */
    removeLeg(i: number) {
        this._legs.splice(i, 1)
    }

    /**
     * Returns the total debit anc credit amounts for the legs
     */
    totals() {
        return this.nonZeroLegs.reduce((sum, leg) => {
            let { debit, credit } = sum
            debit += leg.debitValue
            credit += leg.creditValue
            return { debit, credit }
        }, { debit: 0, credit: 0 })
    }

    /**
     * Tells if the current data is valid
     * Only valid data can be applied and stored in the journal
     */
    isValid() {
        const { debit, credit } = this.totals()
        return debit !== 0 &&
            credit !== 0 &&
            debit === credit &&
            this.reason &&
            ! this.legs.find(leg => leg.account === LedgerScheme.unmapped)
    }

    /**
     * Tells is the current data can be deleted from the journal
     * Only data that consists of legs that are freely allocatable can be deleted
     * If any of the legs is bound to a bankaccount the data cannot be deleted
     */
    canBeDeleted() {
        return this.legs.every(leg => leg.account.isEditable)
    }

    /**
     * Apply the current data to the given journalEntry (or construct a new one if missing)
     * The applied data will be returned
     */
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

        // Only add non-Zero legs
        this.nonZeroLegs.filter(leg => leg.id === LegEditor.MANUAL_LEG)
            .forEach(leg => {
                data.entryLegsData.push(leg.entryLegData)
            })
        return data
    }

}