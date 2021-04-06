import React from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { APP } from "../../config"
import { Grid, Link } from "@material-ui/core"

interface AboutDialogProps {
    open: boolean
    onClose: () => void
}

export default function AboutDialog(props: AboutDialogProps) {
    const { open } = props

    const onClose = () => {
        props.onClose()
    }

    const onUpdate = () => {
        window.location.reload()
    }

    return (
        <div>
            <Dialog fullWidth={false}
                    open={open}
                    maxWidth={false}
                    onClose={onClose}
                    aria-labelledby="about-dialog">
                <DialogTitle id="about-dialog">{APP.TITLE}</DialogTitle>
                <DialogContent dividers>
                        <Grid container direction={"column"} justify={"space-between"} alignItems={"center"} spacing={3}>
                            <Grid item>
                                <div className={"text-center"}>
                                Boekhoud Source is een Open Source Boekhoud Applicatie
                                </div>
                            </Grid>
                            <div>Versie: {APP.VERSION} {APP.STATE}</div>
                            <div>Build: {APP.BUILD}</div>
                            <Grid item>
                                <Link href={APP.SOURCE} target="_blank" rel="noopener">
                                    Github Repository
                                </Link>
                            </Grid>
                            <Grid item>
                                <Button size={"small"} onClick={() => onUpdate()}>Update</Button>
                            </Grid>
                        </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
