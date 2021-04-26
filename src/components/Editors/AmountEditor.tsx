import React from 'react'
import { TextField } from "@material-ui/core"

interface AmountEditorProps {
    value: string,
    onChange: (value: string) => void
    onBlur: () => void
    disabled?: boolean
}

function AmountEditor(props: AmountEditorProps) {
    const { value, disabled = false } = props

    const onChange = (event: any) => {
        props.onChange(event.target.value)
    }

    const onBlur = () => {
        props.onBlur()
    }

    return (
        <TextField value={value}
                   size={"small"}
                   style={{
                       width: 100
                   }}
                   InputProps={{
                       disableUnderline: true
                   }}
                   inputProps={{
                       style: { textAlign: 'right' }
                   }}
                   disabled={disabled}
                   onBlur={onBlur}
                   onChange={onChange}
        />
    )
}

export default AmountEditor;
