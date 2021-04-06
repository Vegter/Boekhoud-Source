import React, { useEffect, useState } from 'react'

import { Container } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles"

import MarkdownIt from "markdown-it"
import { localPath } from "../config"

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            textAlign: "left",
            marginLeft: "5%",
            marginRight: "5%"
        },
    }),
);



function HomePage() {
    const classes = useStyles();
    const [text, setText] = useState("")

    useEffect(() => {
        const loadText = async () => {
            const data = await fetch(localPath("/README.md"))
            const mdText = await data.text()
            const md = new MarkdownIt()
            setText(md.render(mdText))
        }

        if (! text) {
            loadText().catch(() => {
                setText("Tekst kan niet geladen worden")
            })
        }
    }, [text])

    return (
        <Container maxWidth={false}>
            <div dangerouslySetInnerHTML={{__html: text}} className={classes.root} />
        </Container>
    );
}

export default HomePage;
