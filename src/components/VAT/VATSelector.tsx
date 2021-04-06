import React from 'react';
import ItemSelect from "../Selectors/ItemSelect"
import { VATRate } from "../../types/VAT/VATRate"
import { VATLine } from "../../types/VAT/VATLine"
import { VATRatesMap } from "../../types/VAT/VATRates"

interface VATSelectorProps {
    vatRates: VATRatesMap
    vatLine: VATLine
    onVAT: (vatLine: VATLine, rate: VATRate | null) => void
}

function VATSelector(props: VATSelectorProps) {

    const { vatRates, vatLine, onVAT } = props

    const title = "Kies BTW"
    const width = 200

    const items = Object.values(vatRates).map(rate => rate.shortDescription)

    const vatRate = vatLine.vatRate
    const item = vatRate ? vatRate.shortDescription : ""

    const onItem = (item: string | null) => {
        const vatRate = Object.values(vatRates).find(rate => rate.shortDescription === item) || null
        onVAT(vatLine, vatRate)
    }

    return (
        <ItemSelect title={title} width={width} items={items} item={item} onItem={onItem} />
    )
}

export default VATSelector;
