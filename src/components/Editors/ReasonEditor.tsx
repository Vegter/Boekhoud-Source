import React from 'react';
import { useDispatch } from "react-redux"

import { Box, TextField } from "@material-ui/core"

import { setReason } from '../../app/AccountingSlice'

import { useResponsiveStyling } from "./useResponsiveStyling"
import { LedgerAllocation } from "../../types/Allocation/LedgerAllocation"

interface ReasonEditorProps {
    allocation: LedgerAllocation
}

function ReasonEditor(props: ReasonEditorProps & any) {

    const { allocation, ...textFieldProps } = props
    const [reason, updateReason] = React.useState(allocation.reason);
    const dispatch = useDispatch();
    const { variant, inputProps } = useResponsiveStyling()

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateReason(e.target.value)
    }

    const saveValue = () => {
        dispatch(setReason({allocationData: allocation.data, reason}))
    }

    return (
        <>

        <Box display="none" displayPrint="block">
            {/* Print Only */}
            {reason}
        </Box>

        <Box display="block" displayPrint="none">
            {/* Screen Only */}
            <TextField value={reason}
                       aria-label={"pas de omschrijving aan"}
                       title={reason}
                       variant={variant}
                       InputProps={{...inputProps, classes: {root: "input-root"}}}
                       inputProps={{
                           "aria-label": "Beschrijving van de boeking"
                       }}
                       {...textFieldProps}
                       margin={"none"}
                       size={"small"}
                       onChange={onChange}
                       onBlur={saveValue}
                       fullWidth={true}>
            </TextField>
        </Box>
        </>
    );
}

function areEqual(prevProps: ReasonEditorProps & any, nextProps: ReasonEditorProps & any) {
    return prevProps.allocation.reason === nextProps.allocation.reason
}

export default React.memo(ReasonEditor, areEqual)