import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import { addStatements } from '../app/AccountingSlice'
import { BankImportStatement } from "../types/BankImport/BankImportStatement"
import { Routes } from "../routes/routes"
import PageHeader from "./PageHeader"
import { resetState, restoreStateFromJSON } from "../services/stateIO"
import { useHistory, useLocation } from "react-router-dom"
import { LedgerScheme } from "../types/Ledger/LedgerScheme"
import { Accounting } from "../types/Accounting"
import { BankImports } from "../components/Loader/BankImports"
import { BizcuitImport } from "../components/Loader/BizcuitImport"
import { VersionImports } from "../components/Loader/VersionImports"
import {
    isProgressError,
    LoadingProgress,
    PASSWORD_ERROR,
    UPLOAD_CANCELLED,
    UPLOAD_ERROR_MSG
} from "../components/Loader/UploadLoadingProgress"
import ImportDialog from "../components/Loader/ImportDialog"
import { decryptJSON, isJSONEncrypted } from "../services/crypto"
import { resetAge } from "../app/AgeSlice"

function UploadPage() {
    const search = useLocation().search

    const [ progress, setProgress ] = useState("")
    const [ loading, setLoading ] = useState<boolean>(false)
    const [ entriesRead, setEntriesRead ] = useState(0)
    const [ JSONResult, setJSONResult ] = useState("")
    const [ showBizcuit, setShowBizcuit ] = useState(Boolean(new URLSearchParams(search).get('bizcuit')))

    const dispatch = useDispatch()
    const history = useHistory();

    function onLoad (statements: BankImportStatement[]) {
        setLoading(true)
        setProgress(`Bank transacties worden ingelezen...`)

        let accounting = new Accounting()
        let nStatements = -accounting.liquidAssets.getAccountStatementMap().size
        let nEntries = -accounting.liquidAssets.getStatementEntryMap().size

        if (statements.length) {
            setTimeout(() => {
                // Monitor the number of statements and entries read
                try {
                    dispatch(addStatements({statementsData: statements.map(statement => statement.data)}))

                    accounting = new Accounting()
                    nStatements += accounting.liquidAssets.getAccountStatementMap().size
                    nEntries += accounting.liquidAssets.getStatementEntryMap().size

                    setEntriesRead(nEntries)
                    setProgress(`${nEntries} nieuwe transacties en ${nStatements} nieuwe statements en  zijn ingelezen`)
                } catch (e) {
                    console.error(e)
                    setProgress(UPLOAD_ERROR_MSG)
                } finally {
                    setLoading(false)
                }
            }, 0)
        } else {
            setProgress(UPLOAD_ERROR_MSG)
            setLoading(false)
        }
    }

    function onRead (result: any) {
        resetState(dispatch)
        setLoading(true)
        setProgress(`Versie wordt ingelezen...`)

        if (result && typeof(result) === typeof("")) {
            if (isJSONEncrypted(result)) {
                setJSONResult(result)
            } else {
                setTimeout(() => {
                    try {
                        JSON.parse(result)
                        restoreStateFromJSON(result, dispatch)
                        dispatch(resetAge())
                        setProgress(`Bewaarde versie is ingelezen`)
                    } catch (e) {
                        console.error(e)
                        setProgress(UPLOAD_ERROR_MSG)
                    } finally {
                        setLoading(false)
                    }
                }, 0)
            }
        } else {
            setProgress(UPLOAD_ERROR_MSG)
            setLoading(false)
        }
    }

    function onCloseImportDialog(password: string | null) {
        setJSONResult("")

        if (password) {
            try {
                const json = decryptJSON(JSONResult, password)
                return onRead(json)
            } catch {}
            setProgress(PASSWORD_ERROR)
        } else {
            setProgress(UPLOAD_CANCELLED)
        }
        setLoading(false)
    }

    function onClose() {
        const success = !isProgressError(progress)
        setProgress("")
        if (success) {
            // If new entries have been read then filter on unmapped entries
            history.push({
                pathname: Routes.Map.path,
                search: entriesRead ? `?ledgerAccountCode=${LedgerScheme.unmapped.code}` : ""
            })
        }
    }

    const toggleBizcuit = () => {
        setShowBizcuit(!showBizcuit)
    }

    const bizcuitImport = showBizcuit ? <BizcuitImport onLoad={onLoad}/> : null

    return (
        <div>
            <div onClick={toggleBizcuit}>
                <PageHeader title={Routes.Upload} periodFilter={false} withName={false}/>
            </div>
            {JSONResult && <ImportDialog open={true} onClose={onCloseImportDialog}/>}
            {progress &&
                <LoadingProgress progress={progress} loading={loading} entriesRead={entriesRead} onClose={onClose}/>}
            {!progress &&
                <>
                    <BankImports onLoad={onLoad}/>
                    {bizcuitImport}
                    <VersionImports onLoad={onRead}/>
                </>}
        </div>
    );
}

export default UploadPage;
