import assert from "assert"

import { LEDGER_ACCOUNT, RGS_API_BASE_URL } from "../../config"
import json from "../../rgsBasis.json"

import { LedgerAccount, UNMAPPED_ACCOUNT } from "./LedgerAccount"
import { LedgerAccountData } from "../../model"
import { Amount, CreditDebit } from "../Amount"
import { clear, memoize } from "../../services/memoize"
import { sortedArray } from "../../services/utils"

export type LedgerSchemeData = Record<string, LedgerAccount>

/**
 * LedgerScheme
 *
 * the Reference Classification System of Financial Information (RCSFI) or in Dutch “Referentie GrootboekSchema” (RGS)
 * It contains all the ledgers which are required to report to the Dutch government
 * and most of the ledgers used for internal reporting
 *
 * The data is either received from an API or provided locally
 */
export abstract class LedgerScheme {

    /**
     * The address of the API to receive the RGS scheme
     */
    private static readonly URL = RGS_API_BASE_URL + "/rgs?Basis"

    /**
     * The actual LedgerScheme, a dictionary that maps a LedgerAccount id to a LedgerAccount
     */
    private static ledgerAccountMap: LedgerSchemeData = {}

    /**
     * Any orphans that have been identified while loading the data.
     * Orphans are ledger accounts that have no parent ledger account in the ledger account scheme
     */
    public static orphans: LedgerAccount[] = []

    /**
     * The default account to book any bank statements
     */
    public static DefaultBankAccountCode = LEDGER_ACCOUNT.BANK_ACCOUNT

    /**
     * Loads the RGS data, either by using an API or by using locally stored data (useLocalJSON = true)
     *
     * Default behaviour is to use locally stored data
     */
    public static async load(useLocalJSON: boolean = true): Promise<void> {
        // import summaryMap
        let rgsData = await this.fetchData(useLocalJSON)

        // Add unmapped account(s) as first accounts in the list
        rgsData = [UNMAPPED_ACCOUNT.data].concat(rgsData)

        // Connect each account to its parent
        this.connectToParents(rgsData)

        // Store ledger scheme
        this.storeLedgerScheme(rgsData)
    }

    /**
     * Returns the data of the ledgerScheme, being the ledgerAccountMap
     */
    public static get Data(): typeof LedgerScheme.ledgerAccountMap {
        return this.ledgerAccountMap
    }

    /**
     * Restore data from a saved ledgerAccountMap
     *
     * This method is "Worker-safe". The ledgerAccountMap is entirely restored from its data
     */
    public static set Data(data: typeof LedgerScheme.ledgerAccountMap) {
        this.storeLedgerScheme(Object.values(data).map((v: LedgerAccount) => v.data))
    }

    /**
     * Fetch the RGS data from an API or a local JSON file
     */
    private static async fetchData(useLocalJSON: boolean): Promise<LedgerAccountData[]> {
        if (useLocalJSON && json) {
            return json as LedgerAccountData[]
        } else {
            const data = await fetch(this.URL)
            return await data.json() as LedgerAccountData[]
        }
    }

    @memoize()
    /**
     * Returns an array with all account levels present in the LedgerScheme
     */
    static Levels(): number[] {
        return Object.values(
            this.ledgerAccounts.reduce((result, account) => {
                result[account.level] = account.level
                return result
            }, {} as Record<number, number>))
    }

    @memoize()
    /**
     * Returns an array with all account sides (debit or credit) present in the LedgerScheme
     */
    static Sides(): string[] {
        return Object.values(
            this.ledgerAccounts.reduce((result, account) => {
                if (account.side) {
                    result[account.side] = account.side
                }
                return result
            }, {} as Record<string, string>))
    }

    static getMatchingAccounts(accounts: LedgerAccount[], searchText: string, includeParents: boolean) {
        const result = new Set<LedgerAccount>()
        accounts.forEach(account => {
            if (account.matchText(searchText)) {
                result.add(account)
                if (includeParents) {
                    account.parents.forEach(parent => result.add(parent))
                }
            }
        })
        return sortedArray(Array.from(result), a => a.sortKey)
    }

