import React, { useState } from 'react'
import { useDispatch, useSelector } from "react-redux"

import { selectState } from "../../app/store"

import { restoreStateFromStorage, saveStateToStorage } from "../../services/stateIO"

interface StateSyncProps {
    children: React.ReactNode,
}

function StateSync(props: StateSyncProps) {
    const [ initialized, setInitialized ] = useState(false)
    const state = useSelector(selectState)
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (initialized) {
            // Try to write state to sessionStorage
            saveStateToStorage(state, sessionStorage)
        } else {
            // Try to restore state from sessionStorage
            restoreStateFromStorage(sessionStorage, dispatch)
            setInitialized(true)
        }
    }, [state, initialized, dispatch])

    return (
        <React.Fragment>
            {initialized && props.children}
        </React.Fragment>
    )
}

export default StateSync