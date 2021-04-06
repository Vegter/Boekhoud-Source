import { DateString } from "./DateString"
import { range, sortedArray } from "../services/utils"

/**
 * A Period
 *
 * Implemented as a string
 */
export class Period {
    constructor(public data: string = "") {}

    /**
     * Convert a date to a period (year of the date)
     */
    static fromDate(date: DateString) {
        return new Period(date.year)
    }

    /**
     * Return a formatted presentation of the period
     */
    format(): string {
        return this.string
    }

    /**
     * Tells whether this period equals the given period
     */
    equals(other: Period): boolean { return this.data === other.data }

    /**
     * Tells whether this period is less than or equal than the given period
     */
    lte(other: Period): boolean { return this.data <= other.data }

    /**
     * Tells whether this period is greater than or equal than the given period
     */
    gte(other: Period): boolean { return this.data >= other.data }

    /**
     * Returns the unique id of this period
     */
    get id(): string { return this.data }

    /**
     * Returns the period as a string
     */
    get string(): string { return this.data }

    /**
     * Returns the period as a number
     */
    get value(): number { return Number(this.data) }

    /**
     * Returns the period before this period
     */
    get before(): Period {
        return new Period(String(this.value - 1))
    }

    /**
     * Returns the period after this period
     */
    get after(): Period {
        return new Period(String(this.value + 1))
    }

    /**
     * Converts the period to a string value
     */
    toString(): string {
        return this.format()
    }

    /**
     * Given this period, return a list of periods to choose from
     *
     * This can be used in a dropdown to choose another period value
     */
    getSelectablePeriods(): Period[] {
        const NPeriodsUpDown = 5
        const currentYear = new Date().getFullYear()
        const [from, to] = [
            Math.min(this.value, currentYear) - NPeriodsUpDown,
            Math.max(this.value, currentYear) + NPeriodsUpDown]
        return range(from, to + 1).map(n => new Period(String(n)))
    }

    /**
     * returns a sorted array (ascending) of the given array of periods
     */
    static sort(periods: Period[]) {
        return sortedArray(periods, period => period.string)
    }

    /**
     * Returns the minimum period in the given array of periods
     */
    static min(...periods: Period[]): Period {
        const min = Math.min(...periods.map(period => period.value))
        return periods.find(period => period.value === min) || new Period()
    }

    /**
     * Returns the maximum period in the given array of periods
     */
    static max(...periods: Period[]): Period {
        const max = Math.max(...periods.map(period => period.value))
        return periods.find(period => period.value === max) || new Period()
    }
}
