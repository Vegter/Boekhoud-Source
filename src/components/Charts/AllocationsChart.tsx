import React from 'react'
import { Doughnut } from "react-chartjs-2"
import { LedgerAllocationMap } from "../../types/Allocation/LedgerAllocationMap"
import { getAllocationsData, getPieChartOptions } from "./index"
import { getWidthHeight } from "./config"
import { createStyles, makeStyles } from "@material-ui/core/styles"

let [width, height] = getWidthHeight()
width *= 2
height /= 2

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: width,
            height: height,
            margin: "auto"
        }
    }),
);

interface AllocationsChartProps {
    allocations: LedgerAllocationMap
}

function AllocationsChart(props: AllocationsChartProps) {
    const { allocations } = props

    const classes = useStyles()

    const data = getAllocationsData(allocations)
    const options = getPieChartOptions("Toewijzing transacties")

    return (
        <div className={classes.root}>
            <Doughnut data={data}
                      options={options}
                      width={width}
                      height={height}/>
        </div>
    )
}

export default AllocationsChart