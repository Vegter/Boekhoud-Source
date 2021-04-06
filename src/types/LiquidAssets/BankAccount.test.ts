import { BankAccount } from "./BankAccount"
import { Amount, CreditDebit } from "../Amount"
import { AccountStatementData, BankAccountData, StatementEntryData } from "../../model"
import { AccountBalance } from "./AccountBalance"
import { IBAN } from "../IBAN"
import { Mocked } from "../mocks"

test("BankAccount", () => {
    let mocked = new Mocked()
    let bankAccountData: BankAccountData

    mocked.ledgerScheme()

    bankAccountData = {
        id: "Any BankAccount ID",
        currency: "",
        ledgerAccountCode: mocked.ledgerAccountA.code,
        accountStatementMapData: {},
        statementEntryMapData: {}
    }
    let bankAccount = new BankAccount(bankAccountData)

    expect(bankAccount.beginBalance()).toBeNull()
    expect(bankAccount.endBalance()).toBeNull()

    const currency = "Any Currency"

    let statements: AccountStatementData[] = [
        {
            id: "1",
            openingBalanceData: {
                date: "2019-12-30",
                amountData: { amount: 1, currency: currency, creditDebit: CreditDebit.Credit}
            },
            closingBalanceData: {
                date: "2019-12-31",
                amountData: { amount: 2, currency: currency, creditDebit: CreditDebit.Credit}
            },
        },
        {
            id: "2",
            openingBalanceData: {
                date: "2020-01-01",
                amountData: { amount: 5, currency: currency, creditDebit: CreditDebit.Credit}
            },
            closingBalanceData: {
                date: "2020-01-02",
                amountData: { amount: 6, currency: currency, creditDebit: CreditDebit.Credit}
            },
        },
        {
            id: "3",
            openingBalanceData: {
                date: "2019-12-31",
                amountData: { amount: 3, currency: currency, creditDebit: CreditDebit.Credit}
            },
            closingBalanceData: {
                date: "2020-01-01",
                amountData: { amount: 4, currency: currency, creditDebit: CreditDebit.Credit}
            },
        },
        {
            id: "4",
            openingBalanceData: {
                date: "2020-12-30",
                amountData: { amount: 7, currency: currency, creditDebit: CreditDebit.Credit}
            },
            closingBalanceData: {
                date: "2020-12-31",
                amountData: { amount: 8, currency: currency, creditDebit: CreditDebit.Credit}
            },
        },
    ]

    const entries: StatementEntryData[] = [
        {
            id: "",
            amountData: new Amount().data,
            bookDate: "",
            valueDate: "",
            relatedParties: "",
            remittanceInformation: "",
            accountStatementRef: ""
        }
    ]

    statements.forEach(statement => {
        bankAccount.add(statement, entries)
        bankAccount.add(statement, entries)
    })

    expect(bankAccount.beginBalance()).toEqual(new AccountBalance({
        date: "2019-12-30",
        amountData: { amount: 1, currency: currency, creditDebit: CreditDebit.Credit}
    }))

    expect(bankAccount.endBalance()).toEqual(new AccountBalance({
        date: "2020-12-31",
        amountData: { amount: 8, currency: currency, creditDebit: CreditDebit.Credit}
    }))

    expect(bankAccount.id).toEqual(bankAccountData.id)
    expect(bankAccount.IBAN).toEqual(new IBAN(bankAccountData.id))
    expect(bankAccount.ledgerAccount.code).toEqual(bankAccountData.ledgerAccountCode)

    bankAccount.ledgerAccount = mocked.ledgerAccountB
    expect(bankAccount.ledgerAccount.code).toEqual(mocked.ledgerAccountB.code)
})
