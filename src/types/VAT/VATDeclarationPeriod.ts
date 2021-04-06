import { endOfQuarter, startOfQuarter } from "date-fns"
import { VATPeriodData } from "../../model"

/**
 * A VAT declaration period consists of a year and a quarter
 */
export class VATDeclarationPeriod {
    constructor(public year: number, public quarter: number) {
    }

    /**
     * The unique id for this declaration period
     */
    get id(): string {
        return `${this.year}.${this.quarter}`
    }

    /**
     * Get the VATPeriodData for this period
     */
    get data(): VATPeriodData {
        return {
            period: this.id
        }
    }

    /**
     * Constructs a declaration period from the given id
     */
    static fromId(id: string): VATDeclarationPeriod {
        const [year, quarter] = id.split(".")
        return new VATDeclarationPeriod(+year, +quarter)
    }

    /**
     * Start Date of the VAT declaration period
     */
    get startDate(): Date {
        const qDate = new Date(this.year, (this.quarter - 1) * 3, 1)
        return new Date(startOfQuarter(qDate).toDateString())
    }

    /**
     * End Date of the VAT declaration period
     */
    get endDate(): Date {
        return new Date(endOfQuarter(this.startDate).toDateString())
    }
}