import assert from "assert"

import { JournalEntry } from "./JournalEntry"
import { PeriodFilter } from "../PeriodFilter"
import { JournalEntryData, JournalEntryMapData } from "../../model"
import { DataMapping } from "../DataMapping"
import { Period } from "../Period"
import { EntryLeg } from "./EntryLeg"

/**
 * A Journal is a collection of JournalEntries indexed on id
 */
export class Journal extends DataMapping<JournalEntryMapData, JournalEntryData> {

    /**
     * Return a list of all JournalEntries in the Journal
     */
    get journalEntries(): JournalEntry[] { return this.getItems(JournalEntry) }

    /**
     * Get the JournalEntry with the given id
     * @throws Throws an AssertionError if the id can not be found
     */
    getJournalEntry(id: string): JournalEntry {
        assert(this.hasItem(id))
        return this.getItem(JournalEntry, id)
    }

    hasJournalEntry(id: string): boolean {
        return this.hasItem(id)
    }

    public reversed(): Journal {
        const reversedLegs = (entryData: JournalEntryData) => ({
            ...entryData,
            entryLegsData: entryData.entryLegsData.map(data => new EntryLeg(data).reversed().data)
        })
        return this.modify(Journal, reversedLegs)
    }

    /**
     * Return a sorted list of Periods that occur in the journal
     */
    public distinctPeriods(): Period[] {
        const getPeriod = (_: string, data: JournalEntryData) => data.period
        return this
            .distinctValues(getPeriod)
            .sort()
            .map(data => new Period(data))
    }

    /**
     * Get a new (filtered) journal with only entries that match the given periodFilter
     */
    public filterOnPeriod(periodFilter: PeriodFilter): Journal {
        const matchesPeriodFilter = (_: string, journalEntryData: JournalEntryData) =>
            periodFilter.periodInRange(new JournalEntry(journalEntryData).period)
        return this.filter(Journal, matchesPeriodFilter)
    }

    /**
     * Get a new (modified) journal with only legs that are of the specified ledgerAccount
     */
    public filterOnAccount(filterLeg: (leg: EntryLeg) => boolean): Journal {
        const ledgerAccountLegsOnly = (entry: JournalEntryData) => ({
            ...entry,
            entryLegsData: new JournalEntry(entry).legs.filter(filterLeg).map(l => l.data)
        })
        return this.modify(Journal, ledgerAccountLegsOnly)
    }

    /**
     * Add a journalEntry to the Journal (only if the entry does not yet exist)
     */
    public add(journalEntry: JournalEntry): void {
        this.addItemIfNotExists(journalEntry.id, journalEntry.data)
    }

    /**
     * Remove the given journalEntry from the Journal
     */
    remove(journalEntry: JournalEntry): void {
        this.delItem(journalEntry.id)
    }
}
