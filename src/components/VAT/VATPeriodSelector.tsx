import React from 'react'
import { FormControl, InputLabel, ListSubheader, MenuItem, Select } from "@material-ui/core"
import { range } from "../../services/utils"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import { Period } from "../../types/Period"
import { VATDeclarationPeriod } from "../../types/VAT/VATDeclarationPeriod"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1),
            minWidth: 150,
        },
    }),
);

interface VATPeriodSelectorProps {
    periods: Period[]
    period: VATDeclarationPeriod | null
    onPeriod: (vatDeclarationPeriod: VATDeclarationPeriod | null) => void
}

function VATPeriodSelector(props: VATPeriodSelectorProps) {
    const { period, periods } = props

    const classes = useStyles();

    const value = period ? period.id : ""

    const onChange = (event: any) => {
        const value = event.target.value || ""
        const period = value ? VATDeclarationPeriod.fromId(value) : null
        props.onPeriod(period)
    }

    const items = periods.map(period => {
        const year = period.value
        const now = new Date()
        const quarters = range(1, 5)
            .map(quarter => new VATDeclarationPeriod(year, quarter))
            .filter(vatPeriod => vatPeriod.startDate <= now)
        return { year, quarters }
    })

    return (
        <FormControl className={classes.formControl}>

            <InputLabel htmlFor="select-vat-period">
                Aangifte Tijdvak
            </InputLabel>

            <Select id="select-vat-period"
                    value={value} onChange={onChange}>

                {items.map(item => ([
                    // Show year header
                    <ListSubheader>{item.year}</ListSubheader>,

                    // Show quarters
                    item.quarters.map(quarter => (
                        <MenuItem key={quarter.id} value={quarter.id}>
                            {quarter.year} Kwartaal {quarter.quarter}
                        </MenuItem>
                    ))
                ]))}

            </Select>
        </FormControl>
    )
}

export default VATPeriodSelector;
