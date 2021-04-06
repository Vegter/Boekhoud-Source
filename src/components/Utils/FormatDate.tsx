import React from 'react'
import { DateString } from "../../types/DateString"
import { makeStyles } from "@material-ui/core"
import { createStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(() =>
    createStyles({
        date: {
            whiteSpace: "nowrap"
        },
    }));

interface FormatDateProps {
    date: DateString
}

function FormatDate(props: FormatDateProps) {
    const { date } = props
    const classes = useStyles()

    return (
        <span className={classes.date}>{date.format()}</span>
    )
}

export default FormatDate