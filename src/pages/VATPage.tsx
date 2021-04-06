import React from 'react'
import PageHeader from "./PageHeader"
import { Routes } from "../routes/routes"
import { useDispatch, useSelector } from "react-redux"
import { selectPeriodFilter, selectVATPeriod, setVATPeriod } from "../app/FilterSlice"
import { selectJournal } from "../app/AccountingSlice"
import { VATDeclarationPeriod } from "../types/VAT/VATDeclarationPeriod"
import VATPeriodSelector from "../components/VAT/VATPeriodSelector"
import VATDeclarationView from "../components/VAT/VATDeclarationView"

function VATPage() {
    const dispatch = useDispatch()

    const vatPeriod = useSelector(selectVATPeriod)
    const periodFilter = useSelector(selectPeriodFilter)
    const journal = useSelector(selectJournal).filterOnPeriod(periodFilter)
    const periods = journal.distinctPeriods()

    const onVATPeriod = (vatPeriod: VATDeclarationPeriod | null) =>
        dispatch(setVATPeriod({vatPeriodData: vatPeriod ? vatPeriod.data : null}))

    return (
        <div>
            <PageHeader title={Routes.VAT}/>

            <VATPeriodSelector periods={periods} period={vatPeriod} onPeriod={onVATPeriod}/>

            {vatPeriod && <VATDeclarationView journal={journal} period={vatPeriod}/>}
        </div>
    )
}

export default VATPage;
