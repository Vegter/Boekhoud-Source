import { EntryLegData, JournalEntryData, VATSpecificationData } from "../../model"
import { EntryLeg } from "./EntryLeg"
import { Amount } from "../Amount"
import { LedgerAccount } from "../Ledger/LedgerAccount"
import { DateString } from "../DateString"
import { Period } from "../Period"
import { VATLine } from "../VAT/VATLine"
import { LEDGER_ACCOUNT } from "../../config"
import { VATDeclaration, VATDeclarationTag } from "../VAT/VATDeclaration"
import assert from "assert"

/**
 * JournalEntry
 * A balanced collection of account bookings
 * The sum of the debited and credited accounts is 0
 *
 * A JournalEntry normally gets created on the basis of the allocation of a bank mutation
 * The allocated leg is the side that describes how the bank mutation is booked
 * The opposite leg is the side that books on the associated ledgerAccount of the bankAccount
 */
export class JournalEntry {
    constructor(readonly data: JournalEntryData) {}

    get id(): string { return this.data.id }
    get reason(): string { return this.data.reason }
    get period(): Period { return new Period(this.data.period) }
    get date(): DateString { return new DateString(this.data.date) }
    get legs(): EntryLeg[] { return this.data.entryLegsData.map(data => new EntryLeg(data))}

    /**
     * Checks the integrity of the journalEntry
     *
     * The sum of all amounts of all legs should be 0
     */
    checkIntegrity() {
        const sum = this.legs
            .map(leg => leg.amount)
            .reduce((sum, amount) => sum.add(amount), new Amount())
        assert(sum.isZero(), `The ${this.legs.length} legs sum up to ${sum}`)
    }

    getLeg(tag: string) {
        return this.legs.find(leg => leg.tag === tag)
    }

    /**
     * Construct a JournalEntry from the given allocation data
     */
    public static fromAllocation(id: string,
                                 amount: Amount,
                                 date: DateString,
                                 period: Period,
                                 reason: string,
                                 account: LedgerAccount,
                                 oppositeAccount: LedgerAccount): JournalEntry {

        const oppositeLeg:EntryLegData = {
            ledgerAccountCode: oppositeAccount.code,
            amountData: amount.reversed().data
        }

        const allocatedLeg:EntryLegData = {
            ledgerAccountCode: account.code,
            amountData: amount.data
        }

        const entry = new JournalEntry({
            id,
            date: date.data,
            period: period.data,
            reason,
            entryLegsData: [oppositeLeg, allocatedLeg]
        })
        entry.checkIntegrity()
        return entry
    }

    /**
     * Construct a new JournalEntry for the given VAT declaration
     */
    public static fromVATDeclaration(declaration: VATDeclaration) {
        const id: string = declaration.id
        const currency = declaration.currency
        const { declaredVAT, rawVAT } = declaration.getJournalData()

        const declared = declaredVAT.total
        const difference = rawVAT.total - declared

        const DeclarationAccount = (value: number) => value < 0
            ? LEDGER_ACCOUNT.VAT_TO_BE_CLAIMED
            : LEDGER_ACCOUNT.VAT_TO_BE_PAID

        const entryLegsData = [
            // High VAT
            {
                ledgerAccountCode: LEDGER_ACCOUNT.VAT_TO_BE_PAID,
                amountData: Amount.fromAmountCurrency(-rawVAT.totalHigh.vat, currency),
                tag: VATDeclarationTag.High
            },
            // Low VAT
            {
                ledgerAccountCode: LEDGER_ACCOUNT.VAT_TO_BE_PAID,
                amountData: Amount.fromAmountCurrency(-rawVAT.totalLow.vat, currency),
                tag: VATDeclarationTag.Low
            },
            // Private use
            {
                ledgerAccountCode: LEDGER_ACCOUNT.VAT_PRIVATE_USE,
                amountData: Amount.fromAmountCurrency(-rawVAT.totalPrivateUse.vat, currency),
                tag: VATDeclarationTag.PrivateUse
            },
            // Paid VAT
            {
                ledgerAccountCode: LEDGER_ACCOUNT.VAT_TO_BE_CLAIMED,
                amountData: Amount.fromAmountCurrency(-rawVAT.totalPaid.vat, currency),
                tag: VATDeclarationTag.Paid
            },
            // Difference between declared VAT and actual VAT
            {
                ledgerAccountCode: LEDGER_ACCOUNT.PAYMENT_DIFFERENCES,
                amountData: Amount.fromAmountCurrency(difference, currency)
            },
        ]
            .filter(data => !data.amountData.isZero())
            .map(data => ({...data, amountData: data.amountData.data}))
            .concat(
                // Declared VAT
                {
                    ledgerAccountCode: DeclarationAccount(declaredVAT.total),
                    amountData: Amount.fromAmountCurrency(declaredVAT.total, currency).data,
                    tag: VATDeclarationTag.Declared
                },
            )

        const entry = new JournalEntry({
            id,
            date: DateString.fromDate(new Date()).data,
            period: new Period(declaration.period.year.toString()).data,
            reason: id,
            entryLegsData
        })

        entry.checkIntegrity()
        return entry
    }

    /**
     * Returns the vatLegs for this journalEntry, possible an empty array
     */
    get vatLegs(): EntryLeg[] {
        return this.data.entryLegsData
            .filter((_, i) => i >= 2)
            .map(data => new EntryLeg(data))
    }

    /**
     * Returns the VAT date for this journalEntry
     *
     * If no VAT is applicable to this journalEntry, null is returned
     */
    get vatDate(): Date | null {
        const vat = this.getVAT()
        if (vat) {
            return new Date(vat.date)
        } else {
            return null
        }
    }

    /**
     * Returns the VAT specification data, or null if no VAT specification exists for this journalEntry
     */
    getVAT(): VATSpecificationData | null {
        return this.data.vatSpecificationData || null
    }

    /**
     * Set VAT, ie add VAT lines and a VAT specification to this journalEntry
     */
    setVAT(vatSpecificationData: VATSpecificationData) {
        this.data.entryLegsData.splice(2)
        const { lines } = vatSpecificationData
        if (lines.length > 0) {
            this.data.vatSpecificationData = vatSpecificationData
            const netto = VATLine.addVATLines(lines).netto
            const currency = this.allocatedLeg.amount.currency
            lines.forEach(line => {
                if (+line.vat !== 0) {
                    this.data.entryLegsData.push({
                        ledgerAccountCode: +line.vat < 0
                            ? LEDGER_ACCOUNT.VAT_TO_BE_CLAIMED
                            : LEDGER_ACCOUNT.VAT_TO_BE_PAID,
                        amountData: Amount.fromAmountCurrency(+line.vat, currency).data
                    })
                }
            })
            // Alternative: amount = opposite.amount - vat
            this.allocatedLeg.data.amountData = Amount.fromAmountCurrency(+netto, currency).data
        } else {
            this.data.vatSpecificationData = undefined
            this.allocatedLeg.data.amountData = this.oppositeLeg.amount.reversed().data
        }
        this.checkIntegrity()
    }

    /**
     * Returns the EntryLeg with the opposite account
     */
    get oppositeLeg(): EntryLeg {
        return this.legs[0]
    }

    /**
     * Returns the EntryLeg with the allocated account
     */
    get allocatedLeg(): EntryLeg {
        return this.legs[1]
    }

    /**
     * Sets the reason (description) for the journalEntry
     */
    set reason(reason: string) {
        this.data.reason = reason
    }

    /**
     * Sets the period for the journalEntry
     */
    set period(period: Period) {
        this.data.period = period.data
    }
}
