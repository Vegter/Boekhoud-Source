import React from 'react'
import { Td, Tr } from "../ResponsiveTable"
import PeriodSelector from "../Editors/PeriodSelector"
import RGSAccountSelector from "../Editors/RGSAccountSelector"
import { LedgerScheme } from "../../types/Ledger/LedgerScheme"
import { LedgerAccount } from "../../types/Ledger/LedgerAccount"
import ReasonEditor from "../Editors/ReasonEditor"
import { LedgerAllocation } from "../../types/Allocation/LedgerAllocation"
import { makeStyles } from "@material-ui/core"
import { createStyles, Theme } from "@material-ui/core/styles"
import FormatAmount from "../Utils/FormatAmount"
import FormatDate from "../Utils/FormatDate"
import VATMenuButton from "../VAT/VATMenuButton"
import { VATSpecificationData } from "../../model"
import DateSelector from "../Selectors/DateSelector"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      childAllocationRow: {
        [theme.breakpoints.down('xs')]: {
          marginLeft: "25px !important",
        },
      }
    }));

interface AllocationsTableRowProps {
    allocation: LedgerAllocation
    debitCredit: boolean
    updateLedgerAccount: (ledgerAllocation: LedgerAllocation, ledgerAccount: LedgerAccount) => void
    updateVAT: (ledgerAllocation: LedgerAllocation, vat: VATSpecificationData) => void
    updateDate: (ledgerAllocation: LedgerAllocation, date: Date) => void
}

function AllocationsTableRow(props: AllocationsTableRowProps) {
    const classes = useStyles()

    const { allocation, debitCredit, updateLedgerAccount, updateVAT, updateDate } = props

    const { statementEntry } = allocation

    const showDetails = !allocation.hasParent()    // Don't show details for children
    const amount = statementEntry.amount
    const disabled = allocation.hasChildren()

    const onVAT = (vatSpecification: VATSpecificationData | null) => {
        if (vatSpecification) {
            updateVAT(allocation, vatSpecification)
        }
    }

    const onDate = (date: Date | null) => {
        if (date) {
            updateDate(allocation, date)
        }
    }

    return (
      <Tr key={allocation.id} className={showDetails ? "" : classes.childAllocationRow}>
        <Td>
          {showDetails && <FormatDate date={statementEntry.valueDate}/>}
        </Td>

        <Td>
          {!showDetails && <DateSelector label={""}
                                         date={allocation.journalEntry.date.Date}
                                         onDate={onDate} />}
        </Td>

        <Td>
          <PeriodSelector key={allocation.period.string + disabled}
                          disabled={disabled}
                          allocation={allocation}/>
        </Td>

        {debitCredit &&
        <Td align="right">
            {showDetails && amount.isDebit && <FormatAmount amount={amount} debitCredit={debitCredit} />}
        </Td>}

        {debitCredit &&
        <Td align="right">
            {showDetails && amount.isCredit && <FormatAmount amount={amount} debitCredit={debitCredit} />}
        </Td>}

        {!debitCredit &&
        <Td align="right" colSpan={2}>
          {showDetails && <FormatAmount amount={amount} debitCredit={debitCredit} />}
        </Td>}

        <Td className={"noheader"}>
          <RGSAccountSelector disabled={disabled}
                              ledgerAccount={allocation.ledgerAccount}
                              accountOptions={LedgerScheme.allocatableAccounts}
                              onChange={(account: LedgerAccount) => updateLedgerAccount(allocation, account)}/>
        </Td>

        <Td className={"noheader"}>
            {!disabled && <VATMenuButton allocation={allocation}
                                         onClose={onVAT}/>}
        </Td>

        <Td className={"noheader"}>
          <ReasonEditor key={allocation.reason} allocation={allocation}/>
        </Td>

      </Tr>
  )
}

export default AllocationsTableRow;
