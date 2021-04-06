declare module 'comlink-loader!*' {

    class WebpackWorker extends Worker {
        constructor()

        getBankAccountChartData(environment: EnvironmentData,
                                _bankAccount: BankAccount): Promise<BankAccountChartData>

        getAllocationRows(environment: EnvironmentData,
                          allocations: LedgerAllocation[],
                          viewPort: number,
                          allocationFilter: AllocationFilter): Promise<LedgerAllocation[]>
    }

    export = WebpackWorker;
}
