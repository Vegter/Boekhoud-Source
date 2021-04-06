import React, { useState } from 'react'
import { LedgerAllocation } from "../../types/Allocation/LedgerAllocation"
import { VATLine } from "../../types/VAT/VATLine"
import { VATSpecificationData } from "../../model"
import { DateString } from "../../types/DateString"
import { VATDialog } from "./VATDialog"
import VATButton from "./VATButton"

interface VATMenuButtonProps {
    allocation: LedgerAllocation
    onClose: (result: VATSpecificationData | null) => void
}

export function VATMenuButton(props: VATMenuButtonProps) {
    const { allocation, onClose } = props

    const [vatDialog, setVATDialog] = useState(false)

    // The current VAT specification lines
    const vatSpecificationData = allocation.journalEntry.data.vatSpecificationData
    const vatLines = vatSpecificationData
        ? VATLine.fromVATSpecificationData(vatSpecificationData)
        : []

    const setVAT = (date: Date, vatLines: VATLine[] | null = null) => {
        setVATDialog(false)   // Close any open dialog
        if (vatLines) {
            if (vatLines.length === 1 && !vatLines[0].hasVAT) {
                // Choose for NO_VAT, delete any existing VAT lines
                vatLines = []
            }
            onClose({
                date: DateString.ISODateString(date),
                lines: vatLines.map(l => l.data)
            })
        } else {
            // No changes
            onClose(null)
        }
    }

    return (
        <div>
            <VATButton lines={vatLines}
                       onClick={() => setVATDialog(true)}/>

            {vatDialog && <VATDialog allocation={allocation}
                                     lines={vatLines}
                                     onClose={setVAT}/>}

        </div>
    );
}

function areEqual(prevProps: VATMenuButtonProps, nextProps: VATMenuButtonProps) {
    return prevProps.allocation.journalEntry.data.vatSpecificationData ===
        nextProps.allocation.journalEntry.data.vatSpecificationData
}

export default React.memo(VATMenuButton, areEqual)
