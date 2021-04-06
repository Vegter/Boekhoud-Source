import React, { useEffect, useState } from 'react'

import { Grid, makeStyles, Slider } from "@material-ui/core"
import { createStyles } from "@material-ui/core/styles"
import IconButton from "@material-ui/core/IconButton"
import { ArrowLeft, ArrowRight } from "@material-ui/icons"

import { Bar } from "react-chartjs-2"

import { getBarChartOptions, getQualitativeColor } from "./index"
import { getWidthHeight } from "./config"

import { Amount } from "../../types/Amount"
import { useURLState } from "../useURLState"

const useStyles = makeStyles((/*theme: Theme*/) =>
    createStyles({
        sliderRoot: {
            marginTop: -10
        },
        rightLefButton: {
            marginBottom: 5,
        },
    }))

export type ExpenseRevenueChartData = {
    label: string,
    value: Amount
}[]

interface ExpenseRevenueChartProps {
    title: string,
    data: ExpenseRevenueChartData
}

const ITEMS_TO_SHOW = 5

function ExpenseRevenueChart(props: ExpenseRevenueChartProps) {
    const [urlState, setURLState] = useURLState()
    const [data, setData] = useState({})

    const classes = useStyles()
    const {title} = props

    const [width, height] = getWidthHeight()

    const id = `${title.toLowerCase()}Chart`
    const range = urlState.getNumericValue(id)

    useEffect(() => {
        setData({
            labels: [""],
            datasets: props.data.slice(range, range + ITEMS_TO_SHOW)
                .map((data, i) => ({
                    label: data.label,
                    maxBarThickness: 50,
                    backgroundColor: getQualitativeColor(range + i),
                    data: [Math.abs(data.value.value)]
                }))
        })
    }, [props.data, range])

    const onChange = (event: React.ChangeEvent<{}>, value: (number | number[])) => {
        if (typeof value === "number" && value !== range) {
            setURLState({[id]: value})
        }
    }

    const onRangeUpDown = (n: number) => {
        setURLState({[id]: range + n})
    }

    const maxRange = props.data.length
    const showSlider = maxRange > ITEMS_TO_SHOW

    return (
        <div>
            <Bar data={data}
                 options={getBarChartOptions(title)}
                 width={width}
                 height={height} />
            {showSlider && (
                <Grid container
                      spacing={0}
                      justify={"space-around"}
                      alignItems={"center"}
                      className={classes.sliderRoot}>
                    <Grid item xs={2}>
                        <IconButton disabled={range === 0}
                                    onClick={() => onRangeUpDown(-1)}
                                    className={classes.rightLefButton}>
                            <ArrowLeft />
                        </IconButton>
                    </Grid>
                    <Grid item xs={8}>
                        <Slider value={range}
                                onChange={onChange}
                                valueLabelDisplay="off"
                                min={0}
                                max={maxRange - 1}
                                track={false}
                                step={1}/>
                    </Grid>
                    <Grid item xs={2}>
                        <IconButton disabled={range === maxRange - 1}
                                    onClick={() => onRangeUpDown(1)}
                                    className={classes.rightLefButton}>
                            <ArrowRight fontSize="inherit" />
                        </IconButton>
                    </Grid>
                </Grid>
            )}


        </div>
    )
}

export default ExpenseRevenueChart