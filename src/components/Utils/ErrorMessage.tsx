import React from 'react'
import { Card, Grid, makeStyles } from "@material-ui/core"
import { Error, Home } from "@material-ui/icons"
import Button from "@material-ui/core/Button"
import { useHistory } from "react-router-dom"
import { Routes } from "../../routes/routes"

const useStyles = makeStyles({
    grid: {
        minHeight: '90vh'
    },
    card: {
        padding: 100
    },
    errorMsg: {
        margin: 15
    },
    button: {
        marginTop: 25
    }
});

interface OwnProps {
    title: string
    errorMsg?: string
    onAcknowledge: () => void
}

function ErrorMessage(props: OwnProps) {
    const { title, errorMsg } = props
    const classes = useStyles()

    const history = useHistory();

    const goHome = () => {
        props.onAcknowledge()
        history.push(Routes.Home.path)
    }

    const msg = errorMsg ? `Foutmelding: ${errorMsg}` : ""
    return (
        <Grid
            container
            direction="column"
            alignItems="center"
            justify="center"
            className={classes.grid}
        >
            <Card raised={true} className={classes.card}>
                <div>
                    <Error color={'error'} fontSize={'large'} />
                    <div className={classes.errorMsg}>
                        <h3>{title}</h3>
                        <p>{msg}</p>
                    </div>
                    <Button className={classes.button}
                            variant={"contained"}
                            color={"primary"}
                            onClick={goHome} startIcon={<Home/>}>
                        {Routes.Home.text}
                    </Button>
                </div>
            </Card>
        </Grid>
    )
}

export default ErrorMessage;
