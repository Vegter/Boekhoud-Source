import React from 'react'
import { IBAN } from "../../types/IBAN"
import { makeStyles, useMediaQuery } from "@material-ui/core"
import { createStyles, useTheme } from "@material-ui/core/styles"

const useStyles = makeStyles(() =>
    createStyles({
        iban: {
            whiteSpace: "nowrap",
        },
    }));

interface FormatIBANProps {
    iban: IBAN
}

function FormatIBAN(props: FormatIBANProps) {
    const {iban} = props
    const classes = useStyles()
    const theme = useTheme();
    const onSmDown = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <span className={classes.iban}>
            {iban.format({short: onSmDown})}
        </span>
    )
}

export default FormatIBAN;
