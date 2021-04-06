import React from 'react';

import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles'
import {
    Button,
    Dialog,
    Grid,
    Typography,
    useMediaQuery
} from "@material-ui/core"

import AllocationsView, { AllocationSelector } from "./AllocationsView"

import { LedgerAllocation } from "../../types/Allocation/LedgerAllocation"

import { LedgerAccount } from "../../types/Ledger/LedgerAccount"
import { DialogActions, DialogContent, DialogTitle } from "../Utils/CustomDialog"

const useStyles = makeStyles(() =>
    createStyles({
        title: {
            textAlign: "center",
        },
        buttons: {
            marginTop: 10,
            marginBottom: 10
        },
        close: {
            color: "white",
            marginRight: -20
        }
    }),
);

export interface Similar {
    allocation: LedgerAllocation
    allocations: LedgerAllocation[]
    account: LedgerAccount
}

interface Props {
    similar: Similar
    onSimilar: (allocations: LedgerAllocation[]) => void
}

export default function SimilarAllocations(props: Props) {
    const classes = useStyles();
    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'));

    const { similar, onSimilar } = props

    const { allocations , account } = similar

    const [ checked, setChecked ] = React.useState<AllocationSelector>(
        allocations.reduce((result, allocation) => {
            result[allocation.id] = true
            return result
        }, {} as AllocationSelector))

    const handleClose = () => {
        onSimilar([])
    };

    const handleOK = () => {
        onSimilar(allocations.filter(allocation => checked[allocation.id]))
    }

    const onChecked = (checked: AllocationSelector) => {
        setChecked({...checked})
    }

    const OKCancel = () => (
        <Grid container spacing={2} justify={"center"}  className={classes.buttons}>
            <Grid item><Button size={"small"} variant={"contained"} onClick={handleOK}>OK</Button></Grid>
            <Grid item><Button size={"small"} variant={"contained"} onClick={handleClose}>Cancel</Button></Grid>
        </Grid>
    )

    const body = (
        <div>
            <div>
                <div>
                    <Typography variant="h6" color="textPrimary" className={classes.title}>
                        {account.shortDescription}
                    </Typography>
                </div>
                <div>
                    <AllocationsView allocations={allocations}
                                     checked={checked}
                                     onChecked={onChecked} />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog fullWidth={false}
                fullScreen={onXs}
                maxWidth={false}
                onClose={handleClose}
                aria-labelledby="vergelijkbare-boekingen"
                open={true}>
            <DialogTitle id="vergelijkbare-boekingen" onClose={handleClose}>
                Gelijksoortige boekingen
            </DialogTitle>
            <DialogContent dividers>
                {body}
            </DialogContent>
            <DialogActions>
                <OKCancel/>
            </DialogActions>
        </Dialog>
    );
}
