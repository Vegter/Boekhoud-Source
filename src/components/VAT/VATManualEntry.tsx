import { reverseData, VATDeclaration } from "../../types/VAT/VATDeclaration"
import { VATDeclarationItemDetails } from "../../types/VAT/VATDeclarationItem"
import { VATSpecificationEntryData } from "../../model"
import React, { useState } from "react"
import { NO_VAT } from "../../types/VAT/VATRate"
import ManualEntryDialog from "./ManualEntryDialog"
import { Td, Tr } from "react-super-responsive-table"
import Button from "@material-ui/core/Button"
import FormatVATAmount from "./FormatVATAmount"
import { useStyles } from "./VATStyling"

export function VATManualEntry(props: {
    declaration: VATDeclaration,
    category: string,
    currency: string,
    detail: VATDeclarationItemDetails,
    onManual: (category: string, line: VATSpecificationEntryData) => void
}) {
    const {declaration, category, currency, detail} = props

    const [dialog, setDialog] = useState(false)
    const classes = useStyles()

    let line = detail.vatLines[0]
    if (VATDeclaration.isExpenseCategory(category)) {
        line = reverseData(line)
    }
    const vatRate = declaration.getVATRate(category)
    const showNetto = vatRate.id !== NO_VAT.id

    const onCloseDialog = (data: VATSpecificationEntryData | null) => {
        setDialog(false)
        if (data) {
            props.onManual(category, data)
        }
    }

    const openDialog = () => {
        setDialog(true)
    }

    return (
        <>
            {dialog && <ManualEntryDialog category={category}
                                          data={line}
                                          vatRate={vatRate}
                                          onClose={onCloseDialog}/>}
            <Tr>
                <Td className={`noheader ${classes.categoryDetails}`}>
                    <Button className={classes.manualButton} size={"small"} onClick={openDialog} variant={"outlined"}>
                        Handmatige Invoer
                    </Button>
                </Td>
                <Td className={classes.netto}>
                    {showNetto && <FormatVATAmount value={+line.netto} currency={currency} precision={2}/>}
                </Td>
                <Td className={classes.vat}>
                    <FormatVATAmount value={+line.vat} currency={currency} precision={2}/>
                </Td>
                <Td/>
            </Tr>
        </>
    )
}