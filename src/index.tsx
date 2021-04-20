import React from 'react';
import ReactDOM from 'react-dom';
import { unstable_createMuiStrictModeTheme } from '@material-ui/core';
import {ThemeProvider} from '@material-ui/core/styles';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import './index.css';

import App from './App';
import { store, setAccountingState } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';

// Use theme to solve the following material ui issue:
// material ui Warning: findDOMNode is deprecated in StrictMode.
//   findDOMNode was passed an instance of Transition which is inside StrictMode.
//   Instead, add a ref directly to the element you want to reference.
const theme = unstable_createMuiStrictModeTheme({
    breakpoints: {
        unit: "em",
        values: {
            xs: 0,
            sm: 40,
            md: 60,
            lg: 80,
            xl: 120,
        },
    },
})

// Initialize Accounting
setAccountingState(store)

// Prevent accidental unload
function confirmUnload(ev: BeforeUnloadEvent) {
    ev.preventDefault();
    let confirm:string|null = null
    const age = store.getState().age.age
    if (age > 0) {
        // Warn user for unsaved changes
        confirm = `Er zijn nog ${age} onbewaarde veranderingen`
    }
    return ev.returnValue = confirm
}
window.addEventListener("beforeunload", confirmUnload)

ReactDOM.render(
  <React.StrictMode>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <App />
        </Provider>
      </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
