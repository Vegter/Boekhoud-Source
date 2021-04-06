import React, { useState } from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useSelector } from "react-redux"
import { selectMetaData } from "../../app/AccountingSlice"

interface SaveDialogProps {
    open: boolean
    onClose: (name: string | null, password: string) => void
}

export default function SaveDialog(props: SaveDialogProps) {
    const meta = useSelector(selectMetaData)

    const defaultName = meta.name

    const [name, setName] = useState(defaultName)
    const [password, setPassword] = useState("")
    const [rePassword, setRePassword] = useState("")

    const { open } = props

    const onChange = (event: any) => setName(event.target.value)

    const onPassword = (event: any) => setPassword(event.target.value)

    const onRePassword = (event: any) => setRePassword(event.target.value)

    const onClose = (name: string | null, password: string = "") => {
        setName("")
        setPassword("")
        setRePassword("")
        props.onClose(name, password)
    }

    const handleClose = () => onClose(name, password)

    const handleCancel = () => onClose(null)

    const saveEnabled = name && password && password === rePassword

    return (
        <div>
            <Dialog fullWidth={false}
                    open={open}
                    maxWidth={false}
                    onClose={handleClose}
                    aria-labelledby="save-dialog-title">
                <DialogTitle id="save-dialog-title">Bewaar Administratie</DialogTitle>
                <DialogContent dividers>
                    <DialogContentText>
                        Bewaar de huidige administratie in een bestand op uw computer
                        <br/>
                        U dient een wachtwoord (of beter: wachtzin) in te geven waarmee het bestand wordt versleuteld
                    </DialogContentText>
                    <form noValidate autoComplete="off">
                    <TextField
                        value={name}
                        onChange={onChange}
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Naam van de administratie"
                        type="text"
                        fullWidth
                    />
                    <TextField
                        value={password}
                        onChange={onPassword}
                        margin="dense"
                        id="password"
                        label="Wachtwoord of wachtzin"
                        type="password"
                        inputProps={{autoComplete: "on"}}
                        fullWidth
                    />
                    <TextField
                        value={rePassword}
                        onChange={onRePassword}
                        margin="dense"
                        id="repassword"
                        label="Herhaal wachtwoord of wachtzin"
                        type="password"
                        inputProps={{autoComplete: "on"}}
                        fullWidth
                    />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleClose} color="primary" disabled={!saveEnabled}>
                        Bewaar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
