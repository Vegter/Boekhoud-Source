import { useStyles } from "./Styling"
import { Td, Tr } from "../ResponsiveTable"
import React from "react"
import FormatCategory from "../Utils/FormatCategory"

export function CategoryHeader(props: { category: string }) {
    const {category} = props
    const classes = useStyles()

    return <Tr>
        <Td colSpan={6} className={classes.categoryHeader}>
            <FormatCategory category={category}/>
        </Td>
    </Tr>
}