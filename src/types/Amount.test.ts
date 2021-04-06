import { Amount, CreditDebit } from "./Amount"
import { AssertionError } from "assert"

test("create amountData", () => {
    let amount: Amount
    let currency: string
    let n: number

    amount = new Amount()
    expect(amount.isNull()).toEqual(true)
    expect(amount.isZero()).toEqual(true)
    expect(amount.amount).toEqual(0)
    expect(amount.value).toEqual(0)

    currency = "Any Currency"
    amount = new Amount({currency, amount: 0, creditDebit: CreditDebit.Credit})
    expect(amount.isNull()).toEqual(false)
    expect(amount.isZero()).toEqual(true)
    expect(amount.currency).toEqual(currency)

    amount = Amount.fromAmountCurrency(10, currency)
    expect(amount.currency).toEqual(currency)
    expect(amount.isDebit).toEqual(false)
    amount = Amount.fromAmountCurrency()
    expect(amount).toEqual(new Amount())
    amount = Amount.fromAmountCurrency(-10, currency)
    expect(amount.isDebit).toEqual(true)

    n = 10
    amount = new Amount({currency, amount: n, creditDebit: CreditDebit.Credit})
    expect(amount.amount).toEqual(n)
    expect(amount.value).toEqual(n)
    expect(amount.isZero()).toEqual(false)
    expect(amount.currency).toEqual(currency)
    expect(amount.creditDebit).toEqual(CreditDebit.Credit)
    expect(amount.isDebit).toEqual(false)
    expect(amount.isCredit).toEqual(true)

    expect(amount.reversed().amount).toEqual(n)
    expect(amount.reversed().value).toEqual(-n)
    expect(amount.reversed().reversed().value).toEqual(n)

    n = -5
    amount = new Amount({currency, amount: -n, creditDebit: CreditDebit.Debit})
    expect(amount.amount).toEqual(-n)
    expect(amount.value).toEqual(n)
    expect(amount.currency).toEqual(currency)
    expect(amount.creditDebit).toEqual(CreditDebit.Debit)
    expect(amount.isDebit).toEqual(true)
    expect(amount.isCredit).toEqual(false)
})

test("add amountData", () => {
    let amount: Amount
    let add: Amount

    amount = new Amount()

    const currency1 = "Any Currency"
    const n1 = 10
    const amount1 = new Amount({currency: currency1, amount: n1, creditDebit: CreditDebit.Credit})

    add = amount.add(amount1)
    expect(add.isNull()).toEqual(false)
    expect(add.value).toEqual(n1)
    expect(add.currency).toEqual(currency1)

    const currency2 = currency1
    const n2 = -20
    const amount2 = new Amount({currency: currency2, amount: -n2, creditDebit: CreditDebit.Debit})

    add = amount.add(amount1, amount2)
    expect(add.value).toEqual(n1 + n2)
    expect(add.currency).toEqual(currency1)

    const currency3 = "Any Other Currency"
    const n3 = 20
    const amount3 = new Amount({currency: currency3, amount: n3, creditDebit: CreditDebit.Credit})

    expect(() => {
        amount.add(amount1, amount2, amount3)
    }).toThrow(AssertionError)
})

test("format amount", () => {
    const nbsp = '\u00A0'
    let amount = new Amount()

    expect(amount.format()).toEqual(`€${nbsp}0,00`)

    amount = new Amount({amount: 10, currency: "USD", creditDebit: CreditDebit.Debit})
    expect(amount.format()).toEqual(`US$${nbsp}-10,00`)

    amount = new Amount({amount: 10, currency: "EUR", creditDebit: CreditDebit.Debit})
    expect(amount.format()).toEqual(`€${nbsp}-10,00`)
    expect(amount.format({reversed: true})).toEqual(`€${nbsp}10,00`)
})

test("toString", () => {
    const amount = new Amount({amount: 10, currency: "EUR", creditDebit: CreditDebit.Debit})
    expect(amount.toString()).toEqual(amount.format())
})