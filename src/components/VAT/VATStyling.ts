import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        document: {
            maxWidth: 800,
            margin: "auto"
        },
        registrationStatus: {
            textAlign: "right",
        },
        registerVAT: {
            marginTop: 25,
            textAlign: "right"
        },
        category: {
            paddingTop: 25,
            [theme.breakpoints.up('sm')]: {
                width: "60%",
            },
            verticalAlign: "bottom"
        },
        categoryDetails: {
            paddingLeft: 40
        },
        netto: {
            [theme.breakpoints.up('sm')]: {
                width: "20%",
            },
            textAlign: "right",
            verticalAlign: "top",
        },
        vat: {
            [theme.breakpoints.up('sm')]: {
                width: "20%",
            },
            textAlign: "right",
            verticalAlign: "top"
        },
        manualButton: {
            [theme.breakpoints.down('sm')]: {
                width: "100%",
            },
        }
    }),
)