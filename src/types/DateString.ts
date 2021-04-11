import { LOCALE } from "../config"

const ISO_DATESTRING_LENGTH = "yyyy-mm-dd".length

/**
 * Date value
 */
export class DateString {
    data: string

    static ISODateString = (date: Date) => date.toISOString().substr(0, ISO_DATESTRING_LENGTH)

    constructor(dateString?: string) {
        // Expects an ISO Date, eg "2015-03-25" (The International Standard) or an empty string
        let data: string | null = null
        if (dateString) {
            try {
                if (dateString === DateString.ISODateString(new Date(dateString))) {
                    data = dateString
                }
            } catch {}
        } else {
            data = DateString.ISODateString(new Date())
        }

        if (data === null) {
            throw new RangeError()
        }
        this.data = data
    }

    /**
     * Returns a key that can be used to sort on DateString value
     *
     * Older DateStrings have a lower sortKey that newer DateStrings
     */
    get sortKey(): string {
        return this.Date.toISOString()
    }

    /**
     * Constructs a new DateString from a Date object
     */
    static fromDate(date: Date): DateString {
        return new DateString(this.ISODateString(date))
    }

    /**
     * Returns the unique id of the DateString
     */
    get id(): string { return this.data }

    /**
     * Returns the Date representation of this DateString
     * @constructor
     */
    get Date(): Date {
        return new Date(this.data)
    }

    /**
     * Returns the string value of this DateString
     */
    get string(): string {
        return this.data
    }

    /**
     * Returns the period of this DateString
     */
    get period(): string {
        return this.year
    }

    /**
     * Returns the year part of this DateString
     */
    get year(): string {
        return this.data.substr(0, 4)
    }

    /**
     * Returns the mont part of this DateString
     */
    get month(): string {
        return this.data.substr(5, 2)
    }

    /**
     * Returns a formatted representation of this DateString
     */
    format(options?:  Intl.DateTimeFormatOptions): string {
        options = options || {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }
        return this.Date.toLocaleDateString(LOCALE, options)
    }

    /**
     * Converts this DateString to a string value
     */
    toString(): string {
        return this.format()
    }
}