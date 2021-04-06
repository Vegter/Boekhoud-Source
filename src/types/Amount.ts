import assert from "assert"
import Decimal from "decimal.js-light"
import { AmountData } from "../model"
import { DEFAULT_CURRENCY, LOCALE } from "../config"

export enum CreditDebit {
    Debit = -1,
    Credit = 1
}

const defaultAmountData = {
    amount: 0,
    currency: "",
    creditDebit: CreditDebit.Credit
}

interface FormatOptions {
    reversed: boolean,
    precision: number
}

/**
 * An amount specifies an amount of money, either debit or credit, in a specific currency
 *
 * Amounts are used in JournalEntries to record business transactions
 * Every business transaction is recorded in at least two places (double entry accounting)
 * The total of the debit and credit amounts in a JournalEntry is 0
 *
 * Amounts are treated as Decimals to prevent floating point rounding issues
 * Externally, amounts are represented as number
 */
export class Amount {
    readonly data: AmountData

    constructor(data?: AmountData) {
        data = data ?? {...defaultAmountData}
        assert(data.amount >= 0)
        this.data = data
    }

    /**
     * Creates an Amount from the given amount and currency
     *
     * The amount defaults to 0 and the currency to ""
     */
    static fromAmountCurrency(amount: number = 0, currency: string = ""): Amount {
        return new Amount({
            amount: Math.abs(amount),
            currency,
            creditDebit: amount < 0 ? CreditDebit.Debit : CreditDebit.Credit
        })
    }

    /**
     * Returns the plain amount
     */
    get amount(): number { return this.data.amount }

    /**
     * Returns the currency in which the amount is expressed
     */
    get currency(): string { return this.data.currency }

    /**
     * Returns the "side" of the amount; credit or debit
     */
    get creditDebit(): CreditDebit { return this.data.creditDebit }

    /**
     * Tells whether the amount is a debit amount
     */
    get isDebit() { return this.data.creditDebit === CreditDebit.Debit }

    /**
     * Tells whether the amount is a credit amount
     */
    get isCredit() { return ! this.isDebit }

    /**
     * Add a number of Amounts to the current amount and returns the result as a new Amount
     *
     * The original amount is not changed
     */
    add(amount: Amount, ...amounts: Amount[]): Amount {
        const [value, currency] = [amount].concat(amounts)
            .filter(amount => !amount.isNull())
            .reduce(([value, currency], other) => {
                assert(currency === defaultAmountData.currency || other.currency === currency)
                value = value.add(other.value)
                currency = other.currency
                return [value, currency]
        }, [new Decimal(this.value), this.currency] as [Decimal, string])
        // Convert to Amount
        const newAmount = value.toNumber()
        return new Amount({
            currency,
            amount: Math.abs(newAmount),
            creditDebit: newAmount < 0 ? CreditDebit.Debit : CreditDebit.Credit
        })
    }

    /**
     * Return a new reversed Amount for this amount
     *
     * The original amount is not changed
     */
    reversed(): Amount {
        return new Amount({
            ...this.data,
            creditDebit: this.creditDebit === CreditDebit.Credit ? CreditDebit.Debit : CreditDebit.Credit
        })
    }

    /**
     * returns the value of the amount as a number
     * A positive number for a credit amount, a negative number for a debit amount
     */
    get value(): number {
        return this.amount * this.creditDebit
    }

    /**
     * Tells whether the Amount is not set; ie just created with all default data
     */
    isNull(): boolean {
        return this.amount === defaultAmountData.amount && this.currency === defaultAmountData.currency
    }

    /**
     * Tells whether the amount is a zero amount
     *
     * A small margin is used to compensate for any rounding errors
     */
    isZero(): boolean {
        const tolerance = 0.001
        return this.amount <= tolerance
    }

    /**
     * Returns the amount as a formatted string
     *
     * Example: {10, "EUR", debit} => € -10.00
     */
    format(options: Partial<FormatOptions> = {}): string {
        const { reversed, precision } = options
        let value: number
        if (this.isZero()) {
            value = 0
        } else {
            value = this.value
            if (reversed) {
                value = -value
            }
        }

        const formatOptions = {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
        }

        return Amount.formatValue(value, formatOptions, this.currency)
    }

    /**
     * Format a numeric value using the default Locale in the given currency
     */
    static formatValue(value: number, options: {}, currency?: string) {
        let formatter = new Intl.NumberFormat(LOCALE, {
            style: 'currency',
            currency: currency || DEFAULT_CURRENCY,
            ...options
        });
        return formatter.format(value); /* $2,500.00 */
    }

    /**
     * Returns a string presentation of the Amount
     */
    toString(): string {
        return this.format()
    }
}
