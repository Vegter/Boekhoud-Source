import { configureStore } from '@reduxjs/toolkit'

import accountingReducer from './AccountingSlice'
import filterReducer from './FilterSlice'
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

export const store = configureStore({
  reducer: {
    accounting: accountingReducer,
    filter: filterReducer
  },
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(updateAccounting)
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