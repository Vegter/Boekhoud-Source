interface FormatProps {
    short?: boolean
}

/**
 * Simple class to hold an IBAN value
 */
export class IBAN {
    data: string

    constructor(s: string) {
        this.data = s
    }

    /**
     * Returns a formatted presentation of the IBAN
     */
    format(props: FormatProps = {}): string {
        const short = props.short ?? false

        if (this.data.length > 9 && !short) {
            // ISO13616
            // IBAN is traditionally expressed in groups of four characters separated by spaces
            const EVERY_FOUR_CHARS =/(.{4})(?!$)/g
            return this.data.replace(EVERY_FOUR_CHARS, `$1 `)
        } else if (this.data.length === 9 || short) {
            const s = this.data.substr(this.data.length - 9)
            return s.replace(/^(.{2})(.{2})(.{2})(.*)$/, `$1.$2.$3.$4`)
        } else {
            return this.data
        }
    }

    /**
     * Converts the IBAN to a string value
     */
    toString(): string {
        return this.format()
    }
}