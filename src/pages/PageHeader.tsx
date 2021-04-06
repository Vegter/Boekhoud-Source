import React from 'react'

import { Grid, makeStyles } from "@material-ui/core"

import { RouteItem } from "../routes/routes"

import RouteIcon from "../routes/RouteIcon"
import PeriodFilter from "../components/Selectors/PeriodFilter"
import Hidden from "@material-ui/core/Hidden/Hidden"
import { createStyles } from "@material-ui/core/styles"
import { useSelector } from "react-redux"
import { selectMetaData } from "../app/AccountingSlice"

const useStyles = makeStyles(() =>
    createStyles({
        icon: {
            marginTop: 2
        },
        periodFilter: {
            marginLeft: 2,
        },
        name: {
            textAlign: "right",
            fontWeight: "bold"
        },
        header: {
            marginTop: -15
        },
    }))

interface PageHeaderProps {
    title: RouteItem | string
    periodFilter?: boolean
    withName?: boolean
}

function PageHeader(props: PageHeaderProps) {
    const name = useSelector(selectMetaData).name
    const {title, periodFilter = true, withName = true} = props
    const classes = useStyles()

    let headerTitle
    if (typeof title === 'string') {
        headerTitle = (
            <h2>{props.title}</h2>
        )
    } else {
        headerTitle = (
            <h2>
                <Grid container spacing={1} direction={"row"} justify={"center"} alignItems={"stretch"}>
                    <Grid item className={classes.icon}>
                        <RouteIcon id={title.id}/>
                    </Grid>
                    <Grid item>
                        {title.text}
                    </Grid>
                </Grid>
            </h2>
        )
    }

    return (
        <div>

            {/*Large header, hidden at or below small devices*/}
            <Hidden smDown>
                <Grid container spacing={0} alignItems={"flex-start"} className={classes.header}>
                    <Grid item xs={3}>
                        <div className={classes.periodFilter}>
                            {periodFilter && <PeriodFilter/>}
                        </div>
                    </Grid>
                    <Grid item xs={6}>
                        {headerTitle}
                    </Grid>
                    {withName && <Grid item xs={3}>
                        <div className={classes.name}>{name}</div>
                    </Grid>}
                </Grid>
            </Hidden>

            {/*Small header, hidden at or above small devices*/}
            <Hidden mdUp>
                <Grid container direction={"column"} spacing={0} alignItems={"center"} className={classes.header}>
                    <Grid item xs={12}>
                        {headerTitle}
                    </Grid>
                    {withName && <Grid item xs={12}>
                        <div className={classes.name}>{name}</div>
                    </Grid>}
                    <Grid item xs={12} className={classes.periodFilter}>
                        {periodFilter && <PeriodFilter/>}
                    </Grid>
                </Grid>
            </Hidden>
        </div>
    )
}

export default PageHeader
