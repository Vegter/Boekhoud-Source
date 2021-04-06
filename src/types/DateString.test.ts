import { DateString } from "./DateString"

test("DateString", () => {
    expect(new DateString()).toBeInstanceOf(DateString)
    expect(new DateString("")).toBeInstanceOf(DateString)

    const someDate = "2010-12-31"
    const dateString = new DateString(someDate)
    expect(dateString.data).toEqual(someDate)
    expect(dateString.Date.toISOString()).toEqual(new Date(someDate).toISOString())
    expect(dateString.month).toEqual("12")
    expect(dateString.period).toEqual("2010")
    expect(dateString.string).toEqual(someDate);

    ["2", "2012", "2010/12/31", someDate + "1"].forEach(s => {
        expect(() => {
            new DateString(s)
        }).toThrow(RangeError)
    })

    expect(dateString.id).toEqual(someDate)

    const date = new Date()
    expect(DateString.fromDate(date)).toBeDefined()
    expect(DateString.fromDate(date)).toEqual(new DateString(DateString.ISODateString(date)))
})

test("Format DataString", () => {
    const someDate = "2010-12-31"
    const dateString = new DateString(someDate)

    expect(dateString.format()).toEqual("31-12-10")
})

test("toString", () => {
    const someDate = "2010-12-31"
    const dateString = new DateString(someDate)

    expect(dateString.toString()).toEqual(dateString.format())
})