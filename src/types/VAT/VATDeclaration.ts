import { Journal } from "../Journal/Journal"
import { VAT_HIGH, VAT_LOW } from "./VATHistory"
import { VATLine } from "./VATLine"
import { VATSpecificationEntryData } from "../../model"
import assert from "assert"
import { VATDeclarationPeriod } from "./VATDeclarationPeriod"
import {
    getLines,
    NO_FOREIGN_VAT_CALCULATION,
    NO_VAT_CALCULATION,
    VATDeclarationItemDetails
} from "./VATDeclarationItem"
import { NO_VAT, VATRate } from "./VATRate"
import { VATRates } from "./VATRates"
import { JournalEntry } from "../Journal/JournalEntry"
import { Accounting } from "../Accounting"

/**
 * Template for an empt manual VAT specification entry
 */
const EmptyVATSpecificationEntryData = {
    id: "",
    bruto: "0",
    vat: "0",
    netto: "0",
}

/**
 * Reverse the bruto-vat-netto amounts in a VAT specification entry
 */
export function reverseData(data: VATSpecificationEntryData): VATSpecificationEntryData {
    const reversed = VATLine.reverseBrutoVATNetto({
        bruto: data.bruto,
        vat: data.vat,
        netto: data.netto
    })
    return {...data, ...reversed}
}

/**
 * Definition of the VAT declaration categories that are calculated or entered manually in the VAT declaration
 */
export enum VATDeclarationTag {
    High = "Hoog",
    Low = "Laag",
    PrivateUse = "Prive gebruik",
    Paid = "Betaald",
    Declared = "Aangifte bedrag"
}

/**
 * Definition of the VAT declaration categories that allow for a manual entry
 */
export type ManualId = VATDeclarationTag.High |
    VATDeclarationTag.Low |
    VATDeclarationTag.PrivateUse |
    VATDeclarationTag.Paid

/**
 * VAT Declaration
 *
 * Generates and holds a VAT Declaration for the given journal in the given declaration period
 */
export class VATDeclaration {
    public currency: string = Accounting.currency
    public vatSpecificationEntryDatas: VATSpecificationEntryData[]
    public readonly manualVATs: Record<ManualId, VATSpecificationEntryData> = {
        [VATDeclarationTag.High]: {...EmptyVATSpecificationEntryData},
        [VATDeclarationTag.Low]: {...EmptyVATSpecificationEntryData},
        [VATDeclarationTag.PrivateUse]: {...EmptyVATSpecificationEntryData},
        [VATDeclarationTag.Paid]: {...EmptyVATSpecificationEntryData},
    }

    constructor(public readonly journal: Journal,
                public readonly period: VATDeclarationPeriod,
                manualVATs?: Record<ManualId, VATSpecificationEntryData>) {
        this.vatSpecificationEntryDatas = []
        if (manualVATs) {
            // Explicit definition of manual VAT entries
            this.manualVATs = manualVATs
        } else if (journal.hasJournalEntry(this.id)) {
            // Adjust the manual VAT specification for the amount that has been declared in any previous session
            const journalEntry = journal.getJournalEntry(this.id)
            this.manualVATs[VATDeclarationTag.PrivateUse].vat =
                (-1 * this.declaredAmount(journalEntry, VATDeclarationTag.PrivateUse)).toFixed(2)
        }
    }

    /**
     * Returns the VAT Rate for the given VAT category
     */
    getVATRate(category: string): VATRate {
        const rateIds: Record<ManualId, string> = {
            [VATDeclarationTag.High]: VAT_HIGH,
            [VATDeclarationTag.Low]: VAT_LOW,
            [VATDeclarationTag.PrivateUse]: NO_VAT.id,
            [VATDeclarationTag.Paid]: NO_VAT.id,
        };
        const manualId = VATDeclaration.getManualId(category)
        const rateId = rateIds[manualId] || NO_VAT.id
        const rates = new VATRates(this.period.endDate)
        return rates.rates[rateId]
    }

