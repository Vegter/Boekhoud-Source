import { URLState } from "./URLState"

test("URLState", () => {
    let state:URLState
    let location = {search: ""}

    state = new URLState(location)
    expect(state.getValue("key")).toBeUndefined()

    let search = "a[]=value1&a[]=value2&key=value&n=5&x[]=1&x[]=3&x[]=2"

    location = {search: `?${search}`}
    state = new URLState(location)
    expect(state.getValue("key")).toEqual("value")
    expect(state.getStringValue("key")).toEqual("value")
    expect(state.getStringArrayValue("key")).toEqual([])
    expect(state.getNumericValue("key")).toEqual(0)
    expect(state.getNumericValue("n")).toEqual(5)
    expect(state.getStringValue("a")).toEqual("")
    expect(state.getStringArrayValue("a")).toEqual(["value1", "value2"])
    expect(state.getNumericValue("a")).toEqual(0);
    expect(state.getNumericArrayValue("x")).toEqual([1,3,2]);
    expect(state.getNumericArrayValue("y")).toEqual([]);

    ["key", "n", "a", "x"].forEach(key => expect(state.hasValue(key)).toEqual(true))
    expect(state.hasValue("any other")).toEqual(false)

    let history = {
        push: jest.fn()
    }

    state.save(history, location, {})
    expect(history.push).toHaveBeenCalledWith({search})
    jest.clearAllMocks()

    state.save(history, location,{y: 5})
    expect(history.push).toHaveBeenCalledWith({search: search + "&y=5"})
})