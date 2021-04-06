import React, { useEffect, useRef, useState } from 'react'
import { Dialog, FormControlLabel, Grid, IconButton, Switch, useMediaQuery } from "@material-ui/core"
import { DialogActions, DialogContent, DialogTitle } from "../Utils/CustomDialog"
import Button from "@material-ui/core/Button"
import { createStyles, makeStyles, useTheme } from "@material-ui/core/styles"
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table"
import { ClearAll, Delete } from "@material-ui/icons"
import { VATLine } from "../../types/VAT/VATLine"
import { VATRates } from "../../types/VAT/VATRates"
import VATSelector from "./VATSelector"
import { NO_VAT, VATRate } from "../../types/VAT/VATRate"
import { Amount } from "../../types/Amount"
import VATAmount from "./VATAmount"
import FormatAmount from "../Utils/FormatAmount"
import { LedgerAllocation } from "../../types/Allocation/LedgerAllocation"
import DateSelector from "../Selectors/DateSelector"
import { VAT_HIGH, VAT_LOW } from "../../types/VAT/VATHistory"

const useStyles = makeStyles(() =>
    createStyles({
        invoiceDate: {
            textAlign: "center",
            margin: "auto",
            marginBottom: 10
        },
        specificationBlock: {
            marginTop: 2
        },
        specification: {
            textAlign: "right",
            marginRight: 15,
            fontSize: "80%"
        },
        tableRow: {
            textAlign: "right"
        },
        rowTitle: {
            textAlign: "left"
        }
    }),
);

interface VATDialogProps {
    allocation: LedgerAllocation
    lines: VATLine[]
    onClose: (date: Date, vatLines: VATLine[] | null) => void
}

