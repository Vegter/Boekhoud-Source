const _array = (item: any) => {
    if (!item) {
        return []
    } else if (item instanceof Array) {
        return item
    } else {
        return [item]
    }
}

type TTxDtl = BkToCstmrStmt["Ntry"][0]["NtryDtls"][0]["TxDtls"][0]

interface StmtBal {
    Amt: number
    Ccy: string
    CdtDbtInd: string
    Dt: string,
    Tp: {
        CdOrPrtry: {
            Cd: string
            Prtry: string
        }
    }
}

interface StmtAcct {
    Id: {
        IBAN: string
        Othr: string
    }
    Ccy: string
}

class StmtNtry {
    NtryRef: string
    Amt: number
    Ccy: string
    CdtDbtInd: string
    BookgDt: string
    ValDt: string
    AddtlNtryInf: string
    NtryDtls: {
        TxDtls: {
            RltdPties: {
                Nm: string
            }[]
            RmtInf: {
                Ustrd: string
            }[]
        }[]
    }[]

    constructor(ntry: any) {
        this.NtryRef = ntry["NtryRef"]
        this.Amt = ntry["Amt"]["_"]
        this.Ccy = ntry["Amt"]["$"]["Ccy"]
        this.CdtDbtInd = ntry["CdtDbtInd"]
        this.BookgDt = ntry["BookgDt"]["Dt"]
        this.ValDt = ntry["ValDt"]["Dt"]
        this.AddtlNtryInf = ntry["AddtlNtryInf"]
        this.NtryDtls = _array(ntry["NtryDtls"]).map((ntryDtls:any) => ({
            TxDtls: _array(ntryDtls["TxDtls"]).map((txDtls:any) => ({
                RltdPties: _array(txDtls["RltdPties"]).map((rltdPties:any) => ({
                    Nm: (rltdPties["Cdtr"] || rltdPties["Dbtr"] || {})["Nm"]
                })),
                RmtInf: _array(txDtls["RmtInf"]).map((rmtInf: any) => ({
                    Ustrd: rmtInf["Ustrd"]
                }))
            }))
        }))
    }

    joinedTxDtls(func: (txDtl: TTxDtl) => string[]): string {
        let values: string[] = []
        this.NtryDtls.forEach(ntryDtl =>
            ntryDtl.TxDtls.forEach(txDtl => values = values.concat(func(txDtl))))
        return values.join(" ")
    }

    get Nm() : string {
        return this.joinedTxDtls((txDtl: TTxDtl) => txDtl.RltdPties.map(rltdPty => rltdPty.Nm)) || ""
    }

    get RmtInf() : string {
        return this.joinedTxDtls((txDtl: TTxDtl) => txDtl.RmtInf.map(inf => inf.Ustrd)) || this.AddtlNtryInf || ""
    }
}

export class BkToCstmrStmt {
    ElctrncSeqNb: string
    Acct: StmtAcct
    Bal: StmtBal[]
    Ntry: StmtNtry[]

    constructor(statement: any) {
        this.ElctrncSeqNb = statement["ElctrncSeqNb"]
        this.Acct = {
            Id: {
                IBAN: statement["Acct"]["Id"]["IBAN"],
                Othr: statement["Acct"]["Id"]["Othr"]
            },
            Ccy: statement["Acct"]["Ccy"]
        }
        this.Bal = (statement["Bal"] || []).map((bal: any) => ({
            Amt: bal["Amt"]["_"],
            Ccy: bal["Amt"]["$"]["Ccy"],
            CdtDbtInd: bal["CdtDbtInd"],
            Dt: bal["Dt"]["Dt"],
            Tp: {
                CdOrPrtry: {
                    Cd: bal["Tp"]["CdOrPrtry"]["Cd"],
                    Prtry: bal["Tp"]["CdOrPrtry"]["Prtry"]
                }
            }
        }))
        this.Ntry = _array(statement["Ntry"]).map((ntry: any) => new StmtNtry(ntry))
    }
}

export class CAMT053 {
    statements: BkToCstmrStmt[]

    constructor(jsonStatement: any) {
        this.statements = _array(jsonStatement["Document"]["BkToCstmrStmt"]["Stmt"])
    }
}
