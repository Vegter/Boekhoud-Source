export class ValueProxy<T> {
    _value: T | null = null

    invalidate() {
        this._value = null
    }

    getValue(getValue: () => T): T {
        if (this._value === null) {
            this._value = getValue()
        }
        return this._value
    }
}
