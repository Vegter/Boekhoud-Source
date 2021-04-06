import React, { useState } from 'react'
import { LedgerScheme } from "../../types/Ledger/LedgerScheme"
import { CircularProgress, makeStyles } from "@material-ui/core"

const useStyles = makeStyles({
    progress: {
        marginTop: 50
    },
});

interface OwnProps {
    children: React.ReactNode
}

interface State {
    initialized: null | "Loading" | "Loaded" | "Failed"
    errorMsg: string
}

function AppLoader(props: OwnProps) {
    const [ state, setState ] = useState<State>({
        initialized: null,
        errorMsg: ""
    })
    const styles = useStyles()

    React.useEffect(() => {
        async function initialize() {
            setState({ ...state, initialized: "Loading"} )
            await LedgerScheme.load()
            if (LedgerScheme.allocatableAccounts.length > 0) {
                setState({ ...state, initialized: "Loaded"} )
            }
        }

        if (state.initialized === null) {
            initialize().catch(reason => {
                setState({ initialized: "Failed", errorMsg: reason } )
            })
        }
    }, [state])

    if (state.initialized === "Failed") {
        throw Error(`Grootboekschema kan niet geladen worden: ${state.errorMsg}`)
    } else if (state.initialized === "Loaded") {
        return (
            <div>
                {props.children}
            </div>
        )
    } else {
        return <CircularProgress  className={styles.progress} />
    }
}

export default AppLoader;
