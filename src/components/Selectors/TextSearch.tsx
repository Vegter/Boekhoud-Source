import React, { useEffect, useState } from 'react'
import { IconButton, Input, InputProps } from "@material-ui/core"
import { Clear } from "@material-ui/icons"

interface Props {
    text: string,
    onSearch: (text: string) => void
}

function TextSearch(props: InputProps & Props) {
    const [searchText, setSearchText] = useState(props.text)
    const [timer, setTimer] = useState<any>(null)

    useEffect(() => {
        setSearchText(props.text)
    }, [props.text])

    const onChange = (event: any) => {
        const newSearchText = event.target.value
        clearTimeout(timer)

        setSearchText(newSearchText)
        const timeout = newSearchText ? 500 : 0
        setTimer(setTimeout(() => {
            // Try to collect succeeding keystrokes
            search(newSearchText)
        },  timeout))
    }

    const onSearch = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (event.key === 'Enter') {
            // Search immediately
            search(searchText)
        }
    }

    const search = (text: string) => {
        setSearchText(text)
        clearTimeout(timer)
        props.onSearch(text)
    }

    return (
        <>
            <Input
                value={searchText}
                onChange={onChange}
                onKeyUp={onSearch}
                placeholder="Search…"
                inputProps={{ 'aria-label': 'zoek tekst' }}
            />
            <IconButton aria-label="wis zoektekst" onClick={() => search("")}>
                <Clear/>
            </IconButton>
        </>
    )
}

export default TextSearch;
