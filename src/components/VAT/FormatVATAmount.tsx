import FormatAmount from "../Utils/FormatAmount"
import { Amount } from "../../types/Amount"
import React from "react"

export function FormatVATAmount(props: { value: number | null, currency: string, precision?: number }) {
    const {value, currency, precision} = props

    return value !== null
        ? <FormatAmount amount={Amount.fromAmountCurrency(value, currency)}
                        precision={precision || 0}
                        debitCredit={true}/>
        : <span/>
}

export default FormatVATAmount;
