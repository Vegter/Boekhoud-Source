import React from 'react';

import { parseString } from 'xml2js'

import { BkToCstmrStmt, CAMT053 } from "../../types/BankImport/CAMT053"
import { CAMT053ImportStatement } from "../../types/BankImport/CAMT053ImportStatement";
import { BankImportStatement } from "../../types/BankImport/BankImportStatement";

import FileLoader from "./FileLoader";

interface CAMT053LoaderProps {
    onLoad: (statements: BankImportStatement[]) => void
}

function CAMT053Loader(props: CAMT053LoaderProps) {
    const statements: BankImportStatement[] = []

    function onLoad (result: any) {
        if (result) {
            const xml = result as string
            parseString(xml, {explicitArray: false}, (err: Error, result: any) => {
                if (!err) {
                    const camt053 = new CAMT053(result)
                    for (let camt053Statement of camt053.statements) {
                        const bkToCstmrStmt = new BkToCstmrStmt(camt053Statement)
                        statements.push(new CAMT053ImportStatement(bkToCstmrStmt))
                    }
                }
            })
            props.onLoad(statements)
        }
    }

    return (
        <FileLoader onLoad={onLoad}
                    title={"Importeer CAMT.053 bestand"}
                    accept={".xml"}/>

    );
}

export default CAMT053Loader