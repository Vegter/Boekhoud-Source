import { decryptJSON, encryptObject, isEncrypted, isJSONEncrypted } from "./crypto"

test("Crypto", () => {
    let obj = {
        a: 1,
        1: 2,
        b: true,
        c: "any string",
        d: 3.15
    }

    let key = "Any key of any length and any content @123 #456"

    let encrypted = encryptObject(obj, key)
    let encryptedJSON = JSON.stringify(encrypted)
    expect(encrypted.encrypt).toEqual("AES")
    expect(encrypted.content.length > 0).toEqual(true)
    expect(isEncrypted(encrypted)).toEqual(true)
    expect(isEncrypted({})).toEqual(false)
    expect(isEncrypted(obj)).toEqual(false)
    expect(isJSONEncrypted(JSON.stringify(obj))).toEqual(false)
    expect(isJSONEncrypted(encryptedJSON)).toEqual(true)
    expect(isJSONEncrypted("Some none JSON")).toEqual(false)

    let decryptedJSON = decryptJSON(encryptedJSON, key)
    expect(decryptedJSON).not.toBeNull()
    expect(JSON.parse(decryptedJSON!)).toEqual(obj)

    expect(decryptJSON(JSON.stringify(obj), key)).toBeNull()
    expect(decryptJSON("Some non JSON", key)).toBeNull()

    let encryptedWrongJSON = JSON.stringify({
        ...encrypted,
        content: "Some wrong content"
    })

    expect(() => {
        decryptJSON(encryptedWrongJSON, key)
    }).toThrow(Error)

    expect(() => {
        decryptJSON(encryptedJSON, "Any wrong key abc")
    }).toThrow(Error)
})