import { ValueProxy } from "./ValueProxy"

test("ValueProxy", () => {
    let vp: ValueProxy<number>

    vp = new ValueProxy()

    expect(vp.getValue(() => 1)).toEqual(1)
    expect(vp.getValue(() => 2)).toEqual(1)

    vp.invalidate()
    expect(vp.getValue(() => 2)).toEqual(2)
    expect(vp.getValue(() => 3)).toEqual(2)
})