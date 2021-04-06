import { VATLine } from "./VATLine"
import { NO_VAT, VAT_0, VATRate } from "./VATRate"

test("VATLine", () => {
    let line = new VATLine()
    expect(line.bruto).toBe("")
    expect(line.vatRate).toBeNull()
    expect(line.hasVAT).toEqual(false)
    expect(line.data).toEqual({id: "", bruto: "", vat: "", netto: ""})
    expect(line.percentage).toEqual(0)

    line = new VATLine(null, 100)
    expect(line.data).toEqual({id: "", bruto: "100.00", vat: "0.00", netto: "100.00"})

    line = new VATLine(NO_VAT)
    expect(line.bruto).toBe("")
    expect(line.vatRate).toEqual(NO_VAT)
    expect(line.hasVAT).toEqual(false)
    expect(line.percentage).toEqual(0)

    line = new VATLine(NO_VAT, 42)
    expect(line.bruto).toBe("42.00")
    expect(line.vatRate).toEqual(NO_VAT)
    expect(line.hasVAT).toEqual(false)
    expect(line.percentage).toEqual(0)

    line = new VATLine(VAT_0, 42)
    expect(line.hasVAT).toEqual(true)

    let lines = VATLine.fromVATSpecificationData({
        date: "2019-01-01",
        lines: [{
            id: NO_VAT.id,
            bruto: "142.00",
            vat: "42.00",
            netto: "100.00"
        },
        {
            id: "any unkown id",
            bruto: "142",
            vat: "42",
            netto: "100"
        }]
    })
    expect(lines.length).toEqual(1)

    line = lines[0].reversed
    expect(line.bruto).toBe("-142.00")
    expect(line.vat).toBe("-42.00")
    expect(line.netto).toBe("-100.00")
    expect(line.data).toEqual({id: "", bruto: "-142.00", vat: "-42.00", netto: "-100.00"})

    line = line.reversed
    expect(line.bruto).toBe("142.00")
    expect(line.vat).toBe("42.00")
    expect(line.netto).toBe("100.00")

    line = VATLine.reverseLines([line])[0]
    expect(line.bruto).toBe("-142.00")
    expect(line.vat).toBe("-42.00")
    expect(line.netto).toBe("-100.00")

    line = new VATLine().reversed
    expect(line.bruto).toBe("")
    expect(line.vat).toBe("")
    expect(line.netto).toBe("")

    line.touch()
    expect(line.touched > 0).toEqual(true)
    line.untouch(42)
    expect(line.touched).toEqual(42)
})

test("BrutoNetto", () => {
    expect(VATLine.brutoNetto({bruto: ""}, 0)).toEqual({
        netto: "",
        vat: "",
        bruto: ""
    })

    expect(VATLine.brutoNetto({vat: "10"}, 0)).toEqual({
        netto: "0.00",
        vat: "10",
        bruto: "10.00"
    })

    const rate = new VATRate("any rate", 0.10)
    let line = new VATLine(rate, 110)
    expect(line.data).toEqual({id: "any rate", bruto: "110.00", vat: "10.00", netto: "100.00"})

    line = new VATLine()
    let touched = line.touched
    line.setVATRate(rate, 110)
    expect(line.data).toEqual({id: "any rate", bruto: "110.00", vat: "10.00", netto: "100.00"})
    expect(line.touched > touched).toEqual(true)

    touched = line.touched
    line.setVATRate(rate, 110)
    expect(line.touched).toEqual(touched)

    line.setVATRate(null, 110)
    expect(line.data).toEqual({id: "", bruto: "110.00", vat: "10.00", netto: "100.00"})

    line.setVATRate(rate, 110)

    line.setBruto(220)
    expect(line.data).toEqual({id: "any rate", bruto: "220.00", vat: "20.00", netto: "200.00"})

    touched = line.touched
    line.setBruto(220)
    expect(line.touched).toEqual(touched)

    line.setBruto("-")
    expect(line.data).toEqual({id: "any rate", bruto: "-", vat: "", netto: ""})

    line.setBruto(110)
    line.setVAT(20)
    expect(line.data).toEqual({id: "any rate", bruto: "220.00", vat: "20.00", netto: "200.00"})

    touched = line.touched
    line.setVAT(20)
    expect(line.touched).toEqual(touched)

    line.setVAT("-")
    expect(line.data).toEqual({id: "any rate", bruto: "", vat: "-", netto: ""})

    line.setBruto(110)
    line.setNetto(200)
    expect(line.data).toEqual({id: "any rate", bruto: "220.00", vat: "20.00", netto: "200.00"})

    touched = line.touched
    line.setNetto(200)
    expect(line.touched).toEqual(touched)

    line.setNetto("-")
    expect(line.data).toEqual({id: "any rate", bruto: "", vat: "", netto: "-"})

    line.setBruto(-110)
    expect(line.data).toEqual({id: "any rate", bruto: "-110.00", vat: "-10.00", netto: "-100.00"})
})

