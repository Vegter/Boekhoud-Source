import React from 'react';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import clsx from 'clsx';

import { drawerWidth, toolbarStyle } from "./style"

import MenuToolbar from "./MenuToolbar"
import MenuDrawer from "./MenuDrawer"
import { APP } from "../../config"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        appBar: {
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        appBarShift: {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        toolbar: toolbarStyle(theme),
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            [theme.breakpoints.down('xs')]: {
                padding: theme.spacing(1),
            },
        },
    }),
);

interface MenuAppBarProps {
    title: string,
    children: React.ReactNode,
}

export default function MenuAppBar(props: MenuAppBarProps) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    return (
        <div className={classes.root}>
            <CssBaseline />
            <div className={"noprint"}>
                <AppBar
                    position="fixed"
                    className={clsx(classes.appBar, {
                        [classes.appBarShift]: open,
                    })}
                >
                    {/*Toolbar at the top of the screen*/}
                    <MenuToolbar title={APP.TITLE} open={open} setOpen={setOpen}/>
                </AppBar>
                {/*Menu at the left of the screen*/}
                <MenuDrawer open={open} setOpen={setOpen}/>
            </div>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                {props.children}
            </main>
        </div>
    );
}
