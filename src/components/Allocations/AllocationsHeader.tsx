import React from 'react'
import { Grid } from "@material-ui/core"
import PeriodSelect from "../Selectors/PeriodSelect"
import AccountSelect from "../Selectors/AccountSelect"
import { LedgerAccount } from "../../types/Ledger/LedgerAccount"
import { Period } from "../../types/Period"
import { AllocationFilter } from "../../types/AllocationFilter"
import { useURLState } from "../useURLState"
import { LedgerAllocationMap } from "../../types/Allocation/LedgerAllocationMap"

interface AllocationsHeaderProps {
    allocations: LedgerAllocationMap
    allocationFilter: AllocationFilter
}

function AllocationsHeader(props: AllocationsHeaderProps) {
    const { allocations, allocationFilter } = props
    const [, setURLState] = useURLState()

    function onAccountSelect(ledgerAccount: LedgerAccount | null) {
        const ledgerAccountCode = ledgerAccount ? ledgerAccount.code : null
        setURLState({ledgerAccountCode})
    }

    function onPeriodSelect(period: Period | null) {
        const periodId = period ? period.id : null
        setURLState({periodId})
    }

    const width = 200

    return (
        <Grid container spacing={1} direction={"row"} alignItems={"center"} justify={"center"}>

            <Grid item>
            <PeriodSelect title={"Kies Periode"}
                          width={width}
                          allocations={allocations}
                          allocationFilter={allocationFilter}
                          onPeriod={onPeriodSelect} />
            </Grid>

            <Grid item>
            <AccountSelect title={"Kies Grootboek"}
                           width={width}
                           allocations={allocations}
                           allocationFilter={allocationFilter}
                           onAccount={onAccountSelect} />
            </Grid>

        </Grid>
    )
}

export default AllocationsHeader
