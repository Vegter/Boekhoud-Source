import { BankImportStatement } from "../../types/BankImport/BankImportStatement"
import MT940Loader from "./MT940Loader"
import CAMT053Loader from "./CAMT053Loader"
import React from "react"

export function BankImports(props: { onLoad: (statements: BankImportStatement[]) => void }) {
    return <>
        <h3>Bank</h3>
        <p>
            Via onderstaande buttons kan een import worden gestart van een MT940 of CAMT.053 bestand
        </p>
        <p>
            <MT940Loader onLoad={props.onLoad}/>
        </p>
        <p>
            <CAMT053Loader onLoad={props.onLoad}/>
        </p>
    </>
}