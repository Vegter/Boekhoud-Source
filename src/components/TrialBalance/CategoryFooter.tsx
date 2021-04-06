import React from 'react'
import { AccountSummaryMap } from "../../types/AccountSummaryMap"
import FormatCategory from "../Utils/FormatCategory"
import { BalanceTotals } from "./BalanceTotals"
import { Td, Tr } from "../ResponsiveTable"
import { useTheme } from "@material-ui/core/styles"
import { useMediaQuery } from "@material-ui/core"

interface CategoryFooterProps {
    summary: AccountSummaryMap
    category: string
}

function CategoryFooter(props: CategoryFooterProps) {

    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'))

    const { summary, category } = props

    return (
        <>
            <BalanceTotals summary={summary}
                           filter={account => account.category === category}>
                <div>
                    Totaal <FormatCategory category={category}/>
                </div>
            </BalanceTotals>

            {!onXs && <Tr>
                <Td colSpan={6}/>
            </Tr>}
        </>
    )
}

export default CategoryFooter;
