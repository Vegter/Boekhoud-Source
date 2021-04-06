import { LedgerScheme } from "./LedgerScheme"
import { LedgerAccountData } from "../../model"
import { LEDGER_ACCOUNT } from "../../config"
import { removeDiacritics } from "../../services/utils"

/**
 * LedgerAccount
 *
 * A ledger account is used to record business transactions.
 */
export class LedgerAccount {

    constructor(readonly data: LedgerAccountData) {}

    /**
     * A ledgerAccount is uniquely identified by its code
     */
    get code(): string { return this.data.Referentiecode }

    /**
     * A ledgerAccount is uniquely identified by its code
     */
    get reverseCode(): string { return this.data.ReferentieOmslagcode || "" }

    /**
     * A ledgerAccount has a level in the ledgerScheme hierarchy
     */
    get level(): number { return this.data.Nivo }

    /**
     * The description of the ledgerAccount
     */
    get description(): string { return this.data.Omschrijving }

    /**
     * A short description of the ledgerAccount
     */
    get shortDescription(): string { return this.data.OmschrijvingKort }

    /**
     * Tells whether the account is a debit (D) or credit (C) account
     * The highest level accounts (Balance and ProfitLoss) do not have a side
     */
    get side(): string | undefined { return this.data.DC?.toUpperCase() }

    /**
     * A property of the ledgerAccount to sort ledgerAccounts
     */
    get sortKey(): string {
        if (this.data.Sortering) {
            return this.data.Sortering
        } else {
            switch(this.data.Referentiecode) {
                case LEDGER_ACCOUNT.BALANCE_ACCOUNT: {
                    return "0"
                }
                case LEDGER_ACCOUNT.PROFITLOSS_ACCOUNT: {
                    return "N"
                }
            }
        }
        return this.data.Sortering
    }

    /**
     * Tells whether the account is an account to book revenues
     */
    get isRevenue(): boolean { return this.data.Referentiecode[0] === 'W' && this.data.DC === "C" }

    /**
     * Tells whether the account is an account to book expenses
     */
    get isExpense(): boolean { return this.data.Referentiecode[0] === 'W' && this.data.DC === "D" }

    /**
     * An account is part of a hierarchy.
     * The hierarchy is returned in a sorted list of ledgerAccounts, up to the highest level
     */
    get parents(): LedgerAccount[] {
        return this.data.Parents.map(data => LedgerScheme.getAccount(data.Referentiecode))
    }

    /**
     * Returns the parent LedgerAccount if a parent exists, else undefined
     */
    get parent(): LedgerAccount | null {
        const parents = this.parents
        return parents.length > 0 ? parents[0] : null
    }

    /**
     * Tells whether the account can be used to allocate transactions
     */
    get isAllocatable(): boolean { return [4].includes(this.level) || this.code === UNMAPPED_ACCOUNT.code}

    /**
     * Tells whether the account is a child of the given ledgerAccount
     */
    isChildOf(ledgerAccount: LedgerAccount): boolean {
        return this.code.indexOf(ledgerAccount.code) === 0
    }

    /**
     * Tells whether the account is an account that can be associated with a bankAccount
     */
    isBankAccount(): boolean {
        return this.code.indexOf(LEDGER_ACCOUNT.BANK_ACCOUNT) === 0
    }

    /**
     * Tells whether the account is balance account
     * If not, the account is a expense- and revenues account
     */
    isBalanceAccount(): boolean {
        return this.code.indexOf(LEDGER_ACCOUNT.BALANCE_ACCOUNT) === 0
    }

    get category(): string {
        if (this.isBalanceAccount()) {
             return LEDGER_ACCOUNT.BALANCE_ACCOUNT
        } else if (this.isRevenue) {
             return LEDGER_ACCOUNT.REVENUE_CATEGORY
        } else if (this.isExpense) {
             return LEDGER_ACCOUNT.EXPENSE_CATEGORY
        } else {
            return ""
        }
    }

    /**
     * Tells whether the account is an account that is yet unmapped
     * Unmapped means that the account is not part of the regular ledgerScheme accounts
     * Transactions that are booked on this account need still to be allocated
     */
    isUnmapped(): boolean {
        return this.code === UNMAPPED_ACCOUNT.code
    }

    /**
     * Tells whether the account is equal to an another account
     */
    public equals(other: LedgerAccount): boolean {
        return other.code === this.code
    }

    /**
     * Returns a method that can be used to sort a list of ledgerAccounts
     */
    static get sortKey() {
        return (account: LedgerAccount) => account.sortKey
    }

    /**
     * Tells whether the text matches the description of the ledgerAccount
     * Any diacritics in the description are ignored
     */
    matchDescription(text: string) {
        return removeDiacritics(this.description).toLowerCase().includes(text)
    }

    /**
     * Tells whether any value of the ledgerAccount matched the given text
     * Any diacritics in the ledgerAccount values are ignored
     */
    matchText(text: string) {
        return removeDiacritics(Object.values(this.data)
            .map(data => String(data))
            .map(s => s.toLowerCase())
            .join("")
            ).includes(text.toLowerCase())
    }
}

/**
 * A special ledgerAccount that can be used to book transactions that still need to be
 * allocated to a ledgerScheme account
 */
export const UNMAPPED_ACCOUNT = new LedgerAccount({
    Referentiecode: LEDGER_ACCOUNT.UNMAPPED_ACCOUNT,
    ReferentieOmslagcode: null,
    Sortering: "0",
    Referentienummer: "0",
    OmschrijvingKort: "Nog te boeken",
    Omschrijving: "Nog te boeken",
    DC: null,
    Nivo: 2,
    Parents: []
})