    @clear()
    /**
     * Initialize the ledger scheme data from a list of ledgerAccount data
     */
    private static storeLedgerScheme(ledgerAccounts: LedgerAccountData[]): void {
        this.ledgerAccountMap = ledgerAccounts.reduce((result, data) => {
            const account = new LedgerAccount(data)
            result[account.code] = account
            return result
        }, {} as typeof LedgerScheme.ledgerAccountMap)
    }

    @memoize()
    /**
     * Returns a list of all LedgerAccounts in the LedgerScheme
     */
    public static get ledgerAccounts(): LedgerAccount[] {
        return sortedArray(Object.values(LedgerScheme.ledgerAccountMap), acc => acc.sortKey)
    }

    @memoize()
    /**
     * Returns a list of LedgerAccounts in the LedgerScheme that are valid to allocate expenses and revenues
     */
    public static get allocatableAccounts(): LedgerAccount[] {
        return this.ledgerAccounts.filter(account => account.isEditable)
    }

    @memoize()
    /**
     * Returns a list of LedgerAccounts in the LedgerScheme that are valid as LedgerAccount for BankAccount transactions
     */
    public static get bankAccounts(): LedgerAccount[] {
        return this.ledgerAccounts.filter(
            account => account.code === LedgerScheme.DefaultBankAccountCode ||
            (account.isAllocatable && account.isBankAccount())
        )
    }

    @memoize()
    /**
     * Returns a list of LedgerAccounts in the LedgerScheme that are balance accounts
     *
     * Not being profitLoss accounts or bank accounts
     */
    public static get balanceAccounts(): LedgerAccount[] {
        return this.allocatableAccounts
            .filter(account => account.isBalanceAccount())
            .filter(account => !account.isBankAccount())
    }

    /**
     * Returns the LedgerAccount to book transactions that need still to be allocated
     */
    public static get unmapped(): LedgerAccount {
        return this.getAccount(LEDGER_ACCOUNT.UNMAPPED_ACCOUNT)
    }

    /**
     * Get the account to register accruals
     *
     * Based upon the amount (positive or negative) a revenue or expense accruals account is returned
     */
    public static getAccrualsAccount(amount: Amount): LedgerAccount {
        if (amount.creditDebit === CreditDebit.Credit) {
            return this.getAccount(LEDGER_ACCOUNT.ACCRUED_REVENUE)
        } else {
            return this.getAccount(LEDGER_ACCOUNT.ACCRUED_EXPENSE)
        }
    }

    /**
     * Get the LedgerAccount who's code is equal to the given code
     */
    public static getAccount(code: string): LedgerAccount {
        assert(code in this.ledgerAccountMap)
        return this.ledgerAccountMap[code]
    }

    /**
     * Connect the given LedgerAccounts to their parents
     *
     * Any LedgerAccounts without parents are registered as orphans
     */
    private static connectToParents(accounts: LedgerAccountData[]): void {
        this.orphans = []

        // Sort accounts on level, ascending
        accounts.sort((a1, a2) => a1.Nivo - a2.Nivo)

        // Connect accounts to parents
        for (let account of accounts) {
            account.Parents = []
            const parent = accounts.find(c =>
                c.Nivo === (account.Nivo - 1) &&
                account.Referentiecode.indexOf(c.Referentiecode) === 0
            ) || null
            if (parent === null) {
                if (account.Nivo > 1) {
                    // Level 1 is the lowest level, above this level a parent account is expected
                    this.orphans.push(new LedgerAccount(account))
                    console.warn(`Missing parent for ${account.Referentiecode}`)
                }
            } else {
                account.Parents.push(parent)
            }
        }

        // Determine full list of parents
        accounts.forEach(account => {
            const parent = account.Parents[0]
            account.Parents = parent ? [parent].concat(parent.Parents) : []
        })
    }
}