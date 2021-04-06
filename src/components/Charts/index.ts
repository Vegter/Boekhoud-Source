import { BankAccount } from "../../types/LiquidAssets/BankAccount"
import { StatementEntry } from "../../types/LiquidAssets/StatementEntry"
import { Amount } from "../../types/Amount"
import { LedgerAccount } from "../../types/Ledger/LedgerAccount"
import { AccountSummaryMap } from "../../types/AccountSummaryMap"
import { LiquidAssets } from "../../types/LiquidAssets/LiquidAssets"
import { DateString } from "../../types/DateString"
import { ExpenseRevenueChartData } from "./ExpenseRevenueChart"
import { LedgerAllocationMap } from "../../types/Allocation/LedgerAllocationMap"
import { ChartColor } from "./config"

const amountFormat = (value: number) => Amount.formatValue(value, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
})

const dateFormat = (value: DateString) => value.format({month: 'short', year: '2-digit'})

export function getQualitativeColor(i: number) {
    return ChartColor.qualitativeColors[i % ChartColor.qualitativeColors.length]
}

export function getPieChartOptions(title: string) {
    return {
        title: {
            display: true,
            text: title
        }
    }
}

export function getLineChartOptions(title: string) {
    return {
        title: {
            display: true,
            text: title
        },
        tooltips: {
            displayColors: false,
            callbacks: {
                title: function(tooltipItem: any, data: any) {
                    const index = tooltipItem[0].index
                    return data.labels[index].format()
                },
                label: function(tooltipItem: any) {
                    return amountFormat(tooltipItem.yLabel);
                }
            }
        },
        legend: {
            display: false,
        },
        scales: {
            xAxes: [{
                ticks: {
                    callback: dateFormat
                }
            }],
            yAxes: [{
                ticks: {
                    callback: amountFormat
                }
            }],
        }
    }
}

export function getBarChartOptions(title: string) {
    return {
        tooltips: {
            displayColors: false,
            callbacks: {
                label: function(tooltipItem: any, data: any) {
                    let label = data.datasets[tooltipItem.datasetIndex].label || '';

                    if (label) {
                        label += ' ';
                    }
                    label += amountFormat(tooltipItem.yLabel)
                    return label;
                }
            }
        },
        title: {
            display: true,
            text: title
        },
        legend: {
            fullWidth: false,
            labels: {
                fontSize: 10,
                boxWidth: 10
            }
        },
        scales: {
            xAxes: [{
            }],
            yAxes: [{
                ticks: {
                    callback: amountFormat
                }
            }],
        }
    }
}

export function getBankAccountData(bankAccount: BankAccount) {
    const statementEntries = bankAccount.statementEntryMap.statementEntries

    const getKey = (entry: StatementEntry) =>
        entry.accountStatement.closingBalance.date.string

    const getData = (entry: StatementEntry) => ({
        label: entry.accountStatement.closingBalance.date,
        value: entry.accountStatement.closingBalance.amount.value
    })

    const chartData = statementEntries.reduce((result, statementEntry) => {
        const key = getKey(statementEntry)
        if (!result[key]) {
            result[key] = getData(statementEntry)
        }
        return result
    }, {} as Record<string, ReturnType<typeof getData>>)

    const keys = Object.keys(chartData).sort()

    return keys.map(key => chartData[key])
}

export function getProfitLossData(summaryMap: AccountSummaryMap, accounts: LedgerAccount[]) {

    const getKey = (account: LedgerAccount) =>
        account.code

    const getData = (account: LedgerAccount) => ({
        label: account.shortDescription,
        value: summaryMap.getAccountSummary(account).balance
    })

    const chartData = accounts.reduce((result, account) => {
        if (account.isBankAccount()) {
            return result
        }
        const key = getKey(account)
        const data = getData(account)
        if (!result[key]) {
            result[key] = getData(account)
        } else {
            result[key].value = result[key].value.add(data.value)
        }
        return result
    }, {} as Record<string, ReturnType<typeof getData>>)

    return Object.values(chartData)
        .filter(v => ! v.value.isZero())
        .sort((v1, v2) => Math.abs(v2.value.value) - Math.abs(v1.value.value))
}

export function getAllocationsData(allocations: LedgerAllocationMap) {
    const [mapped, unmapped] = allocations.getMappedUnmapped()

    const mappedAllocations = (mapped / (mapped + unmapped)) * 100
    const unmappedAllocations = 100 - mappedAllocations
    const perc = (value: number) => `${Math.round(value,)}%`

    const { warmGreen, warmRed } = ChartColor
    const colors = [warmGreen, warmRed]

    return {
        labels: [
            `Toegewezen ${perc(mappedAllocations)}`,
            `Nog toe te wijzen ${perc(unmappedAllocations)}`
        ],
        datasets: [{
            data: [
                mapped,
                unmapped
            ],
            backgroundColor: colors,
            hoverBackgroundColor: colors
        }]
    };
}

export function getCounterPartiesData(liquidAssets: LiquidAssets) {

    const statementEntries = liquidAssets.getStatementEntryMap().statementEntries

    const getKey = (entry: StatementEntry) =>
        entry.relatedParties.toLowerCase().trim()

    const getData = (entry: StatementEntry) => ({
        label: entry.relatedParties,
        value: entry.amount
    })

    const chartData = statementEntries.reduce((result, statementEntry) => {
        const key = getKey(statementEntry)
        const data = getData(statementEntry)
        if (!result[key]) {
            result[key] = data
        } else {
            result[key].value = result[key].value.add(data.value)
        }
        return result
    }, {} as Record<string, ReturnType<typeof getData>>)

    return Object.values(chartData)
        .filter(v => v.label && ! v.value.isZero())
        .sort((v1, v2) => Math.abs(v2.value.value) - Math.abs(v1.value.value))
}

export function splitData(data: ExpenseRevenueChartData) {
    return data.reduce((result, data) => {
        if (data.value.isZero()) return result
        if (data.value.value > 0) {
            result[1].push(data)
        } else {
            result[0].push(data)
        }
        return result
    }, [[], []] as [ExpenseRevenueChartData, ExpenseRevenueChartData])
}


