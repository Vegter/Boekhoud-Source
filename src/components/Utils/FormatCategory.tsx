import React from 'react'
import { LEDGER_ACCOUNT } from "../../config"

interface FormatCategoryProps {
    category: string
}

function FormatCategory(props: FormatCategoryProps) {
    const { category } = props

    const description = {
        [LEDGER_ACCOUNT.BALANCE_ACCOUNT]: "Balans",
        [LEDGER_ACCOUNT.REVENUE_CATEGORY]: "Opbrengsten",
        [LEDGER_ACCOUNT.EXPENSE_CATEGORY]: "Kosten"
    }[category]

    return (
        <span>{description}</span>
    )
}

export default FormatCategory