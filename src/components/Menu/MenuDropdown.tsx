import React, { useState } from 'react'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { IconButton } from "@material-ui/core"
import MoreVertIcon from "@material-ui/icons/MoreVert"
import { resetState, saveStateToFile } from "../../services/stateIO"
import { Routes } from "../../routes/routes"
import SaveIcon from "@material-ui/icons/Save"
import DeleteIcon from "@material-ui/icons/Delete"
import { useDispatch } from "react-redux"
import { store } from "../../app/store"
import { useHistory } from "react-router-dom"
import { InfoOutlined, Print } from "@material-ui/icons"
import SaveDialog from "./SaveDialog"
import { setMetaData } from 'app/AccountingSlice';
import AboutDialog from "./AboutDialog"
import Divider from "@material-ui/core/Divider"
import { StyledMenu, StyledMenuItem } from "../Utils/StyledMenu"

const useStyles = makeStyles((theme) =>
    createStyles({
        menuButton: {
            color: theme.palette.common.white
        }
    }),
);

export default function MenuDropdown() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [saveDialog, setSaveDialog] = useState(false)
    const [aboutDialog, setAboutDialog] = useState(false)

    const classes = useStyles()
    const dispatch = useDispatch()
    const history = useHistory()

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    };

    const handleClose = () => {
        setAnchorEl(null)
    };

    const onSave = () => {
        handleClose()
        setSaveDialog(true)
    }

    const onCloseSave = (name: string | null, password: string) => {
        setSaveDialog(false)
        if (name) {
            dispatch(setMetaData({ name }))
            saveStateToFile(store.getState(), `${name}.json`, password)
        }
    }

    const onDelete = () => {
        handleClose()
        resetState(dispatch)
        history.push(Routes.Upload.path)
    }

    const onAbout = () => {
        handleClose()
        setAboutDialog(true)
    }

    const onCloseAbout = () => {
        setAboutDialog(false)
    }

    const onPrint = () => {
        handleClose()
        // Wait for menu to close and then print
        setTimeout(() => window.print(), 0)
    }

    return (
        <div>
            {saveDialog && <SaveDialog open={true} onClose={onCloseSave}/>}
            {aboutDialog && <AboutDialog open={true} onClose={onCloseAbout}/>}

            <IconButton
                aria-controls="shortcuts-menu"
                aria-haspopup="true"
                aria-label={"open een menu met shortcuts"}
                onClick={handleClick}
                className={classes.menuButton}
            >
                <MoreVertIcon />
            </IconButton>

            <StyledMenu
                id="shortcuts-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <StyledMenuItem onClick={onSave}>
                    <ListItemIcon>
                        <SaveIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Bewaar data..." />
                </StyledMenuItem>

                <StyledMenuItem onClick={onDelete}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Verwijder data" />
                </StyledMenuItem>

                <Divider/>

                <StyledMenuItem onClick={onPrint}>
                    <ListItemIcon>
                        <Print fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Print pagina" />
                </StyledMenuItem>

                <Divider/>

                <StyledMenuItem onClick={onAbout}>
                    <ListItemIcon>
                        <InfoOutlined fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={`Over deze app...`} />
                </StyledMenuItem>
            </StyledMenu>
        </div>
    );
}