test("static methods", () => {
    const lines = [{
            id: NO_VAT.id,
            bruto: "142.50",
            vat: "42.00",
            netto: "100.00"
        },
        {
            id: "any unkown id",
            bruto: "142",
            vat: "42",
            netto: "100"
        },
        {
            id: "any unkown id",
            bruto: "bruto",
            vat: "vat",
            netto: "netto"
        }]

    expect(VATLine.addVATLines(lines)).toEqual({bruto: 284.5, vat: 84, netto: 200})
    expect(VATLine.addVATLines(lines, Math.ceil)).toEqual({bruto: 285, vat: 84, netto: 200})
    expect(VATLine.addVATLines(lines, Math.floor)).toEqual({bruto: 284, vat: 84, netto: 200})

    let line = new VATLine(NO_VAT, 100)
    expect(VATLine.getTotalRemaining([line, line], 335)).toEqual(
        {"remaining": 135, "total": {"bruto": 200, "netto": 200, "vat": 0}}
    )

    line = new VATLine(NO_VAT, -100)
    expect(VATLine.getTotalRemaining([line, line], -335)).toEqual(
        {"remaining": -135, "total": {"bruto": -200, "netto": -200, "vat": 0}}
    )

    line = new VATLine(NO_VAT, 100)
    expect(VATLine.getTotalRemaining([line, line], 200.0001)).toEqual(
        {"remaining": 0, "total": {"bruto": 200, "netto": 200, "vat": 0}}
    )

    let addLine = new VATLine(NO_VAT, 100)
    addLine.untouch(addLine.touched + 1)
    expect(VATLine.updateVATChoices([], 100, false)).toEqual([addLine])

    addLine = new VATLine(NO_VAT, 100)
    addLine.untouch(addLine.touched + 1)
    expect(VATLine.updateVATChoices([], 100, false)).toEqual([addLine])

    const rate = new VATRate("any rate", 0.10)
    let vatLines = [
        new VATLine(rate, 100)
    ]
    addLine = new VATLine(NO_VAT, 100)
    let emptyLine = new VATLine()
    addLine.untouch(addLine.touched + 1)
    emptyLine.untouch(emptyLine.touched + 1)
    // console.log(VATLine.updateVATChoices(vatLines, 200, true))
    expect(VATLine.updateVATChoices(vatLines, 200, true)).toEqual([
        ...vatLines,
        addLine,
        emptyLine
    ])

    vatLines = [
        new VATLine(NO_VAT, 100)
    ]
    expect(VATLine.updateVATChoices(vatLines, 200, true).map(l => l.data)).toEqual([
        { bruto: "200.00", id: "", netto: "200.00", vat: "0.00" },
        { bruto: "", id: "", netto: "", vat: "" }
    ])

    vatLines = [
        new VATLine(NO_VAT, 200)
    ]
    expect(VATLine.updateVATChoices(vatLines, 200, true).map(l => l.data)).toEqual([
        { bruto: "200.00", id: "", netto: "200.00", vat: "0.00" },
        { bruto: "", id: "", netto: "", vat: "" }
    ])

    vatLines = [
        new VATLine(NO_VAT, 100),
        new VATLine(NO_VAT, 50),
    ]
    expect(VATLine.updateVATChoices(vatLines, 200, true).map(l => l.data)).toEqual([
        { bruto: "150.00", id: "", netto: "150.00", vat: "0.00" },
        { bruto: "50.00", id: "", netto: "50.00", vat: "0.00" },
        { bruto: "", id: "", netto: "", vat: "" }
    ])

    // Update the most oldest line
    vatLines = [
        new VATLine(NO_VAT, 100),
        new VATLine(NO_VAT, 50),
    ]
    vatLines[0].touched = 1
    vatLines[1].touched = 0
    expect(VATLine.updateVATChoices(vatLines, 200, true).map(l => l.data)).toEqual([
        { bruto: "100.00", id: "", netto: "100.00", vat: "0.00" },
        { bruto: "100.00", id: "", netto: "100.00", vat: "0.00" },
        { bruto: "", id: "", netto: "", vat: "" }
    ])

    // reverseBrutoVATNetto

    let brutoVATNetto = {
        bruto: "-1",
        vat: "0",
        netto: "-1"
    }
    expect(VATLine.reverseBrutoVATNetto(brutoVATNetto)).toEqual({
        bruto: "1",
        vat: "0",
        netto: "1"
    })

    brutoVATNetto = {
        bruto: "1",
        vat: "0",
        netto: "1"
    }
    expect(VATLine.reverseBrutoVATNetto(brutoVATNetto)).toEqual({
        bruto: "-1",
        vat: "0",
        netto: "-1"
    })

    brutoVATNetto = {
        bruto: "1",
        vat: "",
        netto: "1"
    }
    expect(VATLine.reverseBrutoVATNetto(brutoVATNetto)).toEqual({
        bruto: "-1",
        vat: "",
        netto: "-1"
    })


})