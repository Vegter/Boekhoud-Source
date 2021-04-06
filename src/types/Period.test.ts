import { Period } from "./Period"
import { DateString } from "./DateString"

test("Period", () => {
    let period = new Period()

    expect(period.format()).toEqual("")
    expect(period).toEqual({"data": ""})
    expect(period.before).toEqual({"data": "-1"})
    expect(period.after).toEqual({"data": "1"})

    const someDate = "2010-12-31"
    period = Period.fromDate(new DateString(someDate))
    expect(period).toEqual({"data": "2010"})
    expect(period.equals(new Period("2010"))).toEqual(true)
    expect(period.equals(new Period("2012"))).toEqual(false)

    expect(period.lte(new Period("2011"))).toEqual(true)
    expect(period.lte(new Period("2010"))).toEqual(true)
    expect(period.lte(new Period("2000"))).toEqual(false)

    expect(period.gte(new Period("2011"))).toEqual(false)
    expect(period.gte(new Period("2010"))).toEqual(true)
    expect(period.gte(new Period("2000"))).toEqual(true)

    expect(period.id).toEqual("2010")
})

test("periods around", () => {
    const someDate = "2010-12-31"
    let period = Period.fromDate(new DateString(someDate))

    const currentYear = new Date().getFullYear()
    let expectedFirst = new Period("2005")
    let expectedLast = new Period(String(currentYear + 5))

    let selectablePeriods = period.getSelectablePeriods()

    expect(selectablePeriods[0]).toEqual(expectedFirst)
    expect(selectablePeriods[selectablePeriods.length - 1]).toEqual(expectedLast)

    expect(Period.min(...selectablePeriods)).toEqual(expectedFirst)
    expect(Period.max(...selectablePeriods)).toEqual(expectedLast)

    expect(Period.min()).toEqual(new Period())
    expect(Period.max()).toEqual(new Period())

    period = new Period(expectedLast.data)

    expectedFirst = new Period(String(currentYear - 5))
    expectedLast = new Period(String(String(currentYear + 10)))

    selectablePeriods = period.getSelectablePeriods()

    expect(selectablePeriods[0]).toEqual(expectedFirst)
    expect(selectablePeriods[selectablePeriods.length - 1]).toEqual(expectedLast)



})

test("toString", () => {
    const someDate = "2010-12-31"
    let period = Period.fromDate(new DateString(someDate))

    expect(period.toString()).toEqual(period.format())
})