import FileSaver from "file-saver"

import { resetAccountingState, restoreAccountingState } from "../app/AccountingSlice"
import { resetFilterState, restoreFilterState } from "../app/FilterSlice"
import { RootState } from "../app/store"
import { Dispatch } from "react"
import { APP } from "../config"
import { encryptObject } from "./crypto"

const STORAGE_KEY = APP.KEY

export function saveStateToFile(state: RootState, filename: string, password: string = ""): boolean {

    try {
        const saveState = password
            ? encryptObject(state, password)
            : state
        const json = JSON.stringify(saveState)
        const blob = new Blob([json], {type: "application/json"});
        FileSaver.saveAs(blob, filename);
        return true
    }
    catch {
        return false
    }
}

export function saveStateToStorage(state: RootState, storage: Storage): void {
    const json = JSON.stringify(state)
    storage.setItem(STORAGE_KEY, json)
}

export function restoreStateFromStorage(storage: Storage, dispatch: Dispatch<any>): void {
    const json = storage.getItem(STORAGE_KEY)
    if (json !== null) {
        restoreStateFromJSON(json, dispatch)
    }
}

export function restoreStateFromJSON(json: string, dispatch: Dispatch<any>): void {
    try {
        const state: RootState = JSON.parse(json)
        restoreState(state, dispatch)
    }
    catch {}
}

export function restoreState(state: RootState, dispatch: Dispatch<any>) {
    dispatch(restoreAccountingState({state: state.accounting}))
    dispatch(restoreFilterState({state: state.filter}))
}

export function resetState(dispatch: Dispatch<any>) {
    dispatch(resetAccountingState())
    dispatch(resetFilterState())
}
