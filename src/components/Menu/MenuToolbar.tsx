import React, { useEffect, useState } from 'react'

import { createStyles, makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import logo from "./logo-inversed.png"

import MenuDropdown from "./MenuDropdown"

const useStyles = makeStyles(() =>
    createStyles({
        menuButton: {
            marginRight: 36,
        },
        title: {
            flexGrow: 1,
        },
        hide: {
            display: 'none',
        },
        logo: {
            marginRight: 10,
            marginBottom: -1,
            width: 25,
            height: 25
        }

    }),
);

interface MenuToolbarProps {
    title: string
    open: boolean
    setOpen: (isOpen: boolean) => void
}

export default function MenuToolbar(props: MenuToolbarProps) {
    const [showMenus, setShowMenus] = useState(false)
    const classes = useStyles();

    const { title, open } = props

    const setOpen = () => {
        props.setOpen(true);
    };

    useEffect(() => {
        // First show toolbar and then menus (solves app-refresh issue on iOS)
        setTimeout(() => setShowMenus(true), 0)
    })

    return (
        <Toolbar>
            {showMenus && <IconButton
                color="inherit"
                aria-label="open of sluit menu"
                onClick={setOpen}
                edge="start"
                className={clsx(classes.menuButton, {
                    [classes.hide]: open,
                })}
            >
                <MenuIcon />
            </IconButton>}
            <Typography variant="h6" className={classes.title}>
                <img src={logo} className={classes.logo} alt={"Applicatie Logo"}/>
                {title}
            </Typography>
            {showMenus && <div>
                <MenuDropdown />
            </div>}
        </Toolbar>
    );
}
