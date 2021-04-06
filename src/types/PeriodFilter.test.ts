import { PeriodFilter } from "./PeriodFilter"
import { DateString } from "./DateString"
import { Period } from "./Period"

test("PeriodFilter", () => {
    let filterData = {
        periods: ["2020", "2024"]
    }

    const filter = new PeriodFilter(filterData);

    expect(filter.values).toEqual([2020, 2021, 2022, 2023, 2024]);
    expect(filter.length).toEqual(2);

    expect(filter.first.string).toEqual("2020");
    expect(filter.last.string).toEqual("2024");

    expect(filter.equals(new PeriodFilter())).toEqual(false);
    expect(new PeriodFilter().equals(new PeriodFilter())).toEqual(true);
    expect(filter.equals(filter)).toEqual(true);
    expect(filter.equals(PeriodFilter.fromValues([2020, 2024]))).toEqual(true);

    ["2020", "2021", "2022", "2023", "2024"].forEach(period =>
        expect(filter.periodInRange(new Period(period))).toEqual(true)
    );

    ["", "2019", "2025"].forEach(period =>
        expect(filter.periodInRange(new Period(period))).toEqual(false)
    );

    ["2020-01-01", "2020-02-01", "2024-12-31"].forEach(date =>
        expect(filter.dateInRange(new DateString(date))).toEqual(true)
    );

    ["2019-12-31", "2025-01-01"].forEach(date =>
        expect(filter.dateInRange(new DateString(date))).toEqual(false)
    );

    expect(PeriodFilter.asValue("2020")).toEqual(2020);

})

test("Limit filter", () => {
    let filterData = { periods: ["2020", "2024"] }

    const filter = new PeriodFilter(filterData);
    let periods: Period[] = []
    expect(filter.limitTo(periods).fromTo).toEqual([2020, 2024])

    periods = [new Period("2022")]
    expect(filter.limitTo(periods).fromTo).toEqual([2022, 2022])

    periods = [new Period("2020"), new Period("2024")]
    expect(filter.limitTo(periods).fromTo).toEqual([])

    periods = [new Period("2025")]
    expect(filter.limitTo(periods).fromTo).toEqual([2024, 2025])

    periods = [new Period("2019")]
    expect(filter.limitTo(periods).fromTo).toEqual([2019, 2020])

    expect(filter.withBuffer().fromTo).toEqual([2019, 2025])
    const filterAll = new PeriodFilter()
    expect(filterAll.withBuffer().fromTo).toEqual([])

    expect(filter.fromTo).toEqual([2020, 2024])
    expect(filterAll.fromTo).toEqual([])

    expect(filterAll.values).toEqual([])

})
