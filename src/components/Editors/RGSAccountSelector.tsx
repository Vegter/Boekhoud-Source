import React, { ChangeEvent } from 'react'

import { Box, TextField } from "@material-ui/core"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import { Autocomplete } from "@material-ui/lab"
import { AutocompleteRenderInputParams } from "@material-ui/lab/Autocomplete"

import { LedgerAccount } from "../../types/Ledger/LedgerAccount"
import { useResponsiveStyling } from "./useResponsiveStyling"
import HighlightText from "../Utils/HighlightText"
import { LedgerScheme } from "../../types/Ledger/LedgerScheme"

export const AccountSelectorWidth = 225

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        code: {
            fontSize: 10,
            float: "left",
            fontWeight: "bold"
        },
        description: {
            textAlign: "right",
            fontSize: 10
        },
        option: {
            width: "100%"
        },
        autocomplete: {
            minWidth: AccountSelectorWidth,
            maxWidth: AccountSelectorWidth * 1.5,
            width: "100%",
            display: "inline-block",
            [theme.breakpoints.down('sm')]: {
                minWidth: AccountSelectorWidth - 50,
                maxWidth: AccountSelectorWidth,
            },
            [theme.breakpoints.down('xs')]: {
                minWidth: 0,
                maxWidth: "100%",
            },
        }
    }),
)

const getOptionLabel = (option: LedgerAccount) =>
    option.shortDescription

function RenderInput(params: AutocompleteRenderInputParams) {
    const { variant, inputProps } = useResponsiveStyling()

    return <TextField {...params}
                      InputProps={{
                          ...params.InputProps,
                          ...inputProps,
                          "aria-label": "RGS Grootboekrekening",
                          classes: {
                              root: "input-root"
                          }}}
                      variant={variant}
                      size={"small"}
                      margin={"none"}/>
}

const renderOption = (option: LedgerAccount, state: { inputValue: string }, classes: ReturnType<typeof useStyles>) => {
    const {inputValue} = state

    if (option.isUnmapped()) {
        return null
    }

    return (
        <div className={classes.option}>
            <HighlightText highlightText={inputValue} text={option.shortDescription}/>
            <div>
                <div className={classes.code}>
                    {option.code}
                </div>
                {option.parents.map(parent =>
                    <div key={parent.code} className={classes.description}>
                        {parent.shortDescription}
                    </div>
                )}
            </div>
        </div>
    )
}

interface RGSAccountSelectorProps {
    accountOptions: LedgerAccount[]
    ledgerAccount: LedgerAccount
    onChange: (account: LedgerAccount) => void
    disabled?: boolean
}

function RGSAccountSelector(props: RGSAccountSelectorProps) {
    const classes = useStyles()
    const { ledgerAccount, accountOptions, disabled } = props

    const onChange = (event: ChangeEvent<{}>, value: LedgerAccount | null) => {
        if (value) {
            props.onChange(value)
        } else {
            props.onChange(LedgerScheme.unmapped)
        }
    }

    const filterOptions = (options: LedgerAccount[], state: any) => {
        let searchText = state.inputValue as string
        if (searchText) {
            // Show matching accounts
            searchText = searchText.toLowerCase().trim()
            return options.filter(option => option.matchDescription(searchText))
        } else {
            // Show accounts around the current ledgerAccount
            const index = options.findIndex(option => option.equals(ledgerAccount))
            const items = 100
            const min = Math.max(0, index - (items / 2))
            const max = min + items
            return options.filter((option, i) => min <= i && i <= max)
        }
    }

    return (
        <>
        <Box display="none" displayPrint="block">
            {/* Print Only */}
            {ledgerAccount.shortDescription}
        </Box>

        <Box display="block" displayPrint="none">
            {/* Screen Only */}
            <Autocomplete
                disabled={disabled}
                aria-label={"kies een grootboek rekening"}
                autoHighlight={true}
                noOptionsText={"Geen rekeningen gevonden"}
                options={accountOptions}
                size={"small"}
                openOnFocus={false}
                clearOnEscape={false}
                value={ledgerAccount}
                getOptionLabel={getOptionLabel}
                className={classes.autocomplete}
                renderInput={RenderInput}
                renderOption={(option, state) => renderOption(option, state, classes)}
                onChange={onChange}
                filterOptions={filterOptions}
            />
        </Box>
        </>
    )
}

function areEqual(prevProps: RGSAccountSelectorProps, nextProps: RGSAccountSelectorProps) {
    return prevProps.ledgerAccount.code === nextProps.ledgerAccount.code &&
        prevProps.disabled === nextProps.disabled
}

export default React.memo(RGSAccountSelector, areEqual)