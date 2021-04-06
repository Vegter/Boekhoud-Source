import * as mt940 from "mt940-js";
import { Statement as MT940Statement } from "mt940-js"
import { MT940ImportStatement } from "./MT940ImportStatement"
import { MT940Contents } from "../mocks/MT940"
import { BankImportStatement } from "./BankImportStatement"

test("MT940", () => {
    let buf = Buffer.from(MT940Contents)

    const statements: BankImportStatement[] = []

    mt940.read(buf).then((mt940Statements) => {
        mt940Statements.forEach((mt940Statement: MT940Statement) => {
            statements.push(new MT940ImportStatement(mt940Statement))
        })
        expect(statements.length).toEqual(7)
        expect(statements.map(s => s.statementEntryCount)).toEqual([
            0, 1, 2, 1, 1, 0, 1
        ])
        expect(statements[4].data.statementEntriesData[0].remittanceInformation)
            .toEqual("Overboeking")
        expect(statements[6].data.statementEntriesData[0].remittanceInformation)
            .toEqual("/TRCD/501/BENM//")
    })

    expect(statements.length).toEqual(0)
    expect(statements.map(s => s.statementEntryCount)).toEqual([])
})