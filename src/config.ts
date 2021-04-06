import dateFormat from "dateformat"
import packageJson from "../package.json"
import preval from "preval.macro"

const dateTimeStamp = preval`module.exports = new Date()`

export class LEDGER_ACCOUNT {
    static readonly BALANCE_ACCOUNT = "B"
    static readonly PROFITLOSS_ACCOUNT = "W"
    static readonly REVENUE_CATEGORY = LEDGER_ACCOUNT.PROFITLOSS_ACCOUNT + "+"
    static readonly EXPENSE_CATEGORY = LEDGER_ACCOUNT.PROFITLOSS_ACCOUNT + "-"
    static readonly BANK_ACCOUNT = "BLimBan"
    static readonly UNMAPPED_ACCOUNT = "BXxx"
    static readonly ACCRUED_EXPENSE = "BSchOpaNtb"  // Expenses left to be paid
    static readonly ACCRUED_REVENUE = "BVorOvaNov"  // Revenues left to be received
    static readonly VAT_TO_BE_CLAIMED = "BVorVbkTvo"
    static readonly VAT_TO_BE_PAID = "BSchBepBtw"
    static readonly PAYMENT_DIFFERENCES = "WBedAdlBet"
    static readonly VAT_PRIVATE_USE = "WBedAutBop"
}

export const LOCALE = 'nl-NL'
export const DEFAULT_CURRENCY = 'EUR'

export const APP = {
    TITLE: "Boekhoud Source",
    KEY: "BkhdSrc",
    VERSION: packageJson.version,
    BUILD: dateFormat(dateTimeStamp, "yyyy-mm-dd HH:MM"),
    STATE: "Beta",
    SOURCE: "https://github.com/Vegter/Boekhoud-Source"
}

export const RGS_API_BASE_URL = "http://localhost:8000"

const LOCAL_BASE_URL = `/Boekhoud-Source`

export function localPath(path: string) {
    return `${LOCAL_BASE_URL}${path}`
}
