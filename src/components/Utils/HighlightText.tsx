import React from 'react'
import { highlight } from "../../services/utils"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        highlight: {
            color: theme.palette.error.dark,
        },
    }),
)

interface HighlightTextProps {
    highlightText: string
    text: string
}

function HighlightText(props: HighlightTextProps) {
    const { highlightText, text } = props
    const classes = useStyles()

    const html = highlight(highlightText, text, classes.highlight)

    return (
        <span dangerouslySetInnerHTML={{__html: html}}/>
    )
}

export default HighlightText;