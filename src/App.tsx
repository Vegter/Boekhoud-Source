import React from 'react'
import { BrowserRouter, Route, Switch } from "react-router-dom"

import './App.css';

import UploadPage from "./pages/UploadPage";
import MapPage from "./pages/MapPage";
import TrialBalancePage from "./pages/TrialBalancePage";
import HomePage from "./pages/HomePage";
import BankPage from "./pages/BankPage"
import JournalPage from "./pages/JournalPage"
import LedgerPage from "./pages/LedgerPage"
import MenuAppBar from "./components/Menu/MenuAppBar"
import ChartsPage from "./pages/ChartsPage"

import { RouteItem, Routes } from "./routes/routes"
import StateSync from "./components/Utils/StateSync"
import AppLoader from "./components/Utils/AppLoader"
import { APP } from "./config"
import { useSelector } from "react-redux"
import { selectLiquidAssets } from "./app/AccountingSlice"
import ErrorBoundary from "./components/Utils/ErrorBoundary"
import { MuiPickersUtilsProvider } from "@material-ui/pickers"
import DateFnsUtils from "@date-io/date-fns"
import { nl } from 'date-fns/locale'
import VATPage from "./pages/VATPage"
import { ThemeProvider } from "@material-ui/styles"
import { createMuiTheme } from "@material-ui/core"

function App() {
    const liquidAssets = useSelector(selectLiquidAssets)
    const requiresData = (page: () => JSX.Element): () => JSX.Element =>
        liquidAssets.hasData() ? page : HomePage

    const routes: [RouteItem, () => JSX.Element][] = [
        [Routes.Ledger, LedgerPage],
        [Routes.Journal, requiresData(JournalPage)],
        [Routes.Map, requiresData(MapPage)],
        [Routes.TrialBalance, requiresData(TrialBalancePage)],
        [Routes.VAT, requiresData(VATPage)],
        [Routes.Bank, requiresData(BankPage)],
        [Routes.Upload, UploadPage],
        [Routes.Charts, ChartsPage],
        [Routes.Home, HomePage],
    ]

    const defaultMaterialTheme = createMuiTheme({
        overrides: {
            MuiInputBase: {
                root: {
                    fontSize: "0.875rem"
                }
            }
        }
    });

        return (
            <div className="App">
                <BrowserRouter>
                    <ErrorBoundary>
                    <AppLoader>
                    <StateSync>
                    <ThemeProvider theme={defaultMaterialTheme}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={nl}>
                    <MenuAppBar title={APP.TITLE}>
                        <Switch>
                            {routes.map(([route, component]) => {
                                return (
                                    <Route key={route.id}
                                           path={route.path}
                                           component={component}/>
                                )
                            })}
                        </Switch>
                    </MenuAppBar>
                    </MuiPickersUtilsProvider>
                    </ThemeProvider>
                    </StateSync>
                    </AppLoader>
                    </ErrorBoundary>
                </BrowserRouter>
            </div>
        )
}

export default App;
