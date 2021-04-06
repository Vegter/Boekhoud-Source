import { JournalEntry } from "./Journal/JournalEntry"
import { Amount, CreditDebit } from "./Amount"
import { LedgerAccount } from "./Ledger/LedgerAccount"
import { EntryLeg } from "./Journal/EntryLeg"
import { LedgerScheme } from "./Ledger/LedgerScheme"
import { sortedArray } from "../services/utils"
import { LEDGER_ACCOUNT } from "../config"

type Booking = {
    journalEntry: JournalEntry
    leg: EntryLeg
}

interface AccountSummary {
    account: LedgerAccount,
    bookings: Booking[],
    debitAmount: Amount,
    creditAmount: Amount,
    debitBalance: Amount,
    creditBalance: Amount,
    balance: Amount,
}

export type SummaryMap = Record<string, AccountSummary>

/**
 * Provide for a summary of the journalEntries per ledgerAccount
 *
 * For each ledgerAccount the amounts and balances are calculated
 * A reference to the journalEntries and legs is included in the summary
 */
export class AccountSummaryMap {
    accountSummaryMap: SummaryMap

    /**
     * Create a new AccountSummaryMap for the given journalEntries
     */
    constructor(journalEntries: JournalEntry[]) {
        this.accountSummaryMap = {}

        journalEntries.forEach(journalEntry => {
            journalEntry.legs.forEach(leg => {
                this.update(journalEntry, leg)
            })
        })

        this.updateBalance()
    }

    /**
     * Update the accountSummary for the given journalEntry and leg
     */
    private update = (journalEntry: JournalEntry, leg: EntryLeg )  => {
        const summary = this.getAccountSummary(leg.ledgerAccount, leg.amount.currency)

        const legAmount = new Amount(leg.amount);

        summary.bookings.push({ journalEntry, leg })

        summary.balance = summary.balance.add(legAmount)

        if (leg.amount.creditDebit === CreditDebit.Credit) {
            summary.creditAmount = summary.creditAmount.add(legAmount)
        } else {
            summary.debitAmount = summary.debitAmount.add(legAmount)
        }
    }

    /**
     * Update the credit- and debit balances in the accountSummary
     *
     * The balance is simply a debitBalance if the total balance is debit and a creditBalance in the reverse case
     */
    private updateBalance() {
        Object.values(this.accountSummaryMap).forEach(summary => {
            if (summary.balance.creditDebit === CreditDebit.Credit) {
                summary.creditBalance = summary.balance
            } else {
                summary.debitBalance = summary.balance
            }
        })
    }

    /**
     * Return a new fresh summary to gather account statistics
     */
    private static getNewSummary(account: LedgerAccount, currency: string = ""): AccountSummary {
        return {
            account,
            bookings: [],
            debitAmount: Amount.fromAmountCurrency(0, currency),
            creditAmount: Amount.fromAmountCurrency(0, currency),
            debitBalance: Amount.fromAmountCurrency(0, currency),
            creditBalance: Amount.fromAmountCurrency(0, currency),
            balance: Amount.fromAmountCurrency(0, currency),
        }
    }

    /**
     * Get an account summary for the given ledgerAccount
     *
     * An optional currency can be provided to initialise a summary (used internally)
     */
    getAccountSummary(account: LedgerAccount, currency: string = ""): AccountSummary {
        const summaryMap = this.accountSummaryMap
        const key = account.code

        if (! summaryMap[key]) {
            summaryMap[key] = AccountSummaryMap.getNewSummary(account, currency)
        }
        return summaryMap[key]
    }

    /**
     * Get the ledgerAccounts for which a summary is available
     */
    getAccounts(): LedgerAccount[] {
        const accounts = Object.entries(this.accountSummaryMap)
            .filter(([_, summary]) => summary.bookings.length > 0)
            .map(([accountCode, _]) => LedgerScheme.getAccount(accountCode))
        return sortedArray(accounts, (account: LedgerAccount) => {
            const primary = {
                [LEDGER_ACCOUNT.BALANCE_ACCOUNT]: 1,
                [LEDGER_ACCOUNT.REVENUE_CATEGORY]: 2,
                [LEDGER_ACCOUNT.EXPENSE_CATEGORY]: 3
            }[account.category]
            return `${primary}.${account.sortKey}`
        })
    }

    /**
     * Get the total for all ledgerAccounts
     *
     * Normally the balance of the totalisation is 0
     */
    getTotalisation(filter: (account: LedgerAccount) => boolean = () => true): AccountSummary {
        // The currency of the totalisation is automatically set by the Amount.add method
        const total = AccountSummaryMap.getNewSummary(LedgerScheme.unmapped) // Not bound to any account
        Object.values(this.accountSummaryMap)
            .forEach(summary => {
                if (filter(summary.account)) {
                    total.debitAmount = total.debitAmount.add(summary.debitAmount)
                    total.creditAmount = total.creditAmount.add(summary.creditAmount)
                    if (summary.balance.creditDebit === CreditDebit.Credit) {
                        total.creditBalance = total.creditBalance.add(summary.balance)
                    } else {
                        total.debitBalance = total.debitBalance.add(summary.balance)
                    }
                    total.balance = total.balance.add(summary.balance)
                }
            })
        return total
    }
}
