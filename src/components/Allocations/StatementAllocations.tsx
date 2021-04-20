import React, { useEffect, useMemo, useState } from 'react'

import InfiniteScroll from "react-infinite-scroller"

import { LedgerAllocation} from "../../types/Allocation/LedgerAllocation"
import { LedgerAllocationMap } from "../../types/Allocation/LedgerAllocationMap"
import { StatementEntryMap } from "../../types/LiquidAssets/StatementEntryMap"
import Worker from '../Workers'
import { Environment } from "../../types/Environment"
import { useURLState } from "../useURLState"
import { AllocationFilter } from "../../types/AllocationFilter"
import AllocationsHeader from "./AllocationsHeader"
import AllocationsTable from "./AllocationsTable"

interface StatementAllocationsProps {
    statements: StatementEntryMap
    allocations: LedgerAllocationMap
}

function StatementAllocations(props: StatementAllocationsProps) {
    const LOAD_PER = 25

    const { allocations } = props

    const [viewPort, setViewPort] = useState(LOAD_PER)
    const [rows, setRows] = useState<LedgerAllocation[]>([])
    const [loading, setLoading] = useState(true)

    // Get the filterValues from the URL
    const [urlState, ] = useURLState()
    const periodId = urlState.getStringValue("periodId") || null
    const ledgerAccountCode = urlState.getStringValue("ledgerAccountCode") || null
    const allocationFilter = useMemo(
        () => new AllocationFilter({periodId, ledgerAccountCode}),
        [periodId, ledgerAccountCode]
    )

    useEffect(() => {
        const update = async () => {
            const instance = new Worker();
            const result = await instance.getAllocationRows(
                new Environment().data,
                allocations.allocations,
                viewPort,
                allocationFilter
            ) as LedgerAllocation[]

            setRows(result.map(allocation => new LedgerAllocation(allocation.data)))
            setLoading(false)
        }

        setLoading(true)
        update().catch(e => console.error("Failed to load statement allocation data", e))
    }, [allocations, allocationFilter, viewPort])

    const hasMore = !loading && viewPort < allocations.length
    const loadMore = () => {
        setLoading(true)
        setViewPort(viewPort + LOAD_PER)
    }

    const isLoading = viewPort === 0 || (loading && rows.length === 0)
    const loader = <div key={1}>Laden...</div>

    return (
        <div>
            <AllocationsHeader key={Math.random()}
                               allocations={allocations}
                               allocationFilter={allocationFilter}/>

            <InfiniteScroll loader={loader}
                            pageStart={0}
                            hasMore={hasMore}
                            loadMore={loadMore}>

                <AllocationsTable allocations={allocations}
                                  allocationFilter={allocationFilter}
                                  rows={rows}
                                  isLoading={isLoading}/>

            </InfiniteScroll>
        </div>
    );
}

export default StatementAllocations