import React, { useEffect, useState } from 'react'
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table"
import { VATLine } from "../../types/VAT/VATLine"
import { VATDeclaration, VATDeclarationTag } from "../../types/VAT/VATDeclaration"
import { Grid, IconButton, useMediaQuery } from "@material-ui/core"
import { Check, DomainDisabled, Error, ExpandLess, ExpandMore } from "@material-ui/icons"
import { useTheme } from "@material-ui/core/styles"
import { VATDeclarationPeriod } from "../../types/VAT/VATDeclarationPeriod"
import { Journal } from "../../types/Journal/Journal"
import { getLines } from "../../types/VAT/VATDeclarationItem"
import FormatVATAmount from "./FormatVATAmount"
import Button from "@material-ui/core/Button"
import { JournalEntry } from "../../types/Journal/JournalEntry"
import { useDispatch } from "react-redux"
import { deleteJournalEntry, updateJournalEntry } from "../../app/AccountingSlice"
import FormatDate from "../Utils/FormatDate"
import { VATSpecificationEntryData } from "../../model"
import { VATCategoryDetails } from "./VATCategoryDetails"
import { useStyles } from "./VATStyling"
import { useURLState } from "../useURLState"

interface VATDeclarationViewProps {
    journal: Journal
    period: VATDeclarationPeriod
}

function VATDeclarationView(props: VATDeclarationViewProps) {
    const { journal, period } = props

    const [urlState, setURLState] = useURLState()
    const openDetailsKey = "openVAT"
    const openDetails = urlState.getStringArrayValue(openDetailsKey)

    const [declaration, setDeclaration] = useState(new VATDeclaration(journal, period))
    const dispatch = useDispatch()

    useEffect(() => {
        setDeclaration(new VATDeclaration(journal, period))
    }, [journal, period])

    const theme = useTheme()
    const onXs = useMediaQuery(theme.breakpoints.only('xs'));

    const classes = useStyles();

    const journalEntryId = declaration.id
    const isRegistered = journal.hasJournalEntry(journalEntryId)
    const journalEntry = isRegistered ? journal.getJournalEntry(journalEntryId) : null

    const document = declaration.getDeclarationDocument(journalEntry)
    const currency = declaration.currency
    const total = declaration.total

    const onDetails = (category: string) => {
        const id = VATDeclaration.getManualId(category)
        if (openDetails.includes(id)) {
            setURLState({[openDetailsKey]: openDetails.filter(c => c !== id)})
        } else {
            setURLState({[openDetailsKey]: openDetails.concat(id)})
        }
    }

    const onClick = () => {
        const journalEntry = JournalEntry.fromVATDeclaration(declaration)
        const action = isRegistered ? deleteJournalEntry : updateJournalEntry
        dispatch(action({journalEntryData: journalEntry.data}))
    }

    const onManual = (category: string, line: VATSpecificationEntryData) => {
        declaration.setManualVAT(category, line)
        const newDeclaration = new VATDeclaration(journal, declaration.period, declaration.manualVATs)
        setDeclaration(newDeclaration)
    }

    const itemIsDeclaredOK = (item: any) => {
        const total = VATLine.addVATLines(getLines(item.details))
        const declared = item.declared ? -1 * item.declared : 0
        return declared.toFixed(2) === total.vat.toFixed(2)
    }

    return (
        <div className={classes.document}>
            <div className={classes.registrationStatus}>
                <Grid container justify={onXs ? "center" : "flex-end"} alignItems={"center"} spacing={1}>
                    {isRegistered
                        ? <><Grid item>
                            Aangifte boekingsdatum: <FormatDate date={journal.getJournalEntry(journalEntryId).date}/>
                        </Grid>
                            <Grid item><Check/></Grid></>
                        : <><Grid item>Deze aangifte is nog niet geboekt</Grid>
                            <Grid item><DomainDisabled/></Grid></>}
                </Grid>
            </div>

            <Table key={Math.random()}>
            {Object.entries(document).map(([title, categories], index) => {
                return (
                    <React.Fragment key={title}>

                        {/* Document header */}
                        <Thead>
                            <Tr>
                                <Th className={classes.category}>{title}</Th>

                                <Th className={classes.netto}>
                                    {onXs ? "Excl. BTW"
                                          : index === 0 ? "Bedrag waarover de omzetbelasting wordt berekend" : ""}
                                </Th>

                                <Th className={classes.vat}>
                                    {onXs ? "BTW"
                                          : index === 0 ? "Omzetbelasting" : ""}
                                </Th>

                                <Th className={classes.vat}>
                                    {onXs ? "Aangifte"
                                        : index === 0 ? "Aangifte" : ""}
                                </Th>

                            </Tr>
                        </Thead>
                        <Tbody>
                            {/* Category entries */}
                            {Object.entries(categories).map(([category, item]) => {
                                const isOpen = openDetails.includes(VATDeclaration.getManualId(category))
                                return (
                                    <React.Fragment key={category}>

                                        {/* Category header */}
                                        <Tr>
                                            <Td className={"noheader"}>
                                                {!onXs && category}
                                                {item.details.length > 0 &&
                                                <IconButton size={"small"}
                                                            color={"primary"}
                                                            onClick={() => onDetails(category)}
                                                            aria-label={"BTW detail specificatie"}>
                                                    {isOpen ? <ExpandLess/> : <ExpandMore/>}
                                                </IconButton>}
                                                {onXs && category}
                                            </Td>
                                            <Td className={classes.netto}>
                                                <FormatVATAmount value={item.netto} currency={currency}/>
                                            </Td>
                                            <Td className={classes.vat}>
                                                <FormatVATAmount value={item.vat} currency={currency}/>
                                            </Td>
                                            <Td className={classes.vat}>
                                                {isRegistered && item.declared !== undefined && (itemIsDeclaredOK(item) ? <Check/> : <Error/>)}
                                            </Td>
                                        </Tr>

                                        {/* Category details */}
                                        {isOpen && <VATCategoryDetails declaration={declaration}
                                                                       category={category}
                                                                       item={item}
                                                                       currency={currency}
                                                                       onManual={onManual}/>}

                                    </React.Fragment>
                                )
                            })}
                        </Tbody>
                    </React.Fragment>
                )
            })}

            {/* Document Total */}
            <Tbody>
                <Tr>
                    <Th className={classes.category}>Totaal {total > 0 ? "te betalen" : total < 0 ? "te ontvangen" : ""}</Th>
                    <Th/>
                    <Th className={`${classes.category} ${classes.vat}`}>
                        <FormatVATAmount value={total} currency={currency} precision={0}/>
                    </Th>
                    <Th className={`${classes.category} ${classes.vat}`}>
                        {journalEntry &&
                        <FormatVATAmount value={declaration.declaredAmount(journalEntry, VATDeclarationTag.Declared)}
                                         currency={currency} precision={0}/>}
                    </Th>
                </Tr>
            </Tbody>
        </Table>

        <div className={classes.registerVAT}>
            <Button onClick={onClick}
                    color={"primary"}
                    variant={"contained"}>
                {isRegistered ? "Verwijder deze boeking" : "Boek Deze Aangifte"}
            </Button>
        </div>

        </div>
    )
}

export default VATDeclarationView;
