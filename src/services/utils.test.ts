import {
    allOrSome,
    arrayRemoveElement,
    capitalize, highlight, noneOrSome,
    range,
    removeDiacritics,
    sortedArray
} from "./utils"
import { AssertionError } from "assert"

test("highlight", () => {
    expect(highlight("any", "this is a text on a line", "class"))
        .toEqual("this is a text on a line")
    expect(highlight("a", "this is a text on a line", "class"))
        .toEqual("this is a text on a line")
    expect(highlight("any", "this is any text on AnY line", "class"))
        .toEqual('this is <span class="class">any</span> text on <span class="class">AnY</span> line')
})

test("arrayRemoveElement", () => {
    let a = [1, 2, 3]

    expect(arrayRemoveElement(a, 2)).toEqual([1, 3])
    expect(arrayRemoveElement(a, -1)).toEqual([1, 3])
    expect(arrayRemoveElement(a, 3)).toEqual([1])
    expect(arrayRemoveElement(a, 1)).toEqual([])
    expect(arrayRemoveElement([], 2)).toEqual([])
})

test("sortedArray", () => {

    expect(sortedArray([], () => "any key")).toEqual([])

    const array1 = [
        { key: "abc", a1: "11", a2: 11},
        { key: "ghi", a1: "13", a2: 13},
        { key: "def", a1: "12", a2: 12},
    ]
    expect(sortedArray([...array1], (i => i.key))).toEqual([
        array1[0],
        array1[2],
        array1[1]])
    expect(sortedArray([...array1], (i => i.key), true)).toEqual([
        array1[0],
        array1[2],
        array1[1]])
    expect(sortedArray([...array1], (i => i.key), false)).toEqual([
        array1[1],
        array1[2],
        array1[0]])

    const array2 = [
        { key: 100, a1: "11", a2: 11},
        { key: 102, a1: "13", a2: 13},
        { key: 101, a1: "12", a2: 12},
    ]
    expect(sortedArray([...array2], (i => String(i.key)))).toEqual([
        array2[0],
        array2[2],
        array2[1]])

})

test('create ranges', () => {
    // Create range [n, m>
    let r = range(0, 5)
    expect(r).toEqual([0, 1, 2, 3, 4])
    r = range(1, 5)
    expect(r).toEqual([1, 2, 3, 4])
    r = range(1, 1)
    expect(r).toEqual([])
    r = range(1, 11)
    expect(r).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    // Create range [0, n>
    r = range(0)
    expect(r).toEqual([])
    r = range(5)
    expect(r).toEqual([0, 1, 2, 3, 4])
    r = range(10)
    expect(r).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    // Assert valid range, i.e. range [n, m> requires m >= n
    expect(() => {
        // [1, 0>
        r = range(1, 0)
    }).toThrow(AssertionError)
    expect(() => {
        // [0, -1>
        r = range(-1)
    }).toThrow(AssertionError)
});

test("capitalize", () => {
    expect(capitalize("data")).toEqual("Data")
    expect(capitalize("Data")).toEqual("Data")
    expect(capitalize("")).toEqual("")
})

test("removeDiacritics", () => {
    expect(removeDiacritics('àbçdëfghïjklmñöpqrśtüvwxÿž')).toEqual("abcdefghijklmnopqrstuvwxyz")
})

test("allOrsome", () => {
    expect(allOrSome([1,2,3], [])).toEqual([1,2,3])
    expect(allOrSome([1,2,3], [1])).toEqual([1])
})

test("noneOrSome", () => {
    expect(noneOrSome([1,2,3], [])).toEqual([])
    expect(noneOrSome([1,2,3], [1])).toEqual([1])
    expect(noneOrSome([1,2,3], [1,2,3])).toEqual([])
    expect(noneOrSome([1,2,3], [3,1,2])).toEqual([])
})