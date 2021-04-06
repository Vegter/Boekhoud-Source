import { VATDeclarationPeriod } from "./VATDeclarationPeriod"

test("VAT Declaration Period", () => {
    const year = 2000
    const quarter = 2

    let period = new VATDeclarationPeriod(year, quarter)

    expect(period.id).toEqual("2000.2")
    expect(period.data).toEqual({period: "2000.2"})
    expect(VATDeclarationPeriod.fromId("2000.2")).toEqual(period)

    expect(period.startDate).toEqual(new Date(year, 3, 1))
    expect(period.endDate).toEqual(new Date(year, 5, 30))
})