import React from 'react'
import { LedgerScheme } from "../../types/Ledger/LedgerScheme"
import EnumSelector from "./EnumSelect"

interface CreditDebitSelectorProps {
    sides: string[]
    onSides: (sides: string[]) => void
}

function CreditDebitSelector(props: CreditDebitSelectorProps) {
    const allSides = LedgerScheme.Sides()
    const { sides } = props

    const onSides = (sides: string[]) => {
        props.onSides(sides)
    };

    return (
        <EnumSelector title={"Debit/Credit"}
                      allValues={allSides}
                      selectedValues={sides}
                      onValues={onSides}/>
    )
}

export default CreditDebitSelector;
