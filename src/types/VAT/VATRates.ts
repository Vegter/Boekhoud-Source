import { VATHistory } from "./VATHistory"
import { NO_VAT, VAT_0, VATRate } from "./VATRate"

export type VATRatesMap = Record<string, VATRate>

export class VATRates {

    constructor(public date: Date) {}

    get rates(): VATRatesMap {
        const actual = Object.keys(VATHistory).find(isoDateString => {
            return this.date >= new Date(isoDateString)
        })

        const fixedRates = [
            VAT_0,
            NO_VAT
        ]

        const rates = actual ? VATHistory[actual] : []
        return rates.concat(fixedRates).reduce((result, rate) => {
            result[rate.id] = rate
            return result
        }, {} as VATRatesMap)
    }
}
