import FileLoader from "./FileLoader"
import React from "react"
import { useSelector } from "react-redux"
import { selectAge } from "../../app/AgeSlice"
import { Alert, AlertTitle } from "@material-ui/lab"

export function VersionImports(props: { onLoad: (result: any) => void }) {
    const age = useSelector(selectAge)

    return <>
        <h3>Bestand</h3>
        <p>
            Via onderstaande button kan een import worden gestart van een eerder bewaarde versie
        </p>

        {age > 0 && <div style={{width: "50%", margin: "auto"}}>
            <Alert variant={"filled"} severity="warning" className={"text-left-align"}>
                <AlertTitle className={"text-left-align"}>
                    {`Let op, er zijn nog ${age} onbewaarde updates`}
                </AlertTitle>
                Als u deze updates niet verloren wilt laten gaan dient u ze te bewaren voordat u een nieuwe versie importeert
            </Alert>
        </div>}

        <p>
            <FileLoader onLoad={props.onLoad}
                        title={"Importeer versie"}
                        accept={".json"}/>
        </p>
    </>
}