export function VATDialog(props: VATDialogProps) {
    const [open, setOpen] = React.useState(true);

    const { allocation, onClose } = props

    const currency = allocation.statementEntry.amount.currency
    const bruto = Math.abs(allocation.statementEntry.amount.value)
    const isReversed = allocation.statementEntry.amount.value < 0
    const lines = isReversed ? VATLine.reverseLines(props.lines) : props.lines
    const vatSpecificationData = allocation.journalEntry.data.vatSpecificationData
    const valueDate = allocation.statementEntry.valueDate

    const [autoCalc, setAutoCalc] = useState(true)
    const [vat, setVAT] = useState(0)
    const [netto, setNetto] = useState(bruto)
    const [vatLines, setVATLines] = useState<VATLine[]>(VATLine.updateVATChoices(lines, bruto, autoCalc))
    const [remaining, setRemaining] = useState(bruto)
    // const [expand, setExpand] = useState(false)
    const [date, setDate] = useState<Date>(vatSpecificationData
        ? new Date(vatSpecificationData.date)
        : valueDate.Date)

    const OKButtonRef = useRef<any>(React.createRef())

    const classes = useStyles()
    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'));

    useEffect(() => {
        const {total, remaining} = VATLine.getTotalRemaining(vatLines, bruto)
        setRemaining(remaining)
        setVAT(total.vat)
        setNetto(total.netto)
    }, [vatLines, bruto])

    const cancelChanges = () => confirmChanges(null)

    const confirmChanges = (lines: VATLine[] | null) => {
        setOpen(false);
        if (lines) {
            lines = lines.filter(line => line.vatRate)
            lines = isReversed ? VATLine.reverseLines(lines) : lines    // revert reversion
        }
        onClose(date, lines)
    };

    const clearVATLines = () => setVATLines([new VATLine(NO_VAT, bruto)])

    const updateVATLines = (auto: boolean = autoCalc) => setVATLines(VATLine.updateVATChoices(vatLines, bruto, auto))

    const onChangeValue = (line: VATLine, value: string, setter: (value: string | number) => void) => {
        setter(value)
        updateVATLines()
    }

    const onFinalValue = (line: VATLine, finalValue: string, setter: (value: string | number) => void) => {
        if (!isNaN(+finalValue)) {
            setter(+finalValue)
            updateVATLines()
        }
    }

    const onDateChange = (date: Date | null) => setDate(date || valueDate.Date)

    const onVATRateSelected = (line: VATLine, rate: VATRate | null) => {
        line.setVATRate(rate, line.bruto ? line.bruto : remaining)
        updateVATLines()
    }

    const onQuickVAT = (rateId: string | null) => {
        const rate = rateId ? vatRates[rateId] : null
        const vatLine = new VATLine(rate, bruto)
        confirmChanges([vatLine])
    }

    const toggleAutoCalc = () => {
        if (!autoCalc) {
            updateVATLines(true)
        }
        setAutoCalc(!autoCalc)
    }

    const vatRates = new VATRates(date).rates

    return (
        <div>
            <Dialog fullWidth={false}
                    fullScreen={onXs}
                    maxWidth={false}
                    onClose={() => cancelChanges()}
                    aria-labelledby="vat-dialog-title"
                    open={open}>
                <DialogTitle id="vat-dialog-title"
                             subTitle={allocation.reason}>
                    BTW
                </DialogTitle>
                <DialogContent dividers>

                    {/* Invoice date */}
                    <div className={classes.invoiceDate}>
                        <DateSelector label={"Factuur datum"}
                                      date={date}
                                      onDate={onDateChange}/>
                    </div>

                    {/* Shortcut buttons */}
                    <Grid container spacing={1} direction={"row"} justify={"center"}>
                        <Grid item><Button variant={"outlined"} color={"primary"} onClick={() => onQuickVAT(VAT_HIGH)}>
                            Hoog {vatRates[VAT_HIGH].percentageString}</Button></Grid>
                        <Grid item><Button variant={"outlined"} color={"primary"} onClick={() => onQuickVAT(VAT_LOW)}>
                            Laag {vatRates[VAT_LOW].percentageString}</Button></Grid>
                        <Grid item><Button variant={"outlined"} color={"primary"} onClick={() => onQuickVAT(null)}>
                            Geen BTW</Button></Grid>
                    </Grid>

                    {/* Advanced VAT */}
                    <div>
                        <Table>
                            <Thead>
                                <Tr className={classes.tableRow}>
                                    {onXs && <Th/>}
                                    {!onXs && <Th>
                                        <IconButton size={"small"}
                                                    disabled={vatLines.length <= 1}
                                                    title={"Verwijder alle BTW regels"}
                                                    aria-label={"Verwijder alle BTW regels"}
                                                    onClick={clearVATLines}>
                                            <ClearAll/>
                                        </IconButton>
                                    </Th>}
                                    <Th className={classes.rowTitle}>BTW Tarief
                                    </Th>
                                    <Th>Incl BTW</Th>
                                    <Th>BTW</Th>
                                    <Th>Excl BTW</Th>
                                </Tr>
                            </Thead>

                            <Tbody>
                                {vatLines.map((line, i) => {
                                    const vatRate = line.vatRate
                                    const percentage = line.percentage

                                    return (
                                        <Tr key={i} className={classes.tableRow}>
                                            <Td>
                                                {Boolean(vatRate) && !onXs &&
                                                <IconButton size={"small"}
                                                            title={"Verwijder deze BTW regel"}
                                                            aria-label={"Verwijder deze BTW regel"}
                                                            onClick={() => onVATRateSelected(line, null)}>
                                                    <Delete/>
                                                </IconButton>}
                                            </Td>
                                            <Td className={`noheader ${classes.rowTitle}`}>
                                                {/* VAT Rate */}
                                                <VATSelector vatRates={vatRates}
                                                             vatLine={line}
                                                             onVAT={onVATRateSelected}/>
                                            </Td>
                                            <Td>
                                                {/*Bruto (Incl VAT)*/}
                                                <VATAmount value={line.bruto}
                                                           disabled={!line.vatRate}
                                                           onBlur={() => onFinalValue(line, line.bruto, line.setBruto.bind(line))}
                                                           onChange={value => onChangeValue(line, value, line.setBruto.bind(line))}/>
                                            </Td>
                                            <Td>
                                                {/*VAT*/}
                                                <VATAmount value={line.vat}
                                                           disabled={percentage === 0}
                                                           onChange={value => onChangeValue(line, value, line.setVAT.bind(line))}
                                                           onBlur={() => onFinalValue(line, line.vat, line.setVAT.bind(line))}/>
                                            </Td>
                                            <Td>
                                                {/*Netto (Excl VAT)*/}
                                                <VATAmount value={line.netto}
                                                           disabled={percentage === 0}
                                                           onBlur={() => onFinalValue(line, line.netto, line.setNetto.bind(line))}
                                                           onChange={value => onChangeValue(line, value, line.setNetto.bind(line))}/>
                                            </Td>
                                        </Tr>
                                    )
                                })}

                                {/* Totals overview */}
                                <Tr className={classes.tableRow}>
                                    <Td/>
                                    <Td className={classes.rowTitle}>Totaal</Td>
                                    <Td><FormatAmount amount={Amount.fromAmountCurrency(bruto - remaining, currency)} debitCredit={false}/></Td>
                                    <Td><FormatAmount amount={Amount.fromAmountCurrency(vat, currency)} debitCredit={false}/></Td>
                                    <Td><FormatAmount amount={Amount.fromAmountCurrency(netto, currency)} debitCredit={false}/></Td>
                                </Tr>

                            </Tbody>
                        </Table>
                </div>

                </DialogContent>

                <DialogActions>
                    {/* Calculation toggle and Confirm button */}
                    <Grid container spacing={2} direction={"row"} justify={"space-between"} alignItems={"center"}>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoCalc}
                                        title={"Automatisch aanpassen van de BTW regels"}
                                        onChange={toggleAutoCalc}
                                        name="auto calc"
                                        color="primary"
                                    />
                                }
                                label={autoCalc
                                    ? "Automatisch aanpassen"
                                    : <span>
                                        Restant <FormatAmount amount={Amount.fromAmountCurrency(remaining, currency)}
                                                                        debitCredit={false}/>
                                      </span>
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <div className={"text-right-align"}>
                            <Button onClick={cancelChanges}>Cancel</Button>
                            <Button disabled={remaining !== 0}
                                    onClick={() => confirmChanges(vatLines)}
                                    ref={OKButtonRef}
                                    color="primary">
                                OK
                            </Button>
                            </div>
                        </Grid>
                    </Grid>

                </DialogActions>
            </Dialog>
        </div>
    );
}
