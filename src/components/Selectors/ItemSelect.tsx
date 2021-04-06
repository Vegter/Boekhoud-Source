import React from 'react'

import { MenuItem, Select, useMediaQuery } from "@material-ui/core"
import { useTheme } from "@material-ui/core/styles"
import { useResponsiveStyling } from "../Editors/useResponsiveStyling"

interface Props {
    title: string
    width: number
    items: string[]
    item: string | null
    onItem: (item: string | null) => void
}

function ItemSelect(props: Props) {
    const { title, width, items, item, onItem } = props

    const { variant } = useResponsiveStyling()

    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'))

    const value = item ?? ""

    function onChange(event: React.ChangeEvent<{ value: unknown }>) {
        const newItem = event.target.value as string
        if (newItem !== item) {
            onItem(newItem || null)
        }
    }

    return (
        <div>
            <Select
                style={{width: onXs ? "100%" : width}}
                value={value}
                variant={variant}
                onChange={onChange}
                displayEmpty={true}
                disableUnderline={true}
                aria-label={title}
            >
                <MenuItem value={""}>
                    {title + "..."}
                </MenuItem>
                {items.map(item => {
                    return (
                        <MenuItem key={item} value={item}>
                            {item}
                        </MenuItem>
                    )
                })}
            </Select>
        </div>
    )
}

export default ItemSelect