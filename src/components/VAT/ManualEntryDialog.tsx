import React, { useState } from 'react'
import { createStyles, makeStyles, useTheme } from "@material-ui/core/styles"
import { Dialog, useMediaQuery } from "@material-ui/core"
import { DialogActions, DialogContent, DialogTitle } from "../Utils/CustomDialog"
import Button from "@material-ui/core/Button"
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table"
import { VATRate } from "../../types/VAT/VATRate"
import VATAmount from "./VATAmount"
import { VATLine } from "../../types/VAT/VATLine"
import { VATSpecificationEntryData } from "../../model"

const useStyles = makeStyles(() =>
    createStyles({
        table: {
            maxWidth: 250,
            marginTop: 15,
            marginBottom: 15,
            margin: "auto"
        },
        amount: {
            textAlign: "right",
        },
    }),
);

interface ManualEntryDialogProps {
    category: string
    data: VATSpecificationEntryData
    vatRate: VATRate
    onClose: (data: VATSpecificationEntryData | null) => void
}

const zeroData = {
    bruto: "0",
    vat: "0",
    netto: "0"
}

function ManualEntryDialog(props: ManualEntryDialogProps) {
    const { category, data, vatRate } = props

    const [open, ] = React.useState(true);
    const [line, setLine] = useState({...data})

    const classes = useStyles();
    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'));

    const onNetto = (value: string) => {
        const brutoNetto = VATLine.brutoNetto({netto: value}, vatRate.percentage)
        setLine({...line, ...brutoNetto})
    }

    const onVAT = (value: string) => {
        const brutoNetto = VATLine.brutoNetto({vat: value}, vatRate.percentage)
        setLine({...line, ...brutoNetto})
    }

    const onBruto = (value: string) => {
        const brutoNetto = VATLine.brutoNetto({bruto: value}, vatRate.percentage)
        setLine({...line, ...brutoNetto})
    }

    const onBlur = () => {
    }

    const handleClose = () => {
        props.onClose(null)
    };

    const saveChanges = () => {
        props.onClose(line)
    }

    const clear = () => {
        const clearedLine = {...line, ...zeroData}
        setLine(clearedLine)
        props.onClose(clearedLine)
    }

    const showBrutoNetto = vatRate.percentage !== 0

    const canSave = ![line.netto, line.vat, line.bruto].some(v => isNaN(+v))

    return (
        <Dialog fullWidth={false} fullScreen={onXs} maxWidth={false}
                onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
            <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                {category}
            </DialogTitle>
            <DialogContent dividers>
                <h4>Bedrag invoer</h4>
                <div>U kunt voor deze post in onderstaande tabel handmatig een bedrag invoeren</div>
                <Table className={classes.table}>
                    <Thead>
                        <Tr>
                            <Th/>
                            <Th className={classes.amount}>Bedrag</Th>
                        </Tr>
                    </Thead>
                    <Tbody className={classes.amount}>
                        {showBrutoNetto && <Tr>
                            <Td>Excl. BTW</Td>
                            <Td>
                                <VATAmount value={line.netto} onChange={onNetto} onBlur={onBlur}/>
                            </Td>
                        </Tr>}
                        <Tr>
                            <Td>BTW</Td>
                            <Td>
                                <VATAmount value={line.vat} onChange={onVAT} onBlur={onBlur}/>
                            </Td>
                        </Tr>
                        {showBrutoNetto && <Tr>
                            <Td>Incl. BTW</Td>
                            <Td>
                                <VATAmount value={line.bruto} onChange={onBruto} onBlur={onBlur}/>
                            </Td>
                        </Tr>}
                    </Tbody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button onClick={clear} color="primary">
                    Clear
                </Button>
                <Button disabled={!canSave} onClick={saveChanges} color="primary">
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ManualEntryDialog;
