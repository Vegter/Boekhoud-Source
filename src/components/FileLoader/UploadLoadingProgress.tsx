import React, { useRef } from "react"
import { Backdrop, CircularProgress, IconButton } from "@material-ui/core"
import { CSSSpinner } from "../Indicators/CSSSpinner"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import { ErrorOutline } from "@material-ui/icons"

export const UPLOAD_ERROR_MSG = "Upload mislukt"
export const PASSWORD_ERROR = "Onjuist wachtwoord"
export const UPLOAD_CANCELLED = "Upload afgebroken"

export function isProgressError(progress: string) {
    return [UPLOAD_ERROR_MSG, PASSWORD_ERROR, UPLOAD_CANCELLED].includes(progress)
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
        },
    }),
);

export function LoadingProgress(props: { progress: string, loading: boolean, entriesRead: number, onClose: () => void }) {
    const classes = useStyles()
    const okButton = useRef<any>(React.createRef())

    const {progress, loading, entriesRead, onClose} = props

    const anyErrors = isProgressError(progress)

    if (!loading) {
        // Auto close
        setTimeout(() => okButton.current?.click(), 1500)
    }

    return <div>
        <Backdrop className={classes.backdrop} open={loading}/>
        <h3>Import Voortgang</h3>
        <p>
            {progress}
        </p>

        {/*While Loading*/}
        {loading &&
        <CSSSpinner/>}

        {/*When loading has finished*/}
        {!loading &&
        <div>

            {/*No errors*/}
            {!anyErrors &&
            <div>
                <p>
                    U wordt in enkele ogenblikken automatisch omgeleid naar de boekingspagina
                </p>
                {entriesRead > 0 &&
                <div>
                    Hier kunt u de {entriesRead} nieuwe transacties toewijzen aan grootboekrekeningen
                </div>}
            </div>}

            <div>
                <IconButton ref={okButton} onClick={onClose} component="label">
                    {anyErrors  && <ErrorOutline/>}
                    {!anyErrors && <CircularProgress size={25}/>}
                </IconButton>
            </div>
        </div>}
    </div>
}