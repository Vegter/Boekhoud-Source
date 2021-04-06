import { NO_VAT, VAT_0, VATRate } from "./VATRate"

test("VATRate", () => {
    let rate = new VATRate("any id", 0.45)
    expect(rate.percentageString).toEqual("45%")
    expect(rate.shortDescription).toEqual("BTW any id 45%")
    expect(rate.toString()).toEqual(rate.shortDescription)

    rate = NO_VAT
    expect(rate.percentageString).toEqual("0%")
    expect(rate.shortDescription).toEqual("Geen BTW")

    rate = VAT_0
    expect(rate.percentageString).toEqual("0%")
    expect(rate.shortDescription).toEqual("BTW Vrijgesteld 0%")

})