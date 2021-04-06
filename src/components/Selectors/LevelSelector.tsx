import React from 'react'
import { LedgerScheme } from "../../types/Ledger/LedgerScheme"
import EnumSelector from "./EnumSelect"

interface LevelSelectorProps {
    levels: number[]
    onLevels: (levels: number[]) => void
}

function LevelSelector(props: LevelSelectorProps) {
    const allLevels = LedgerScheme.Levels()
    const { levels } = props

    const onLevels = (values: string[]) => {
        props.onLevels(values.map(v => parseInt(v)))
    }

    return (
        <EnumSelector title={"Nivo"}
                      allValues={allLevels}
                      selectedValues={levels}
                      onValues={onLevels}/>
    )
}

export default LevelSelector;
