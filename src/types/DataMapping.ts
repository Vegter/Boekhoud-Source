/**
 * Base class for all data-mapped classes
 *
 * The methods in this class allow for a mapping between the raw data and its corresponding class
 * See the test files for an example how to use the DataMapping class to construct an intelligent (javascript-like) Map
 */
export class DataMapping<MapData extends Record<string, Data>, Data> {
    readonly data: Record<string, Data>

    constructor(data: MapData) {
        this.data = data
    }

    hasData(): boolean { return Object.keys(this.data).length > 0 }
    get size(): number { return Object.keys(this.data).length }

    protected hasItem(id: string): boolean { return id in this.data }

    private get items(): Data[] { return Object.values(this.data) }
    private get entries(): [string, Data][] { return Object.entries(this.data) }

    protected addItem(key: string, data: Data): void { this.data[key] = data }
    protected delItem(key: string): void { delete this.data[key]}

    protected getItems<T>(type: { new(data: Data): T }): T[] {
        return this.items.map(data => new type(data))
    }
    protected getItem<T>(type: { new(data: Data): T }, id: string): T {
        return new type(this.data[id])
    }

    protected addItemIfNotExists(key: string, data: Data): void {
        if (!this.hasItem(key)) {
            this.addItem(key, data)
        }
    }

    protected filter<T>(type: { new(data: MapData): T }, condition: (key: string, data: Data) => boolean): T {
        /**
         * Returns a filtered copy of the data
         */
        return new type(this.entries.reduce((result, [key, data]) => {
            if (condition(key, data)) {
                result[key] = data
            }
            return result
        }, {} as Record<string, Data>) as MapData)
    }

    protected modify<T>(type: { new(data: MapData): T }, f: (data: Data) => Data): T {
        /**
         * Returns a modified copy of the data.
         * Take care to provide a modification function that does not alter the original data
         */
        return new type(this.entries.reduce((result, [key, data]) => {
            result[key] = f(data)
            return result
        }, {} as Record<string, Data>) as MapData)
    }

    protected distinctValues<T>(getValue: (key: string, data: Data) => T): T[] {
        /**
         * Returns an array of distinct attribute values of the Data
         */
        const result = this.entries.reduce((result, [key, value]) => {
            result.add(getValue(key, value))
            return result
        }, new Set<T>())
        return Array.from(result)
    }
}