import { configureStore } from '@reduxjs/toolkit'

import accountingReducer from './AccountingSlice'
import filterReducer from './FilterSlice'
import ageReducer, { resetAge, increaseAge } from './AgeSlice'
import { Accounting } from "../types/Accounting"

const updateAccounting = (store: any) => (next: any) => (action: any) => {
  // Execute action
  const result = next(action)

  // Execute post action
  if (/^accounting\//.test(action.type)) {
    // On each invocation of an accountingReducer
    // Inject new accounting state in Accounting
    setAccountingState(store)
  }

  return result
}

const updateAge = ({ dispatch }: any) => (next: any) => (action: any) => {
  // Execute action
  const result = next(action)

  if (/(restore|reset)(Accounting|Filter)State/.test(action.type)) {
    // Reset age on any filter or accounting restore or reset action
    dispatch(resetAge())
  } else if (/^(accounting|filter)\//.test(action.type)  && !/^accounting\/addStatements/.test(action.type) ) {
    // any other filter or accounting action increases the age
    // Expect for reading statements (unmodified data loaded from an external file)
    dispatch(increaseAge())
  }

  return result
}

export const store = configureStore({
  reducer: {
    accounting: accountingReducer,
    filter: filterReducer,
    age: ageReducer
  },
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([updateAccounting, updateAge])
});

export function setAccountingState(store: any) {
  Accounting.State = store.getState().accounting
}

export const selectState = (state: RootState) => state

export type RootState = ReturnType<typeof store.getState>;

// export type AppThunk<ReturnType = void> = ThunkAction<
//   ReturnType,
//   RootState,
//   unknown,
//   Action<string>
// >;