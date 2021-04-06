import React from 'react';
import { useHistory, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"

import { createStyles, makeStyles, useTheme, Theme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import clsx from 'clsx';

import { drawerWidth, toolbarStyle } from "./style"

import { Routes, RouteItem } from "../../routes/routes"
import { selectJournal } from "../../app/AccountingSlice"

import RouteIcon from "../../routes/RouteIcon"
import { ArrowBack, ArrowForward } from "@material-ui/icons"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
        },
        drawerOpen: {
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        drawerClose: {
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            width: theme.spacing(7) + 1,
            [theme.breakpoints.down('sm')]: {
                width: 0,
            },
        },
        toolbar: toolbarStyle(theme),
        activeRoute: {
            color: theme.palette.secondary.dark,
        }
    }),
);

interface MenuDrawerProps {
    open: boolean
    setOpen: (isOpen: boolean) => void
}

export default function MenuDrawer(props: MenuDrawerProps) {
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();
    const location = useLocation()
    const journal = useSelector(selectJournal)

    const { open } = props

    const setClose = () => {
        props.setOpen(false);
    };

    const onRouteItem = (routeItem: RouteItem) => {
        props.setOpen(false);
        history.push(routeItem.path)
    }

    function RouteListItem(props: {routeItem: RouteItem, disabled?: boolean}) {
        const { routeItem, disabled = false } = props
        const className= routeItem.path === location.pathname ? classes.activeRoute : ""
        return (
            <ListItem button key={routeItem.id} disabled={disabled} title={routeItem.text} role={"button"}
                  onClick={() => onRouteItem(routeItem)} aria-label={`navigeer naar ${routeItem.text}`}>
                <ListItemIcon className={className}><RouteIcon id={routeItem.id}/></ListItemIcon>
                <ListItemText className={className} primary={routeItem.text} />
            </ListItem>
        )
    }

    function GoBackForward(props: {back: boolean}) {
        const { back } = props
        return (
            <ListItem button title={`ga naar ${back ? "vorige" : "volgende"} pagina`} role={"button"}
                      onClick={() => back ? history.goBack() : history.goForward()}>
                <ListItemIcon>
                    {back && <ArrowBack/>}
                    {!back && <ArrowForward/>}
                </ListItemIcon>
                <ListItemText primary={back ? "Vorige" : "Volgende" } />
            </ListItem>
        )

    }

    const hasData = journal.hasData()

    const routeItems: (RouteItem | string)[] = [
        Routes.Home,
        Routes.Upload,
        "divider",
        Routes.Map,
        Routes.TrialBalance,
        Routes.Journal,
        Routes.VAT,
        "divider",
        Routes.Charts,
        Routes.Bank,
        "divider",
        Routes.Ledger,
    ]

    const protectedItemIds = [
        Routes.Bank,
        Routes.Map,
        Routes.TrialBalance,
        Routes.Journal,
        Routes.VAT,
        Routes.Charts
    ].map(routeItem => routeItem.id)

    return (
        <Drawer
            role={"navigation"}
            variant="permanent"
            className={clsx(classes.drawer, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
            })}
            classes={{
                paper: clsx({
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                }),
            }}
        >
            <div className={classes.toolbar}>
                <IconButton onClick={setClose} aria-label={"vergroot of verklein het menu"}>
                    {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </div>
            <Divider />
            <div aria-label="hoofd menu">
                <GoBackForward back={true}/>
                <GoBackForward back={false}/>
                <Divider/>
                {routeItems.map((item, i) => {
                    if (typeof (item) === "string" && item === "divider") {
                        return <Divider key={i}/>
                    } else {
                        const routeItem = item as RouteItem
                        const enabled = protectedItemIds.includes(routeItem.id) ? hasData : true
                        return <RouteListItem key={i} routeItem={routeItem} disabled={! enabled} />
                    }
                })}
            </div>
        </Drawer>
    );
}
