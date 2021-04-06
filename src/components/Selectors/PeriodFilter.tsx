import React from 'react'
import { useDispatch, useSelector } from "react-redux"

import { makeStyles, Slider, Typography } from '@material-ui/core'
import { createStyles } from "@material-ui/core/styles"

import { selectJournal } from "../../app/AccountingSlice"
import { selectPeriodFilter, setPeriodFilter } from "../../app/FilterSlice"

import { PeriodFilter } from "../../types/PeriodFilter"

const useStyles = makeStyles((/*theme: Theme*/) =>
    createStyles({
        mark: {
          fontSize: 10
        },
        root: {
            width: 200,
        },
}))

interface ValueLabelComponentProps {
    children: React.ReactElement
    open: boolean
    value: number
}

function ValueLabelComponent(props: ValueLabelComponentProps) {
    const { children } = props;
    return (
        <div>
            {children}
        </div>
    )
}

function PeriodFiltering() {
    const dispatch = useDispatch()
    const classes = useStyles()

    const periodFilter = useSelector(selectPeriodFilter)
    const journal = useSelector(selectJournal)

    const periods = journal.distinctPeriods()
    if (periods.length === 0) {
        // Nothing to choose
        return null
    }

    const options = PeriodFilter.fromPeriods(periods).withBuffer().values

    // value is the current periodFilterData or all periods if the filterOnPeriod is []
    const value = periodFilter.length ? periodFilter.fromTo : PeriodFilter.fromPeriods(periods).fromTo

    const onChange = (event: any, newValue: number | number[]) => {
        const newPeriodFilter = PeriodFilter.fromValues(newValue as number[]).limitTo(periods)
        if (newPeriodFilter.equals(periodFilter)) {
            // Nothing changed
            return
        }
        dispatch(setPeriodFilter({
            periodFilterData: newPeriodFilter.data
        }))
    };

    const marks = options.map((option: number) => (
        {
            value: option,
            label: (
                <span key={option} className={classes.mark}>
                    {option}
                </span>
            )
        }))

    return (
        <div className={classes.root} aria-label={"rapportage periode"}>
            <Typography id="rapportage-periode-slider" variant={"caption"}>
                Rapportage Periode
            </Typography>
            <Slider
                min={options[0]}
                max={options[options.length - 1]}
                value={value}
                onChange={onChange}
                marks={marks}
                step={null}
                valueLabelDisplay="on"
                ValueLabelComponent={ValueLabelComponent}
                aria-labelledby={"rapportage-periode-slider"}
            />
        </div>
    )
}

export default PeriodFiltering;
