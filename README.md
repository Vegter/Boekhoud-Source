# Boekhoud Source

## Functional Information

The current version of the software can be found at:

- [GitHub Pages](https://vegter.github.io/Boekhoud-Source/)

Functional Documentation (Dutch Language) can be found at [README.md](public/README.md)

Open Market Standards are used as much as possible. This keeps the application simple, more easy to use and better documented.

The following standards are used:

- MT940 (SWIFT) and CAMT.053 to import bank statements
- RGS (level 4, "grootboekrekening") to allocate bank statements

## Technical Information

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

## Major Design Principles

- React, Redux and TypeScript
- Chart.js for HTML5 charts
- Crypto-js (JavaScript library of crypto standards)
- 100% Client Side, no server logic and/or storage of data
  - Data can be stored locally and will be secured with AES-256 encryption
- No business logic in components.
  - Components only contain JSX and minimal code to handle events
  - All logic and computations are implemented in separate TypeScript modules
- All TypeScript modules are tested with 100% Code Coverage
- Separation of Data and Behaviour. Data can be stored separately from the classes that encapsulate the behaviour.
- Use of Web Workers for compute-intensive tasks

## Project layout

- app
  - Redux store
- components
  - All visual components, organized by subject
- model
  - The data formats that are used to store and restore data
- pages
  - The main application pages
- routes
  - routing constants and icons
- services
  - general libraries for encryption, memoization, URL state sync, ...
- types
  - the classes, types and interfaces that hold the logic to process the accounting data

## Available Scripts

In the project directory, you can run:

### `yarn`

Initialize the project.

After the project has been initialized use any of the following commands:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn deploy`

Deploys the current version of the software to GitHub Pages.

### `yarn test --watchAll=false --coverage`

Runs all tests and provides for a coverage report.

The coverage report can be viewed in the browser by opening `~/coverage/lcov-report/index.html`

Code coverage is set to 100% of all .ts modules.

## Contribute?

Please read the [contributing document](CONTRIBUTING.md)

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
