import { localPath } from "../config"

export interface RouteItem {
    id: string
    text: string
    path: string
}

export const Routes = {
    Upload: {
        id: "Upload",
        text: "Upload Bankbestand",
        path: "/upload",
    },
    Bank: {
        id: "Bank",
        text: "Bank",
        path: "/bank",
    },
    Journal: {
        id: "Journal",
        text: "Journaal",
        path: "/journal",
    },
    Ledger: {
        id: "Ledger",
        text: "Grootboek",
        path: "/ledger",

    },
    Map: {
        id: "Map",
        text: "Transacties boeken",
        path: "/map",

    },
    TrialBalance: {
        id: "TrialBalance",
        text: "Saldibalans",
        path: "/trialbalance",

    },
    Charts: {
        id: "Charts",
        text: "Visualisatie",
        path: "/charts",
    },
    VAT: {
        id: "VAT",
        text: "BTW Aangifte",
        path: "/vat"
    },
    Memorial: {
        id: "Memorial",
        text: "Memoriaal",
        path: "/memo"
    },
    Edit: {
        id: "JournalEntryEdit",
        text: "Bewerken",
        path: "/edit"
    },
    Home: {
        id: "Home",
        text: "Home",
        path: "/",
    }
}

Object.values(Routes).forEach(route => route.path = localPath(route.path))
