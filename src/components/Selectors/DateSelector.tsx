import React, { useState } from 'react'
import { KeyboardDatePicker } from "@material-ui/pickers"
import { useTheme } from "@material-ui/core/styles"
import { useMediaQuery } from "@material-ui/core"
import { Today } from "@material-ui/icons"

interface DateSelectorProps {
    label: string
    date: Date
    onDate: (date: Date | null) => void
    disableUnderline?: boolean
}

function DateSelector(props: DateSelectorProps) {
    const {label, date} = props
    const [isOpen, setIsOpen] = useState(false)

    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'));

    const onDate = (date: Date | null) => {
        setIsOpen(false)
        props.onDate(date)
    }

    const style = onXs ? {width: "96%"} : {width: 135}

    return (
        <KeyboardDatePicker
            style={style}
            invalidDateMessage={"Ongeldige datum"}
            label={label}
            format="dd-MM-yyyy"
            disableToolbar={true}
            value={date}
            autoOk={true}
            onChange={onDate}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            keyboardIcon={<Today fontSize={"small"}/>}
            InputProps={{
                disableUnderline: props.disableUnderline ?? true,
            }}
            KeyboardButtonProps={{
                'aria-label': `wijzig ${label}`,
            }}
            open={isOpen}/>
    )
}

export default DateSelector;
