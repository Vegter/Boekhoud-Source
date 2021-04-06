import React from 'react'
import { Button, makeStyles } from "@material-ui/core"
import HighlightText from "./Utils/HighlightText"
import { createStyles } from "@material-ui/core/styles"

const useStyles = makeStyles((/*theme: Theme*/) =>
    createStyles({
        searchText: {
            textAlign: "left",
            fontWeight: "inherit",
            textTransform: "none",
            lineHeight: "inherit",
            fontSize: "inherit",
            marginLeft: -5
        },
    }))

interface SearchTextButtonProps {
    text: string
    searchText: string
    onSearch: (text: string) => void
}

function SearchTextButton(props: SearchTextButtonProps) {
    const { text, searchText, onSearch } = props
    const classes = useStyles()

    return (
        <Button aria-label={`zoek op ${text}`}
                size={"small"}
                className={classes.searchText}
                onClick={() => onSearch(text)}>
            <HighlightText highlightText={searchText}
                           text={text}/>
        </Button>
    )
}

export default SearchTextButton;
