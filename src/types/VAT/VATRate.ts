const NO_VAT_ID = ""
const VAT_0_ID = "Vrijgesteld"

export class VATRate {
    constructor(public id: string, public percentage: number) {}

    get percentageString(): string {
        return `${this.percentage * 100}%`
    }

    get shortDescription() {
        if (this.id === NO_VAT_ID) {
            return "Geen BTW"
        } else {
            return `BTW ${this.id} ${this.percentageString}`
        }
    }

    toString() {
        return this.shortDescription
    }
}

export const NO_VAT = new VATRate(NO_VAT_ID, 0)
export const VAT_0 = new VATRate(VAT_0_ID, 0)
