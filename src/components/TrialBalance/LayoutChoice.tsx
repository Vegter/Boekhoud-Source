import React, { ChangeEvent } from 'react'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@material-ui/core"

export enum LayoutType {
    TRIALSALDI = "T",
    RESULTS = "R"
}

export const LayoutLabel = {
    [LayoutType.TRIALSALDI]: "Proef- en Saldibalans",
    [LayoutType.RESULTS]: "Winst- en Verliesrekening"
}

interface LayoutChoiceProps {
    layoutType: LayoutType
    onLayout: (layoutType: LayoutType) => void
}

function LayoutChoice(props: LayoutChoiceProps) {
    const { layoutType, onLayout } = props

    const onChange = (event: ChangeEvent<HTMLInputElement>, value: string) => {
        const layout = value as LayoutType
        onLayout(layout)
    }

    return (
        <FormControl component="fieldset">
            <FormLabel component="legend" className={"text-left-align"}>Overzicht</FormLabel>
            <RadioGroup aria-label="Proef- en Saldibalans of Resultatenrekening"
                        row
                        name="layout"
                        value={layoutType}
                        onChange={onChange}>
                {Object.entries(LayoutLabel).map(([value, label]) => {
                    return (
                        <FormControlLabel key={value}
                                          value={value}
                                          control={<Radio size={"small"} color="primary"/>} label={label} />
                    )
                })}
            </RadioGroup>
        </FormControl>
    )
}

export default LayoutChoice