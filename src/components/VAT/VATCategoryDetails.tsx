import { VATDeclaration } from "../../types/VAT/VATDeclaration"
import { getLines, VATDeclarationItem } from "../../types/VAT/VATDeclarationItem"
import { VATSpecificationEntryData } from "../../model"
import { VATLine } from "../../types/VAT/VATLine"
import React from "react"
import { DateString } from "../../types/DateString"
import { VATRates } from "../../types/VAT/VATRates"
import { Td, Th, Tr } from "react-super-responsive-table"
import FormatVATAmount from "./FormatVATAmount"
import { VATManualEntry } from "./VATManualEntry"
import { useStyles } from "./VATStyling"

export function VATCategoryDetails(props: {
    declaration: VATDeclaration,
    category: string,
    item: VATDeclarationItem,
    currency: string,
    onManual: (category: string, line: VATSpecificationEntryData) => void
}) {
    const {declaration, category, item, currency, onManual} = props
    const classes = useStyles()

    const total = VATLine.addVATLines(getLines(item.details))

    return (
        <React.Fragment>
            {/* Detail lines */}
            {item.details.map(detail => {
                const journalEntry = detail.journalEntry
                if (journalEntry) {
                    const vatDate = journalEntry.vatDate!
                    const date = DateString.fromDate(vatDate)
                    const description = journalEntry.reason
                    const vatRates = new VATRates(vatDate).rates
                    return detail.vatLines.map((vatSpecification, i) => {
                        const rate = vatRates[vatSpecification.id]
                        return (
                            <Tr key={i}>
                                <Td className={`noheader ${classes.categoryDetails}`}>
                                    {`${date.format()} - ${description} (${rate.percentageString})`}
                                </Td>
                                <Td className={classes.netto}>
                                    <FormatVATAmount value={+vatSpecification.netto} currency={currency} precision={2}/>
                                </Td>
                                <Td className={classes.vat}>
                                    <FormatVATAmount value={+vatSpecification.vat} currency={currency} precision={2}/>
                                </Td>
                                <Td/>
                            </Tr>
                        )
                    })
                } else {
                    // Manual entry
                    return <VATManualEntry key={"manual" + category}
                                           declaration={declaration}
                                           currency={currency}
                                           detail={detail}
                                           category={category}
                                           onManual={onManual}/>
                }
            })}

            {/* Detail totals */}
            {item.details.length > 0 && <Tr>
                <Th className={`noheader ${classes.categoryDetails}`}>Totaal</Th>
                <Th className={classes.netto}>
                    <FormatVATAmount value={total.netto} currency={currency} precision={2}/>
                </Th>
                <Th className={classes.vat}>
                    <FormatVATAmount value={total.vat} currency={currency} precision={2}/>
                </Th>
                <Th className={classes.vat}>
                    <FormatVATAmount value={item.declared ?? null} currency={currency} precision={2}/>
                </Th>
            </Tr>}
        </React.Fragment>
    )
}