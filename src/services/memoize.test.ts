import { clear, memoize } from "./memoize"

test("memoize", () => {
    const doSomethingDifficult = jest.fn()

    class A {
        constructor(private count: number = 0) {}

        @memoize()
        get prop123() {
            doSomethingDifficult()
            return 123
        }

        @memoize()
        get counter() {
            return this.count
        }

        @memoize()
        get prop456() {
            doSomethingDifficult()
            return 456
        }

        @memoize()
        getString(s: string = "") {
            return s || "abc"
        }

        @clear()
        reset() {
            // Do something that invalidates the cache
        }

        @memoize()
        static get classProp() {
            doSomethingDifficult()
            return 789
        }

        @clear()
        static resetClass() {
            // Do something that invalidates the cache
        }
    }

    let a = new A()

    // Test if result is memoized
    expect(a.prop123).toEqual(123)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(1)
    expect(a.prop123).toEqual(123)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(1)

    // Test id memoization is per instance
    let b = new A(100)

    expect(a.counter).toEqual(0)
    expect(b.counter).toEqual(100)

    // Test if cache is cleared
    a.reset()
    expect(a.prop123).toEqual(123)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(2)
    expect(a.prop123).toEqual(123)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(2)

    // Test memoization for static members
    expect(A.classProp).toEqual(789)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(3)
    expect(A.classProp).toEqual(789)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(3)

    // Test cache clear for static members
    expect(a.prop456).toEqual(456)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(4)
    expect(a.prop456).toEqual(456)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(4)

    // Test that memoization is implemented for parameterless methods only
    expect(a.getString()).toEqual("abc")
    expect(() => {
        expect(a.getString("def"))
    }).toThrow(Error)

    // Test that caches for classes and instances are separated
    A.resetClass()

    expect(A.classProp).toEqual(789)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(5)
    expect(A.classProp).toEqual(789)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(5)

    expect(a.prop123).toEqual(123)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(5)

    a.reset()

    expect(a.prop123).toEqual(123)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(6)

    expect(A.classProp).toEqual(789)
    expect(doSomethingDifficult).toHaveBeenCalledTimes(6)
})

test("decorator usage", () => {
    /* eslint-disable @typescript-eslint/no-unused-vars */

    // clear() can only be applied to methods
    expect(() => {
        // noinspection JSUnusedLocalSymbols
        class A {
            @clear()
            get abc() {
                return "abc"
            }
        }
    }).toThrow(Error)

    // memoize can only be applied to methods and accessors
    expect(() => {
        // noinspection JSUnusedLocalSymbols
        class A {
            // @ts-ignore
            @memoize()
            a: number = 1
        }
    }).toThrow(Error)
})
