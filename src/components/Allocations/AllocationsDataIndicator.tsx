import React from 'react'
import { Button } from "@material-ui/core"
import { LedgerScheme } from "../../types/Ledger/LedgerScheme"
import { AllocationFilter } from "../../types/AllocationFilter"
import { useURLState } from "../useURLState"

interface AllocationsDataIndicatorProps {
    isLoading: boolean
    noData: boolean
    allocationFilter: AllocationFilter
}

function AllocationsDataIndicator(props: AllocationsDataIndicatorProps) {
    const { isLoading, noData, allocationFilter } = props
    const { ledgerAccountCode, period } = allocationFilter
    const [, setURLState] = useURLState()

    function onAccountClear() {
        setURLState({ledgerAccountCode: null})
    }

    function onPeriodClear() {
        setURLState({periodId: null})
    }

    return (
        <div>
            {isLoading &&
            <div>
                Loading...
            </div>}
            {noData &&
            <div>
                Geen data gevonden
                <div>
                    {ledgerAccountCode &&
                    <p><Button size={"small"} color={"primary"}
                                 onClick={() => onAccountClear()}>
                        Wis filter op grootboek
                        : {LedgerScheme.getAccount(ledgerAccountCode).shortDescription}
                    </Button></p>}
                    {period &&
                    <p><Button size={"small"} color={"primary"}
                                 onClick={() => onPeriodClear()}>
                        Wis filter op periode
                        : {period.string}
                    </Button></p>}
                </div>
            </div>}
        </div>
    )
}

export default AllocationsDataIndicator