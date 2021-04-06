import * as queryString from "query-string"
import { StringifyOptions } from "query-string"

const queryStringOptions: StringifyOptions = {
    arrayFormat: 'bracket',
    skipEmptyString: true,
    skipNull: true
}

type LocationProvider = { search: string }
type HistoryProvider = { push: (obj: any) => void }
type SearchState = Record<string, string | string[] | null>

/**
 * Allows to store state in the URL
 */
export class URLState {

    private state: SearchState

    constructor(location: LocationProvider) {
        this.state = this.load(location)
    }

    save(history: HistoryProvider, location: LocationProvider, urlState: any) {
        this.state = this.load(location)
        const newState = {
            ...this.state,
            ...urlState
        }
        const search = queryString.stringify(newState, queryStringOptions)
        history.push({search})
    }

    load(location: LocationProvider): SearchState {
        return queryString.parse(location.search, queryStringOptions)
    }

    hasValue(key: string): boolean {
        return !(this.getValue(key) === null || this.getValue(key) === undefined)
    }

    getValue(key: string): any {
        return this.state[key]
    }

    getStringValue(key: string): string {
        const value = this.getValue(key)
        return typeof value === 'string' ? value : ""
    }

    getStringArrayValue(key: string): string[] {
        const value = this.getValue(key)
        return Array.isArray(value) ? value : []
    }

    getNumericValue(key: string, defaultValue: number = 0): number {
        const value = this.getValue(key)
        if (typeof value === 'string') {
            const intValue = parseInt(value)
            return isNaN(intValue) ? defaultValue : intValue
        }
        return defaultValue
    }

    getNumericArrayValue(key: string): number[] {
        const value = this.getValue(key)
        return Array.isArray(value) ? value.map(v => parseInt(v)) : []
    }
}