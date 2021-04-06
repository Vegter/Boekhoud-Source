import { PeriodFilterData } from "../model"
import { DateString } from "./DateString"
import { Period } from "./Period"
import { range } from "../services/utils"

/**
 * Filter data on period (from - to)
 */
export class PeriodFilter {
    constructor(public data: PeriodFilterData = { periods: [] }) {}

    /**
     * Create a period filter from an array of periods
     *
     * The array is assumed to be sorted
     * The first period of the array is the begin period
     * The last period of the array is the end period
     */
    static fromPeriods(periods: Period[]): PeriodFilter {
        if (periods.length > 0) {
            // Period filter is a fromTo [from, to]
            periods = Period.sort(periods)
            periods = [periods[0], periods[periods.length - 1]]
        }
        return new PeriodFilter({ periods: periods.map(period => period.string) })
    }

    /**
     * Create a period filter from an array of values (years)
     *
     * The array is assumed to be sorted
     * The first period of the array is the begin period
     * The last period of the array is the end period
     */
    public static fromValues(values: number[]): PeriodFilter {
        return this.fromPeriods(values.map(value => new Period(String(value))))
    }

    /**
     * Return a new period filter that is limited to the given periods
     *
     * Example:
     * - PeriodFilter(2000, 2010) limitTo (2005, 2015) => PeriodFilter(2005, 2010)
     */
    limitTo(periods: Period[]): PeriodFilter {
        // return a filter that has limits that are within the min-max of the given periods
        let dataPeriods = [this.first, this.last]
        if (periods.length > 0) {
            const min = Period.min(...periods)
            const max = Period.max(...periods)

            if (this.first.lte(min)) {
                dataPeriods[0] = min
            }

            if (this.last.gte(max)) {
                dataPeriods[1] = max
            }

            if (this.first.equals(min) && this.last.equals(max)) {
                // Select all periods
                dataPeriods = []
            }
        }
        return PeriodFilter.fromPeriods(dataPeriods)
    }

    /**
     * Returns a new PeriodFilter with a buffer period at each side of the interval
     *
     * Example:
     * - PeriodFilter(2005, 2007) withBuffer => PeriodFilter(2004, 2008)
     */
    withBuffer(): PeriodFilter {
        if (this.length) {
            return PeriodFilter.fromPeriods([this.first.before, this.last.after])
        }
        return this
    }

    /**
     * Returns the list of Periods in the PeriodFilter
     *
     * Example:
     * - PeriodFilter(2005, 2007) periods => [2005, 2007]
     */
    private get periods(): Period[] { return this.data.periods.map(p => new Period(p)) }

    /**
     * Return the begin and end period of the PeriodFilter as numbers
     */
    get fromTo(): number[] {
        if (this.length > 0) {
            return [this.first.value, this.last.value]
        }
        return []
    }

    /**
     * Return the periods in the PeriodFilter as a range
     *
     * Example:
     * - PeriodFilter(2005, 2007) values => [2005, 2006, 2007]
     */
    get values(): number[] {
        if (this.length > 0) {
            return range(this.first.value, this.last.value + 1)
        }
        return []
    }

    /**
     * Returns the number of periods in the PeriodFilter
     */
    get length(): number { return this.periods.length }

    /**
     * Return the first Period of the PeriodFilter or an empty Period
     */
    get first(): Period { return this.periods[0] ?? new Period() }

    /**
     * Returns the last period of the PeriodFilter or an empty Period
     */
    get last(): Period { return this.periods[this.length - 1] ?? new Period() }

    /**
     * Tells whether this PeriodFilter is equal to the given PeriodFilter (same interval)
     */
    public equals(other: PeriodFilter): boolean {
        return this.first.equals(other.first) && this.last.equals(other.last)
    }

    /**
     * Returns the numeric value of the given period string
     * @param period
     */
    public static asValue(period: string): number {
        return Number(period)
    }

    /**
     * Tells whether the given period is in range of this PeriodFilter
     */
    public periodInRange(period: Period): boolean {
        return this.length === 0 || (this.first.lte(period) && period.lte(this.last))
    }

    /**
     * Tells whether the given date is in range of this PeriodFilter
     */
    public dateInRange(date: DateString): boolean {
        const period = Period.fromDate(date)
        return this.periodInRange(period)
    }
}
