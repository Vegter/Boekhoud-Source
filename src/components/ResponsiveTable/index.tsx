import React from 'react'

import { Th as ThOrg, Td as TdOrg } from 'react-super-responsive-table';

import "./ResponsiveTable.css"

export { Table, Thead, Tbody, Tr } from 'react-super-responsive-table';


interface TdThProps {
    children: React.ReactNode,
}

function NonEmpty(props: TdThProps) {
    // Fix empty Th/Td not rendering properly
    return (
        <>
            {props.children || '\u00A0'}
        </>
    )
}

export function Td(props: TdThProps & any) {

    const { children, ...otherProps } = props

    return (
        <TdOrg {...otherProps}>
            <NonEmpty children={children}/>
        </TdOrg>
    )
}

export function Th(props: TdThProps & any) {

    const { children, ...otherProps } = props

    return (
        <ThOrg {...otherProps}>
            <NonEmpty children={children}/>
        </ThOrg>
    )
}
