import FileLoader from "./FileLoader"
import React from "react"

export function VersionImports(props: { onLoad: (result: any) => void }) {
    return <>
        <h3>Bestand</h3>
        <p>
            Via onderstaande button kan een import worden gestart van een eerder bewaarde versie
        </p>
        <p>
            <FileLoader onLoad={props.onLoad}
                        title={"Importeer versie"}
                        accept={".json"}/>
        </p>
    </>
}