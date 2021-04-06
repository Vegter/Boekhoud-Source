import { JournalEntry } from "../Journal/JournalEntry"
import { VATSpecificationEntryData } from "../../model"

/**
 * A VAT Declaration item is a journalEntry and the VATLines for this entry for the VAT Category
 *
 * Example: a journalEntry with all VAT lines that have VAT high
 */
export interface VATDeclarationItemDetails {
    journalEntry?: JournalEntry
    vatLines: VATSpecificationEntryData[]
}

/**
 * Returns all VATSpecificationEntryData that is contained in the given details
 */
export const getLines = (details: VATDeclarationItemDetails[]):VATSpecificationEntryData[]  => {
    return details.reduce((lines, detail) => {
        lines = lines.concat(detail.vatLines)
        return lines
    }, [] as VATSpecificationEntryData[])
}

/**
 * A VAT declaration item contains a netto-vat-bruto overview
 * and the details that have lead to the netto-vat-bruto outcome
 */
export interface VATDeclarationItem {
    netto: number | null
    vat: number | null
    bruto: number | null
    details: VATDeclarationItemDetails[]
    declared?: number | null
}

/**
 * Not all VAT declaration items are calculated
 *
 * Non-calculated items will be assiged a NO_VAT_CALCULATION value
 */
export const NO_VAT_CALCULATION: VATDeclarationItem = {
    netto: 0,
    vat: 0,
    bruto: 0,
    details: []
}

/**
 * Not all VAT declaration items are calculated
 *
 * Non-calculated foreign-VAT items will be assiged a NO_FOREIGN_VAT_CALCULATION value
 */
export const NO_FOREIGN_VAT_CALCULATION: VATDeclarationItem = {
    netto: 0,
    vat: null,
    bruto: null,
    details: []
}
