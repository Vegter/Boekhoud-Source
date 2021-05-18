import React from 'react';

import * as mt940 from "mt940-js";
import { Statement as MT940Statement } from "mt940-js";

import { MT940ImportStatement } from "../../types/BankImport/MT940ImportStatement";
import { BankImportStatement } from "../../types/BankImport/BankImportStatement";

import FileLoader from "./FileLoader";

interface MT940LoaderProps {
    onLoad: (statements: BankImportStatement[]) => void
}

function MT940Loader(props: MT940LoaderProps) {
    const statements: BankImportStatement[] = []

    function onLoad (result: any) {
        if (result) {
            mt940.read(result).then((mt940Statements) => {
                mt940Statements.forEach((mt940Statement: MT940Statement) => {
                    statements.push(new MT940ImportStatement(mt940Statement))
                })
                props.onLoad(statements)
            });
        } else {
            props.onLoad([])
        }
    }

    return (
        <FileLoader onLoad={onLoad}
                    readAsArrayBuffer={true}
                    title={"Importeer MT940 bestand"}
                    accept={".swi"}/>
    );
}

export default MT940Loader