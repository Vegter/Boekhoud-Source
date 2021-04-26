import React from 'react'

import {
    Home,
    CloudUpload,
    AccountBalance,
    CallSplit,
    LibraryBooks,
    MenuBook,
    PlaylistAdd,
    ShowChart,
    NoteOutlined,
    Domain,
    EditOutlined
} from "@material-ui/icons"

import { Routes } from "./routes"

interface RouteIconProps {
    id: string
}

const icon: Record<string, JSX.Element> = {
    [Routes.Home.id]: <Home/>,
    [Routes.Ledger.id]: <MenuBook/>,
    [Routes.Journal.id]: <LibraryBooks/>,
    [Routes.Map.id]: <CallSplit/>,
    [Routes.TrialBalance.id]: <PlaylistAdd/>,
    [Routes.Upload.id]: <CloudUpload/>,
    [Routes.Bank.id]: <AccountBalance/>,
    [Routes.Charts.id]: <ShowChart/>,
    [Routes.VAT.id]: <Domain/>,
    [Routes.Memorial.id]: <NoteOutlined/>,
    [Routes.Edit.id]: <EditOutlined/>
}

function RouteIcon(props: RouteIconProps) {
    return (
        <span>
            {icon[props.id] || null}
        </span>
    )
}

export default RouteIcon