    /**
     * Unique identification of this declaration
     */
    get id() {
        const { year, quarter } = this.period
        return `BTW Aangifte ${year} kwartaal ${quarter}`
    }

    /**
     * Tells whether this given category is a VAT expense (VAT paid) category
     */
    static isExpenseCategory(category: string): boolean {
        const manualId = VATDeclaration.getManualId(category)
        return manualId === VATDeclarationTag.Paid
    }

    /**
     * Returns the VAT declaration category for the given VAT category
     *
     * Example: 1a Leveringen/diensten belast algemeen tarief => VATDeclarationTag.High
     */
    static getManualId(category: string): ManualId {
        const mapping: Record<string, ManualId> = {
            "1a": VATDeclarationTag.High,
            "1b": VATDeclarationTag.Low,
            "1d": VATDeclarationTag.PrivateUse,
            "5b": VATDeclarationTag.Paid
        }
        return mapping[category.substr(0, 2)]
    }

    /**
     * Register a manual VAT entry for the given category
     */
    setManualVAT(category: string, data: VATSpecificationEntryData) {
        const manualId = VATDeclaration.getManualId(category)
        if (VATDeclaration.isExpenseCategory(category)) {
            data = reverseData(data)
        }
        this.manualVATs[manualId] = data
    }

    /**
     * Get the VAT declaration items for the VAT Categories High VAT, Low VAT and Paid VAT
     */
    private getVATs() {
        const highVAT: VATDeclarationItemDetails[] = []
        const lowVAT: VATDeclarationItemDetails[] = []
        const paidVAT: VATDeclarationItemDetails[] = []

        this.journal.journalEntries
            .filter(journalEntry => journalEntry.vatDate &&
                this.period.startDate <= journalEntry.vatDate && journalEntry.vatDate <= this.period.endDate)
            .forEach(journalEntry => {
                // Single currency VAT declaration
                assert(!this.currency || this.currency === journalEntry.allocatedLeg.amount.currency)
                const vat = journalEntry.getVAT()!
                this.currency = journalEntry.allocatedLeg.amount.currency

                if (journalEntry.allocatedLeg.amount.isCredit) {
                    [VAT_HIGH, VAT_LOW].forEach(vatRateId => {
                        const vatLines = vat.lines.filter(line => line.id === vatRateId)
                        if (vatLines.length) {
                            const entry = {journalEntry, vatLines}
                            vatRateId === VAT_HIGH ? highVAT.push(entry) : lowVAT.push(entry)
                        }
                    })
                } else {
                    paidVAT.push({journalEntry, vatLines: vat.lines})
                }
            })

        const manualEntry = (id: ManualId) => ({
            vatLines: [this.manualVATs[id]]
        })

        return {
            highVAT: highVAT.concat(manualEntry(VATDeclarationTag.High)),
            lowVAT: lowVAT.concat(manualEntry(VATDeclarationTag.Low)),
            paidVAT: paidVAT.concat(manualEntry(VATDeclarationTag.Paid)),
            privateUseVAT: [manualEntry(VATDeclarationTag.PrivateUse)]
        }
    }

    /**
     * Get the VAT to be declared for this period
     *
     * The rounded=true figures are for the declaration
     * The rounded=false figures are for the journalEntry
     */
    private getDeclaredVAT(rounded: boolean) {
        const { highVAT, lowVAT, paidVAT, privateUseVAT } = this.getVATs()

        const round = rounded ? Math.floor : undefined

        const totalHigh = VATLine.addVATLines(getLines(highVAT), round)
        const totalLow = VATLine.addVATLines(getLines(lowVAT), round)
        const totalPrivateUse = VATLine.addVATLines(getLines(privateUseVAT), round)
        const totalPaid = VATLine.addVATLines(getLines(paidVAT), round)    // ceil for negative amounts

        const totalDue = totalHigh.vat + totalLow.vat + totalPrivateUse.vat

        return {
            highVAT,
            totalHigh,
            lowVAT,
            totalLow,
            privateUseVAT,
            totalPrivateUse,
            totalPaid,
            paidVAT,
            totalDue,
            total: totalDue + totalPaid.vat
        }
    }

