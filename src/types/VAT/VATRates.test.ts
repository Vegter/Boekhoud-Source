import { VATRates } from "./VATRates"
import { VATHistory } from "./VATHistory"
import { NO_VAT, VAT_0 } from "./VATRate"

test("VATRates", () => {
    let date = new Date("2020-01-01")
    let rates = new VATRates(date).rates
    expect(Object.keys(rates)).toEqual([
        ...Object.values(VATHistory["2019-01-01"]).map(v => v.id),
        VAT_0.id,
        NO_VAT.id
    ])
    VATHistory["2019-01-01"].forEach(rate => {
        expect(rates[rate.id]).toEqual(rate)
    })

    date = new Date("2019-01-01")
    rates = new VATRates(date).rates
    VATHistory["2019-01-01"].forEach(rate => {
        expect(rates[rate.id]).toEqual(rate)
    })

    date = new Date("2018-12-31")
    rates = new VATRates(date).rates
    VATHistory["2012-10-01"].forEach(rate => {
        expect(rates[rate.id]).toEqual(rate)
    })

    date = new Date("2012-10-01")
    rates = new VATRates(date).rates
    VATHistory["2012-10-01"].forEach(rate => {
        expect(rates[rate.id]).toEqual(rate)
    })

    date = new Date("2012-09-30")
    rates = new VATRates(date).rates
    expect(Object.keys(rates)).toEqual([
        VAT_0.id,
        NO_VAT.id
    ])
})
