import React, { useEffect, useState } from "react"

import { parseString } from "xml2js"

import { Button, CircularProgress, Grid, TextField } from "@material-ui/core"
import { Check, Dialpad, Error } from "@material-ui/icons"

import { BIZCUIT_LINK_API } from "../../config"
import logo from "./BizcuitLogo.png"

import { BankImportStatement } from "../../types/BankImport/BankImportStatement"
import { BkToCstmrStmt, CAMT053 } from "../../types/BankImport/CAMT053"
import { CAMT053ImportStatement } from "../../types/BankImport/CAMT053ImportStatement"

export function BizcuitImport(props: { onLoad: (statements: BankImportStatement[]) => void }) {
    const [requestId, setRequestId] = useState("")
    const [pincode, setPincode] = useState("")
    const [success, setSuccess] = useState<boolean | undefined>(undefined)
    const [loading, setLoading] = useState(false)

    const title = "Importeer vanuit Bizcuit"

    const onClick = async() => {
        try {
            setPincode("")
            setSuccess(undefined)
            const response = await fetch(BIZCUIT_LINK_API + "/bizcuit_auth")
            const data = await response.json() as {url: string, requestId: string}
            window.open(data.url, "_blank")
            setRequestId(data.requestId)
        } catch (err) {
            console.log(err)
        }
    }

    const onPincode = (event: any) => {
        const value = event.target.value || ""
        setPincode(value)
    }

    useEffect(() => {
        const getTransactions = async() => {
            setLoading(true)
            try {
                const parameters = `?requestId=${requestId}&pincode=${pincode}`
                const response = await fetch(BIZCUIT_LINK_API + "/bizcuit_transactions" + parameters)
                const data = await response.json()
                const items = data as {camt: string}[]
                setSuccess(true)

                const statements: BankImportStatement[] = []
                items.forEach(item => {
                    const xml = item.camt
                    parseString(xml, {explicitArray: false}, (err: Error, result: any) => {
                        if (!err) {
                            const camt053 = new CAMT053(result)
                            for (let camt053Statement of camt053.statements) {
                                const bkToCstmrStmt = new BkToCstmrStmt(camt053Statement)
                                statements.push(new CAMT053ImportStatement(bkToCstmrStmt))
                            }
                        }
                    })
                })
                props.onLoad(statements)
            } catch (err) {
                setSuccess(false)
                props.onLoad([])
            }
            setLoading(false)
        }

        if (requestId && pincode.length === 6) {
            getTransactions()
            setRequestId("")
        }
    }, [props, pincode, requestId])

    return <>
        <h3>
            <Grid container direction={"row"} justify={"center"} alignItems={"center"} spacing={1}>
                <Grid item><img src={logo} alt={"Bizcuit logo"} width={20}/></Grid>
                <Grid item>Bizcuit</Grid>
            </Grid>
        </h3>
        <p>
            Via onderstaande button kan een import worden gestart vanuit Bizcuit
        </p>
        <p>
            <Button variant={"contained"}
                    style={{width: 290}}
                    aria-label={title}
                    onClick={onClick}
                    color={"primary"}>
                {title}
            </Button>
        </p>
        <p>
            De import wordt geautoriseerd bij Bizcuit<br/>
            Daarna onvangt u per email een pincode waarmee u de import onderstaand kunt bevestigen
        </p>
        <Grid container direction={"row"} justify={"center"} alignItems={"center"} spacing={1}>
            <Grid item><form><TextField style={{width: 100}}
                       variant="outlined"
                       autoComplete="off"
                       inputProps={{style: { textAlign: 'center' }}}
                       disabled={!requestId}
                       label="Pincode"
                       type={"password"}
                       onChange={onPincode}
                       value={pincode}/></form> </Grid>

            {loading && <Grid item><CircularProgress size={24}/></Grid>}
            {!loading && <Grid item>{success === true ? <Check/> : success === false ? <Error/> : <Dialpad/>}</Grid>}
        </Grid>
    </>
}