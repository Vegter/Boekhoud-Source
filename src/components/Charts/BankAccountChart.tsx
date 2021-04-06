import React, { useEffect, useState } from 'react'
import { Line } from "react-chartjs-2"
import { getLineChartOptions } from "./index"
import { BankAccount } from "../../types/LiquidAssets/BankAccount"
import { useTheme } from "@material-ui/core/styles"
import Worker from "../Workers"
import { Environment } from "../../types/Environment"
import { DateString } from "../../types/DateString"
import { getWidthHeight } from "./config"

interface BankAccountChartProps {
    bankAccount: BankAccount
}

export type BankAccountChartData = {label: DateString, value: number}[]

function BankAccountChart(props: BankAccountChartProps) {
    const [chartData, setChartData] = useState({})
    const [loading, setLoading] = useState(true)
    const theme = useTheme()

    const { bankAccount } = props

    useEffect(() => {
        const update = async () => {
            const instance = new Worker();
            const chartData = await instance.getBankAccountChartData(
                new Environment().data,
                bankAccount
            ) as BankAccountChartData

            setChartData({
                labels: chartData.map(data => new DateString(data.label.data)),
                datasets: [
                    {
                        label: "",
                        fill: false,
                        lineTension: 0.2,
                        borderColor: theme.palette.primary.main,
                        pointBackgroundColor: theme.palette.primary.dark,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: chartData.map(data => data.value)
                    }
                ]
            })
            setLoading(false)
        }

        setLoading(true)
        update().catch(e => console.error("Failed to load bankaccount chart data", e))
    }, [bankAccount, theme])

    const title = bankAccount.IBAN.format()
    const options = getLineChartOptions(title)

    const [width, height] = getWidthHeight()

    return (
        <div style={{width: width, height: height}}>
            {loading && <div>Loading {title}...</div>}
            {!loading && <Line data={chartData}
                  options={options}
                  width={width}
                  height={height} />}
        </div>
    )
}

export default BankAccountChart;
