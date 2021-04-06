import React from 'react';

import { Box, LinearProgress, makeStyles, Typography } from "@material-ui/core"

import { LedgerAllocationMap } from "../../types/Allocation/LedgerAllocationMap"
import { createStyles } from "@material-ui/core/styles"
import AllocationsProgress from "./AllocationsProgress"

const useStyles = makeStyles((/*theme: Theme*/) =>
    createStyles({
        percentage: {
            textAlign: "right",
            marginRight: 5
        },
    }))

interface AllocationsIndicatorProps {
    title: string
    allocations: LedgerAllocationMap
    circular?: boolean
}

function AllocationsIndicator(props:AllocationsIndicatorProps) {
    const { title, allocations, circular = true } = props
    const classes = useStyles()

    const [mapped, unmapped] = allocations.getMappedUnmapped()

    const value = (mapped / (mapped + unmapped)) * 100
    const percentage = `${Math.round(value,)}%`

    if (circular) {
        return (
            <div>
                <div><AllocationsProgress value={value}/></div>
                <div>{title}</div>
            </div>
        )
    } else {
        return (
            <Box display="flex" alignItems="center" mr={-3}>
                <Box width="60%">
                    {title}
                </Box>
                <Box width="40%" mr={1}>
                    <LinearProgress variant="determinate" value={value} />
                </Box>
                <Box minWidth={35} className={classes.percentage}>
                    <Typography variant="body2" color="textSecondary">
                        {percentage}
                    </Typography>
                </Box>
            </Box>
        );
    }

}

export default AllocationsIndicator;