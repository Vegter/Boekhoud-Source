import React, { useState } from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface ImportDialogProps {
    open: boolean
    onClose: (password: string | null) => void
}

export default function ImportDialog(props: ImportDialogProps) {

    const [password, setPassword] = useState("")

    const { open } = props

    const onPassword = (event: any) => setPassword(event.target.value)

    const onClose = (password: string | null) => {
        setPassword("")
        props.onClose(password)
    }

    const handleClose = () => onClose(password)

    const handleCancel = () => onClose(null)

    return (
        <div>
            <Dialog fullWidth={false}
                    open={open}
                    maxWidth={false}
                    onClose={handleClose}
                    aria-labelledby="import-dialog-title">
                <DialogTitle id="import-dialog-title">Wachtwoord</DialogTitle>
                <DialogContent dividers>
                    <DialogContentText>
                        Uw administratie is versleuteld opgeslagen
                        <br/>
                        U dient het wachtwoord (of wachtzin) in te geven waarmee het bestand is versleuteld
                    </DialogContentText>
                    <form noValidate autoComplete="off" onSubmit={handleClose}>
                    <TextField
                        value={password}
                        onChange={onPassword}
                        autoFocus
                        margin="dense"
                        id="password"
                        inputProps={{autoComplete: "on"}}
                        label="Wachtwoord of wachtzin"
                        type="password"
                        fullWidth
                    />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleClose} color="primary" disabled={!password}>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
