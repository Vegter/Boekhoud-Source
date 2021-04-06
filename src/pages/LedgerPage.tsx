import React, { useMemo } from 'react'

import { LedgerScheme } from "../types/Ledger/LedgerScheme"
import { Routes } from "../routes/routes"

import LedgerViewer from "../components/LedgerScheme"
import PageHeader from "./PageHeader"

function LedgerPage() {
    const accounts = useMemo(() => LedgerScheme.ledgerAccounts.filter(a => !a.isUnmapped()), [])

    return (
        <div>
            <PageHeader title={Routes.Ledger} periodFilter={false} withName={false}/>
            <LedgerViewer accounts={accounts}/>
        </div>
    );
}

export default LedgerPage;