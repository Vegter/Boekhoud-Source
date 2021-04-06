import { LedgerAccount, UNMAPPED_ACCOUNT } from "./LedgerAccount"
import { Mocked } from "../mocks"
import { LEDGER_ACCOUNT } from "../../config"
import { LedgerAccountData } from "../../model"

test("LedgerAccount", () => {
    let mocked = new Mocked()
    let account: LedgerAccount

    account = new LedgerAccount(mocked.ledgerAccountDataA)

    expect(account.code).toEqual(mocked.ledgerAccountDataA.Referentiecode)
    expect(account.level).toEqual(mocked.ledgerAccountDataA.Nivo)
    expect(account.description).toEqual(mocked.ledgerAccountDataA.Omschrijving)
    expect(account.shortDescription).toEqual(mocked.ledgerAccountDataA.OmschrijvingKort)
    expect(account.sortKey).toEqual(mocked.ledgerAccountDataA.Sortering)
    expect(account.side).toEqual("D")
    expect(account.parent).toBeNull()
    expect(account.equals(mocked.ledgerAccountA))
    expect(LedgerAccount.sortKey(account)).toEqual(account.sortKey)
    expect(account.isUnmapped()).toEqual(false)

    expect(new LedgerAccount(mocked.ledgerAccountDataWExp).category).toEqual(LEDGER_ACCOUNT.EXPENSE_CATEGORY)
    expect(new LedgerAccount(mocked.ledgerAccountDataB).category).toEqual(LEDGER_ACCOUNT.BALANCE_ACCOUNT)
    expect(new LedgerAccount(mocked.ledgerAccountDataWRev).category).toEqual(LEDGER_ACCOUNT.REVENUE_CATEGORY)

    expect(account.isRevenue).toEqual(false)
    expect(account.isExpense).toEqual(false)

    account = UNMAPPED_ACCOUNT
    expect(account.isUnmapped()).toEqual(true)

    mocked.ledgerScheme()

    let data: LedgerAccountData = {
        Referentiecode: "WAbc",
        ReferentieOmslagcode: "WAbcRev",
        Sortering: "0",
        Referentienummer: "0",
        OmschrijvingKort: "Any Short Description",
        Omschrijving: "Any Description with é",
        DC: "D",
        Nivo: 2,
        Parents: []
    }

    account = new LedgerAccount(data)
    expect(account.matchDescription("any")).toEqual(true)
    expect(account.matchDescription("anyOther")).toEqual(false)
    expect(account.matchDescription("with e")).toEqual(true)

    expect(account.reverseCode).toEqual(data.ReferentieOmslagcode)
    data.ReferentieOmslagcode = null
    account = new LedgerAccount(data)
    expect(account.reverseCode).toEqual("")

    expect(account.matchText("Short")).toEqual(true)
    expect(account.matchText("abc")).toEqual(true)
    expect(account.matchText("def")).toEqual(false)

    expect(account.isRevenue).toEqual(false)
    expect(account.isExpense).toEqual(true)

    data.DC = "C"
    expect(account.isRevenue).toEqual(true)
    expect(account.isExpense).toEqual(false)

    expect(account.isUnmapped()).toEqual(false)

    let dataChild = { ...data, Referentiecode: "WAbcDef"}
    let accountChild = new LedgerAccount(dataChild)
    expect(accountChild.isChildOf(mocked.ledgerAccountA)).toEqual(false)
    expect(accountChild.isChildOf(account)).toEqual(true)

    expect(accountChild.isBankAccount()).toEqual(false)
    expect(accountChild.isBalanceAccount()).toEqual(false)

    dataChild = { ...data, Referentiecode: LEDGER_ACCOUNT.BALANCE_ACCOUNT + "123"}
    accountChild = new LedgerAccount(dataChild)

    expect(accountChild.isBankAccount()).toEqual(false)
    expect(accountChild.isBalanceAccount()).toEqual(true)

    dataChild = { ...data, Referentiecode: LEDGER_ACCOUNT.BANK_ACCOUNT + "123"}
    accountChild = new LedgerAccount(dataChild)

    expect(accountChild.isBankAccount()).toEqual(true)
    expect(accountChild.isBalanceAccount()).toEqual(true)


})