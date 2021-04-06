import React from 'react';
import { useSelector } from "react-redux";

import { selectJournal } from "../app/AccountingSlice"
import { selectPeriodFilter } from "../app/FilterSlice"

import { Routes } from "../routes/routes"

import Journals from "../components/Journals"
import PageHeader from "./PageHeader"

function JournalPage() {

    const journal = useSelector(selectJournal)
    const periodFilter = useSelector(selectPeriodFilter)

    const filteredJournal = journal.filterOnPeriod(periodFilter)

    return (
        <div>
            <PageHeader title={Routes.Journal}/>
            <Journals journal={filteredJournal}/>
        </div>
    );
}

export default JournalPage;