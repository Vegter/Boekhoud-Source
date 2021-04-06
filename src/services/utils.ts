import assert from "assert"

/**
 * Highlight inputValue in text
 * If the given value is found in the text, the value will be changed like:
 * <span class=className>text</span>
 */
export function highlight(inputValue: string, text: string, className: string) {
    if (inputValue && inputValue.length >= 3) {
        // Don't trigger on small strings
        const regex = new RegExp(inputValue, "gi")
        let founds = []
        text = removeDiacritics(text)
        let found = regex.exec(text)
        while (found !== null) {
            founds.push(found)
            found = regex.exec(text)
        }
        for (let i of founds.map(f => f.index).reverse()) {
            const replacement = text.substr(i, inputValue.length)
            text = text.substr(0, i) +
                `<span class="${className}">${replacement}</span>` +
                text.substr(i + replacement.length)
        }
    }
    return text
}

/**
 * Capitalize a string
 * Example: capitalize("any string") = "Any string"
 */
export const capitalize = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

/**
 * Sort an array on any attribute
 */
export function sortedArray<T>(array: T[], getKey: (item: T) => string) {
    array.sort((v1, v2) => {
        const s1 = getKey(v1)
        const s2 = getKey(v2)
        return s1 < s2 ? -1 : s1 > s2 ? 1 : 0
    })
    return array
}

/**
 * Remove an element from an array, wrapper around array.splice
 */
export function arrayRemoveElement<T>(array: T[], element: T): T[] {
    const index = array.indexOf(element)
    if (index >= 0) {
        array.splice(index, 1)
    }
    return array
}

/**
 * Returns a range of numbers, [from, to>
 * Example: range(5, 7) => [5, 6]
 */
export function range(from: number, to: number | null = null): number[] {
    if (to === null) {
        to = from
        from = 0
    }
    assert(to >= from)
    return Array.from(Array(to - from).keys()).map(v => from + v)
}

/**
 * Returns a string without diacritics
 * Example: removeDiacritics("accepté") => accepte
 */
export function removeDiacritics(s: string) {
    return s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export function allOrSome<T>(all: T[], some: T[]) {
    // If some has any elements return some else return all
    return some.length > 0 ? some : all
}

export function noneOrSome<T>(all: T[], some: T[]) {
    // If some is equal to all then return [] else just return some
    return some.sort().join("") === all.sort().join("") ? [] : some
}
