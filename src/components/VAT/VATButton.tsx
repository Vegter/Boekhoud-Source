import React from 'react'
import { Grid, IconButton, makeStyles, useMediaQuery } from "@material-ui/core"
import { PostAdd } from "@material-ui/icons"
import { VATLine } from "../../types/VAT/VATLine"
import { createStyles, Theme, useTheme } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        percentage: {
            fontSize: "80%"
        },
        hasVAT: {
            color: theme.palette.primary.dark
        }
    }));

interface VATButtonProps {
    lines: VATLine[]
    onClick: (event: React.MouseEvent<HTMLElement>) => void
}

function VATButton(props: VATButtonProps) {
    const { lines, onClick } = props
    const classes = useStyles()

    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'))

    const hasVAT = lines.length > 0

    const icon = hasVAT
        ? <span className={classes.percentage}>
            {lines.length === 1 ? lines[0].vatRate?.percentageString : "x%"}
          </span>
        : <PostAdd/>

    if (onXs) {
        return <Button variant={"outlined"}
                       fullWidth={true}
                       aria-label={"BTW specificatie"}
                       onClick={onClick}
                       className={hasVAT ? classes.hasVAT : ""}
        >
            <Grid container direction={"row"} justify={"center"} alignItems={"center"} spacing={1}>
                <Grid item>BTW</Grid>
                <Grid item>{icon}</Grid>
            </Grid>

        </Button>
    } else {
        return <IconButton size={"small"}
                           aria-label={"BTW specificatie"}
                           onClick={onClick}
                           className={hasVAT ? classes.hasVAT : ""}
        >
            {icon}
        </IconButton>
    }
}

export default VATButton;
