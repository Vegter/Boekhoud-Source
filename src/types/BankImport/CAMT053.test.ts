import { parseString } from "xml2js"
import { BkToCstmrStmt, CAMT053 } from "./CAMT053"
import { CAMT053ImportStatement } from "./CAMT053ImportStatement"
import { CAMT053Contents } from "../mocks/CAMT053.xml"
import { BankImportStatement } from "./BankImportStatement"

test("CAMT053", () => {
    const xml = CAMT053Contents

    const statements: BankImportStatement[] = []
    parseString(xml, {explicitArray: false}, (err: Error, result: any) => {
        const camt053 = new CAMT053(result)
        for (let camt053Statement of camt053.statements) {
            const bkToCstmrStmt = new BkToCstmrStmt(camt053Statement)
            statements.push(new CAMT053ImportStatement(bkToCstmrStmt))
        }
    })

    expect(statements.length).toEqual(7)
    expect(statements.map(s => s.statementEntryCount)).toEqual([0, 0, 0, 0, 1, 1, 1])
})