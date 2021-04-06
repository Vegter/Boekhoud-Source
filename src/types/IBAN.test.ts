import { IBAN } from "./IBAN"

test("IBAN", () => {
    let iban = new IBAN("GB33BUKB20201555555555")
    expect(iban.format()).toEqual("GB33 BUKB 2020 1555 5555 55")
    expect(iban.format({short: true})).toEqual("55.55.55.555")

    iban = new IBAN("NL02ABNA0123456789")
    expect(iban.format()).toEqual("NL02 ABNA 0123 4567 89")
    expect(iban.format({short: true})).toEqual("12.34.56.789")

    iban = new IBAN("736160221")
    expect(iban.format()).toEqual("73.61.60.221")

    iban = new IBAN("anything")
    expect(iban.format()).toEqual("anything")
})

test("toString", () => {
    let iban = new IBAN("GB33BUKB20201555555555")
    expect(iban.toString()).toEqual(iban.format())
})
