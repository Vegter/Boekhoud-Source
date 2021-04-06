import { makeStyles } from "@material-ui/core"
import { createStyles, Theme } from "@material-ui/core/styles"

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        table: {
        },
        subDescription: {
            paddingLeft: 40,
            overflow: "hidden",
            textOverflow: "ellipsis",
            [theme.breakpoints.only('sm')]: {
                paddingLeft: 20,
                maxWidth: 150,
            },
        },
        mainDescription: {
            fontWeight: 450
        },
        levelHeader: {
            fontWeight: 'bold'
        },
        TrDivider: {
            backgroundColor: "lightgray",
            height: "2px",
            margin: 0,
            padding: 0
        },
        childRow: {
            [theme.breakpoints.down('xs')]: {
                marginLeft: "25px !important",
            },
        },
        openCloseButton: {
            textAlign: "left"
        },
        categoryHeader: {
            fontWeight: "bold"
        },
        categoryFooterTitle: {
            fontStyle: "normal",
            textAlign: "right"
        },
        categoryFooter: {
            fontWeight: "bold",
        }
    }));
