import React, { ChangeEvent } from 'react'
import { useDispatch } from "react-redux"

import { Box, makeStyles, MenuItem, Select } from '@material-ui/core'

import { setPeriod } from "../../app/AccountingSlice"

import { LedgerAllocation } from "../../types/Allocation/LedgerAllocation"
import { Period } from "../../types/Period"
import { createStyles } from "@material-ui/core/styles"
import { useResponsiveStyling } from "./useResponsiveStyling"

export const PeriodSelectorWidth = 70

const useStyles = makeStyles((theme) =>
    createStyles({
        inputRoot: {
            paddingTop: 10,
            paddingBottom: 10,
        },
        root: {
            width: PeriodSelectorWidth,
            [theme.breakpoints.down('xs')]: {
                width: PeriodSelectorWidth + 20,
                marginTop: "-5px"
            },
        },
}));

interface PeriodSelectorProps {
    allocation: LedgerAllocation
    disabled: boolean
}

function PeriodSelector(props: PeriodSelectorProps) {
    const { allocation, disabled } = props
    const dispatch = useDispatch()
    const classes = useStyles()
    const { variant, inputProps } = useResponsiveStyling()

    const period = allocation.period
    const periods = period.getSelectablePeriods()

    const onChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
        const newValue = event.target.value as string
        const newPeriod = newValue ? new Period(newValue) : period
        if (! newPeriod.equals(period)) {
            dispatch(setPeriod({allocationData: allocation.data, period: newPeriod.data}))
        }
    }

    const selectOptions = periods.map(period => (
        <MenuItem key={period.string} value={period.data}>
            {period.toString()}
        </MenuItem>
    ))

    return (
        <>
        <Box display="none" displayPrint="block">
            {/* Print Only */}
            {period.toString()}
        </Box>

        <Box display="block" displayPrint="none">
        {/* Screen Only */}
            <Select value={period}
                    aria-label={"kies een periode"}
                    variant={variant}
                    {...inputProps}
                    className={classes.root}
                    inputProps={{classes: {root: classes.inputRoot}}}
                    onChange={onChange}
                    disabled={disabled}
            >
                {selectOptions}
            </Select>
        </Box>
        </>
    )
}

function areEqual(prevProps: PeriodSelectorProps, nextProps: PeriodSelectorProps) {
    return prevProps.allocation.period.equals(nextProps.allocation.period) &&
        prevProps.disabled === nextProps.disabled
}

export default React.memo(PeriodSelector, areEqual)