    /**
     * Returns the data that is required for constructing the journalEntry for this period
     */
    getJournalData() {
        const declaredVAT = this.getDeclaredVAT(true)
        const rawVAT = this.getDeclaredVAT(false)

        return { declaredVAT, rawVAT }
    }

    /**
     * Return the total VAT to be paid or to be claimed for this period
     */
    get total() {
        return this.getDeclaredVAT(true).total
    }

    /**
     * Returns the declared amount for the given tag
     */
    declaredAmount(journalEntry: JournalEntry | null, tag: VATDeclarationTag) {
        if (journalEntry) {
            const leg = journalEntry.getLeg(tag)
            return leg ? leg.amount.value : 0
        } else {
            return 0
        }
    }

    /**
     * Returns a VAT declaration document for this declaration period
     */
    getDeclarationDocument(journalEntry: JournalEntry | null = null) {
        const {
            highVAT,
            totalHigh,
            lowVAT,
            totalLow,
            privateUseVAT,
            totalPrivateUse,
            totalPaid,
            paidVAT,
            totalDue,
        } = this.getDeclaredVAT(true)

        return {
            "1. Prestaties binnenland": {
                "1a Leveringen/diensten belast algemeen tarief": {
                    netto: totalHigh.netto,
                    vat: totalHigh.vat,
                    bruto: totalHigh.bruto,
                    details: highVAT,
                    declared: this.declaredAmount(journalEntry, VATDeclarationTag.High)
                },
                "1b Leveringen/diensten belast met verlaagd tarief": {
                    netto: totalLow.netto,
                    vat: totalLow.vat,
                    bruto: totalLow.bruto,
                    details: lowVAT,
                    declared: this.declaredAmount(journalEntry, VATDeclarationTag.Low)
                },
                "1c Leveringen/diensten belast met overige tarieven behalve 0%": NO_VAT_CALCULATION,
                "1d Prive-gebruik": {
                    netto: null,
                    vat: totalPrivateUse.vat,
                    bruto: null,
                    details: privateUseVAT,
                    declared: this.declaredAmount(journalEntry, VATDeclarationTag.PrivateUse)
                },
                "1e Leveringen/diensten belast met 0% of niet bij u belast": NO_FOREIGN_VAT_CALCULATION,
            },
            "2. Verleggingsregelingen binnenland": {
                "2a Leveringen/diensten waarbij de heffing van omzetbelasting naar u is verlegd": NO_VAT_CALCULATION,
            },
            "3. Prestaties naar/in het buitenland": {
                "3a Leveringen naar landen buiten de EU (uitvoer)": NO_FOREIGN_VAT_CALCULATION,
                "3b Leveringen naar/diensten in landen binnen de EU": NO_FOREIGN_VAT_CALCULATION,
                "3c Installatie/afstandsverkopen binnen de EU": NO_FOREIGN_VAT_CALCULATION,
            },
            "4. Prestaties uit het buitenland aan u verricht": {
                "4a Leveringen/diensten uit landen buiten de EU": NO_VAT_CALCULATION,
                "4b Leveringen/diensten uit landen binnen de EU": NO_VAT_CALCULATION,
            },
            "5. Voorbelasting, kleineondernemersregeling,schatting en eindtotaal": {
                "5a Verschuldigde omzetbelasting": {
                    netto: null,
                    vat: totalDue,
                    bruto: null,
                    details: []
                },
                "5b Voorbelasting": {
                    netto: null,
                    vat: totalPaid.vat,
                    bruto: null,
                    details: paidVAT,
                    declared: this.declaredAmount(journalEntry, VATDeclarationTag.Paid)
                },
                "5c Subtotaal": {
                    netto: null,
                    vat: this.total,
                    bruto: null,
                    details: [],
                },
            }
        }
    }
}
