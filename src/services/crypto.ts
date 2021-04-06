import { AES, enc } from "crypto-js"

interface EncryptedObject {
    encrypt: string     // Encryption method: currently AES
    content: string     // Encrypted JSON contents of the original object
}

/**
 * Encrypt the given object using the given key
 *
 * CryptoJS supports AES-128, AES-192, and AES-256.
 * It will pick the variant by the size of the key you pass in.
 * If you use a passphrase, then it will generate a 256-bit key.
 */
export function encryptObject(obj: object, key: string): EncryptedObject {
    return {
        encrypt: "AES",
        content: AES.encrypt(JSON.stringify(obj), key).toString()
    }
}

/**
 * Decrypt the given encrypted object using the given key
 * The JSON representation of the original object is returned
 *
 * @throws Error when the decryption fails (wrong key)
 */
function decryptToJSON(obj: EncryptedObject, key: string): string {
    try {
        const bytes = AES.decrypt(obj.content, key)
        const result = bytes.toString(enc.Utf8)
        if (result) {
            return result
        }
    } catch {}
    throw new Error("Decryption failed")
}

/**
 * Tells whether the given object is an encrypted object
 */
export function isEncrypted(obj: any): boolean {
    return Boolean(obj.encrypt && obj.content)
}

/**
 * Tells whether the given JSON string is a JSON representation of an encrypted object
 */
export function isJSONEncrypted(json: string): boolean {
    try {
        const object = JSON.parse(json)
        return isEncrypted(object)
    }
    catch {}
    return false
}

/**
 * Decrypt the given JSON string using the given key
 * Returns the JSON representation of the orginal object if the decryption succeeds
 * Returns null if the given JSON string is not a representation of an encrypted object
 *
 * @throws Error when the decryption fails (wrong key)
 */
export function decryptJSON(json: string, key: string): string | null {
    if (isJSONEncrypted(json)) {
        const object = JSON.parse(json)
        return decryptToJSON(object, key)
    }
    return null
}
