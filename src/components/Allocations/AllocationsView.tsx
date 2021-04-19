import React from 'react'

import { Checkbox, Paper, TableContainer, useMediaQuery } from "@material-ui/core"
import { Table, Thead, Tbody, Tr, Th, Td } from '../ResponsiveTable';

import { LedgerAllocation } from "../../types/Allocation/LedgerAllocation"
import { createStyles, makeStyles, useTheme } from "@material-ui/core/styles"
import FormatDate from "../Utils/FormatDate"
import FormatAmount from "../Utils/FormatAmount"

const useStyles = makeStyles((theme) =>
    createStyles({
        description: {
            overflow: "hidden",
            textOverflow: "ellipsis",
        },
        checkAll: {
            [theme.breakpoints.only('xs')]: {
                marginLeft: 13,
            },
        },
        checkBox: {
            [theme.breakpoints.only('xs')]: {
                marginLeft: -12,
                marginBottom: -11
            },
        },
        negativeAmount: {
            color: "red"
        },
        positiveAmount: {
        },
    }),
);

export type AllocationSelector = Record<string, boolean>

interface Props {
    allocations: LedgerAllocation[]
    allocation: LedgerAllocation
    checked?: AllocationSelector
    onChecked?: (checked: AllocationSelector) => void
}

function AllocationsView(props: Props) {
    const classes = useStyles();
    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'));

    const { allocations, checked, onChecked } = props
    const mainAllocation = props.allocation

    const onSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (checked) {
            const isChecked = event.target.checked
            allocations
                .filter(a => a.id !== mainAllocation.id)
                .forEach(allocation => checked[allocation.id] = isChecked)
            onChecked && onChecked(checked)
        }
    }

    const onSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (checked) {
            const id = event.target.name
            checked[id] = event.target.checked
            onChecked && onChecked(checked)
        }
    }

    const checkAll = checked && onChecked && <Checkbox
        className={classes.checkAll}
        checked={allocations.every(allocation => checked[allocation.id])}
        color={"primary"}
        onChange={onSelectAll}/>

    return (
        <div>
            {onXs && checkAll}
            <TableContainer component={Paper}>
            <Table key={Number(onXs)}>
                <Thead>
                    <Tr>
                        <Th>{!onXs && checkAll}</Th>
                        <Th>datum</Th>
                        <Th align="right">Bedrag</Th>
                        <Th className={classes.description}>Omschrijving</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {allocations.map(allocation => {
                        const amount = allocation.amount
                        const amountClassName = amount.value < 0 ? classes.negativeAmount : classes.positiveAmount
                        const isMainAllocation = allocation.id === mainAllocation.id
                        const style = isMainAllocation ? { fontWeight: "bold" } : {}
                        return (
                            <Tr key={allocation.id} style={style}>
                                {checked && onChecked && <Td className={"noheader"}>
                                    <Checkbox
                                        className={classes.checkBox}
                                        checked={checked[allocation.id]}
                                        disabled={isMainAllocation}
                                        color={"primary"}
                                        name={allocation.id}
                                        onChange={onSelect}
                                    />
                                </Td>}
                                <Td>
                                    <FormatDate date={allocation.journalEntry.date}/>
                                </Td>
                                <Td align="right" className={amountClassName}>
                                    <FormatAmount amount={allocation.amount} debitCredit={false}/>
                                </Td>
                                <Td className={"noheader"}>
                                    {allocation.journalEntry.reason}
                                </Td>
                            </Tr>
                        )
                    })}
                </Tbody>
            </Table>
            </TableContainer>
        </div>
    )
}

export default AllocationsView;
