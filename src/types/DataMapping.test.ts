import { DataMapping } from "./DataMapping"

/**
 * The raw data
 */
type BaseData = { id: string, content: string }

/**
 * The dictionary that holds the raw data values, indexed by key
 */
type BaseDataMap = Record<string, BaseData>

/**
 * The class that encapsulates the raw data
 */
class Base {
    constructor(public data: BaseData) {}
}

const A = { id: "a", content: "Content A"}
const B = { id: "b", content: "Content B"}
const C = { id: "c", content: "Content C"}
const D = { id: "d", content: "Content D"}

const Data: BaseDataMap = {
    [A.id]: A,
    [B.id]: B
}

test("DataMapping external", () => {
    /**
     * Methods that require no arguments are exposed publicly
     */
    class DM extends DataMapping<BaseDataMap, BaseData> {}
    let dm:DM

    dm = new DM({})
    expect(dm.hasData()).toEqual(false)

    dm = new DM(Data)
    expect(dm.hasData()).toEqual(true)
})

test("DataMapping internal", () => {

    /**
     * The class implements the javascript Map interface for mapped data classes
     * The publicly exposed methods are implemented by the DataMapping base class
     * The base class works on raw data, the exposed methods expose the class that encapsulates the raw data
     */
    class DM extends DataMapping<BaseDataMap, BaseData> {
        has(key: string): boolean { return this.hasItem(key)}
        get(key: string): Base { return this.getItem(Base, key)}

        values(): Base[] { return this.getItems(Base)}

        set(key: string, value: BaseData): void { this.addItem(key, value) }
        delete(key: string): void { this.delItem(key)}

        setIfNew(key: string, value: BaseData): void { this.addItemIfNotExists(key, value)}

        filterOnContent(content: string): DM {
            const filter = (key:string, data: BaseData) => data.content.includes(content)
            return this.filter(DM, filter)
        }

        modifyContent(addContent: string): DM {
            const modify = (data: BaseData) => ({ ...data, content: data.content + addContent })
            return this.modify(DM, modify)
        }

        distinctContents(): string[] {
            const getValue = (key: string, data: BaseData) => data.content
            return this.distinctValues(getValue)
        }
    }

    let dm:DM, dm1:DM, dm2:DM

    dm = new DM(Data)
    Object.keys(Data).forEach((key) => {
        expect(dm.has(key)).toEqual(true)
        expect(dm.get(key)).toEqual(new Base(Data[key]))
    })

    expect(dm.values()).toEqual(Object.values(Data).map(data => new Base(data)))

    expect(dm.has(C.id)).toEqual(false)
    dm.set(C.id, C)
    expect(dm.has(C.id)).toEqual(true)
    dm.delete(C.id)
    expect(dm.has(C.id)).toEqual(false)
    dm.delete(C.id) // No error

    dm.set(C.id, C)
    expect(dm.get(C.id)).toEqual(new Base(C))
    dm.setIfNew(C.id, D)
    expect(dm.get(C.id)).toEqual(new Base(C))
    dm.set(C.id, D)
    expect(dm.get(C.id)).toEqual(new Base(D))
    dm.delete(C.id)

    expect(dm.size).toEqual(2)
    dm1 = dm.filterOnContent(" A")
    expect(dm.size).toEqual(2)
    expect(dm1.size).toEqual(1)
    expect(dm1.get(A.id)).toEqual(new Base(A))

    dm1 = dm.filterOnContent(" A")
    dm2 = dm1.modifyContent(" NEW")
    expect(dm1.size).toEqual(dm2.size)

    expect(dm1.get(A.id).data.content).toEqual("Content A")
    expect(dm2.get(A.id).data.content).toEqual("Content A NEW")

    expect(dm.distinctContents()).toEqual([A, B].map(d => d.content))
    let X = { id: "x", content: "Content X"}
    dm.set(X.id, X)
    expect(dm.distinctContents()).toEqual([A, B, X].map(d => d.content))
    dm.set(X.id, A)
    expect(dm.distinctContents()).toEqual([A, B].map(d => d.content))
})
