import { NO_VAT, VATRate } from "./VATRate"
import { VATSpecificationData, VATSpecificationEntryData } from "../../model"
import { VATRates } from "./VATRates"
import { Amount } from "../Amount"
import assert from "assert"

interface BrutoNetto {
    netto: string
    vat: string
    bruto: string
}

/**
 * VAT line
 *
 * A VAT line holds the VAT information of a journal entry
 */
export class VATLine {
    private static _touched = 0             // last modified indictor

    touched: number = VATLine._touched      // last modified indicator for an instance

    bruto: string = ""
    vat: string = ""
    netto: string = ""

    constructor(public vatRate: VATRate | null = null, bruto?: number) {
        if (bruto) {
            this.setBruto(bruto)
        }
    }

    /**
     * Create a VAT Line from a VAT Specification (saved with the journal entry data
     */
    static fromVATSpecificationData (data: VATSpecificationData): VATLine[] {
        const date = new Date(data.date)

        const vatLines:VATLine[] = []
        data.lines.forEach(line => {
            const vatRates = new VATRates(date).rates
            const vatRate = vatRates[line.id]
            if (vatRate) {
                const vatLine = new VATLine(vatRate)
                const { bruto, vat, netto } = line
                vatLine.bruto = bruto
                vatLine.vat = vat
                vatLine.netto = netto
                vatLines.push(vatLine)
            }
        })

        return vatLines
    }

    /**
     * Get the VAT data to store with the journal entry
     */
    get data() : VATSpecificationEntryData {
        const { bruto, vat, netto } = this
        const id = this.vatRate ? this.vatRate.id : ""
        return { id, bruto, vat, netto }
    }

    /**
     * Return a reversed copy of the given bruto-vat-netto calculation
     */
    static reverseBrutoVATNetto(brutoVATNetto: {bruto: string, vat: string, netto: string}) {
        const toPositive = (value: string) => value.replace("-", "")
        const toNegative = (value: string) => +value ? `-${value}` : value

        let { bruto, vat, netto } = brutoVATNetto

        if (+bruto <= 0) {
            bruto = toPositive(bruto)
            vat = toPositive(vat)
            netto = toPositive(netto)
        } else {
            bruto = toNegative(bruto)
            vat = toNegative(vat)
            netto = toNegative(netto)
        }
        return { bruto, vat, netto }
    }

    /**
     * Reverse a VAT line, positive amounts become negative and vice versa
     */
    get reversed(): VATLine {
        const reversed = new VATLine()
        Object.assign(reversed, this)

        const { bruto, vat, netto } = VATLine.reverseBrutoVATNetto({
            bruto: this.bruto,
            vat: this.vat,
            netto: this.netto
        })

        reversed.bruto = bruto
        reversed.vat = vat
        reversed.netto = netto

        return reversed
    }

    /**
     * Tells whether the VAT Line has a VAT (not being NO_VAT)
     */
    get hasVAT() : boolean {
        return this.vatRate
            ? this.vatRate.id !== NO_VAT.id
            : false
    }

    /**
     * Returns the VAT percentage of this line
     */
    get percentage(): number {
        return this.vatRate ? this.vatRate.percentage : 0
    }

    /**
     * Register that this line has been modified (touched)
     *
     * touch numbers are comparable between VAT lines to tell the last or most recently modified line
     */
    touch() {
        VATLine._touched += 1
        this.touched = VATLine._touched
    }

    /**
     * Set the touched number back to an earlier saved number
     */
    untouch(touched: number) {
        this.touched = touched
    }

    /**
     * Set a VAT Rate for this line
     */
    setVATRate(vatRate: VATRate | null, bruto: string | number) {
        if (this.vatRate === vatRate) return

        this.touch()
        this.vatRate = vatRate
        if (vatRate) {
            /* (Re-)calc */
            this.bruto = ""
        }
        this.setBruto(bruto)
    }

    /**
     * Set the bruto value for this line and derive vat and netto value
     */
    setBruto(bruto: string | number) {
        const newBruto = VATLine.value2String(bruto)
        if (newBruto === this.bruto) return

        this.touch()
        bruto = newBruto
        if (isNaN(+bruto)) {
            this.vat = ""
            this.netto = ""
        } else {
            const { vat, netto } = VATLine.brutoNetto({bruto}, this.percentage)
            this.vat = vat
            this.netto = netto
        }
        this.bruto = bruto
    }

    /**
     * Set the VAT value for this line and derive bruto and netto value
     */
    setVAT(vat: string | number) {
        const newVAT = VATLine.value2String(vat)
        if (newVAT === this.vat) return

        this.touch()
        vat = newVAT
        if (isNaN(+vat)) {
            this.bruto = ""
            this.netto = ""
        } else {
            const { bruto, netto } = VATLine.brutoNetto({vat}, this.percentage)
            this.bruto = bruto
            this.netto = netto
        }
        this.vat = vat
    }

    /**
     * Set the netto value for this line and derive bruto and netto value
     */
    setNetto(netto: string | number) {
        const newNetto = VATLine.value2String(netto)
        if (newNetto === this.netto) return

        this.touch()
        netto = newNetto
        if (isNaN(+netto)) {
            this.bruto = ""
            this.vat = ""
        } else {
            const { bruto, vat } = VATLine.brutoNetto({netto}, this.percentage)
            this.bruto = bruto
            this.vat = vat
        }
        this.netto = netto
    }

    /**
     * Converts a numeric value to a 2-decimal string representation
     */
    static value2String(value: string | number): string {
        if (typeof value === "number") {
            return value.toFixed(2)
        }
        return value
    }

    /**
     * Calculates netto, bruto, and VAT given a single netto, bruto, and VAT value
     */
    static brutoNetto(brutoNetto: Partial<BrutoNetto>, percentage: number): BrutoNetto {
        let { bruto, vat, netto } = brutoNetto

        assert(Object.keys(brutoNetto).length === 1, "Only one known value is expected")

        if (netto) {
            const _vat = +netto * percentage
            vat = this.value2String(_vat)
            bruto = this.value2String(+netto + _vat)
        } else if (vat) {
            const _netto = percentage === 0 ? 0 : +vat / percentage
            netto = this.value2String(_netto)
            bruto = this.value2String(_netto + +vat)
        } else if (bruto) {
            const _netto = +bruto / (1 + percentage)
            netto = this.value2String(_netto)
            vat = this.value2String(+bruto - +netto)
        } else {
            return {
                netto: "",
                vat: "",
                bruto: ""
            }
        }

        return {
            netto,
            vat,
            bruto
        }
    }

    /**
     * Add the VAT lines to a total bruto, VAT and netto value
     */
    static addVATLines(lines: VATSpecificationEntryData[], round?: (n: number) => number) {
        let bruto = 0
        let vat = 0
        let netto = 0
        lines.forEach(line => {
            bruto += isNaN(+line.bruto) ? 0 : +line.bruto
            vat += isNaN(+line.vat) ? 0 : +line.vat
            netto += isNaN(+line.netto) ? 0 : +line.netto
        })
        if (round) {
            bruto = round(bruto)
            vat = round(vat)
            netto = round(netto)
        }
        return { bruto, vat, netto }
    }

    /**
     * Reverse a collection to VAT lines
     */
    static reverseLines(lines: VATLine[]) {
        return lines.map(line => line.reversed)
    }

    /**
     * Return the total and remaining value given a collection of VAT lines and a bruto total value
     */
    static getTotalRemaining(lines: VATLine[], bruto: number) {
        const total = VATLine.addVATLines(lines.map(line => line.data))
        let remaining = bruto - total.bruto
        if (Amount.fromAmountCurrency(remaining).isZero()) {
            remaining = 0
        }
        return {total, remaining}
    }

    /**
     * Auto-populate a collection of VAT lines to match the desired bruto value
     * If bruto is null, no auto-population is performed
     */
    static updateVATChoices(lines: VATLine[], bruto: number, auto: boolean) {
        lines = lines.filter(line => line.vatRate)

        if (lines.length && auto) {
            let {remaining} = this.getTotalRemaining(lines, bruto)

            if (remaining !== 0) {
                // Allocate any remaining quantity to the oldest lines
                // A correction can not result in a negative line or a line with a value that exceeds bruto

                if (lines.length === 1 && remaining !== 0 && lines[0].hasVAT) {
                    // Auto-add no-VAT line to compensate
                    const noVATLine = new VATLine(NO_VAT, remaining)
                    lines.push(noVATLine)
                } else {
                    // Adjust oldest line to compensate
                    const sortedLines = VATLine.getSortedLines(lines)
                    sortedLines.forEach(line => {
                        if (remaining !== 0) {
                            // Example: value = 25, remaining = -50
                            // New bruto is max(0, 25 - 50 = -25) = 0
                            // Remaining is -50 + (25 - 0)
                            const bruto = +line.bruto + remaining
                            remaining += +line.bruto - bruto
                            // Auto-adjust does no count as touched (no-user initiated adjustment)
                            const touched = line.touched
                            line.setBruto(bruto)
                            line.untouch(touched)
                        }
                    })
                }
            }
        }

        if (lines.length === 0) {
            lines.push(new VATLine(NO_VAT, bruto))
        } else {
            lines.push(new VATLine())
        }

        return lines
    }

    /**
     * Sorts a collection of VAT lines on last modified (touched)
     *
     * The last modified VAT line will be the first line
     */
    static getSortedLines(lines: VATLine[]) {
        return [...lines].sort((l1, l2) => l1.touched - l2.touched)
    }
}
