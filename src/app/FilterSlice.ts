import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from './store';

import { PeriodFilterData, VATPeriodData } from "../model"
import { PeriodFilter } from "../types/PeriodFilter"
import { ValueProxy } from "../services/ValueProxy"
import { VATDeclarationPeriod } from "../types/VAT/VATDeclarationPeriod"

export interface FilterState {
    periodFilterData: PeriodFilterData
    vatPeriodData: VATPeriodData | null
}

const initialState: FilterState = {
    periodFilterData: new PeriodFilter().data,
    vatPeriodData: null
};

export const FilterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        resetFilterState: () => {
            periodFilter.invalidate()
            return { ...initialState }
        },

        restoreFilterState: (state, action: PayloadAction<{ state: FilterState }>) => {
            periodFilter.invalidate()
            return action.payload.state
        },

        setPeriodFilter: (state, action: PayloadAction<{ periodFilterData: PeriodFilterData }>) => {
            periodFilter.invalidate()
            const { periodFilterData } = action.payload

            state.periodFilterData = new PeriodFilter(periodFilterData).data
        },

        setVATPeriod: (state, action: PayloadAction<{ vatPeriodData: VATPeriodData | null }>) => {
            vatPeriod.invalidate()
            const { vatPeriodData } = action.payload

            state.vatPeriodData = vatPeriodData
        }

    }
});

export const { resetFilterState, restoreFilterState, setPeriodFilter, setVATPeriod } = FilterSlice.actions;

const periodFilter = new ValueProxy<PeriodFilter>()
export const selectPeriodFilter = (state: RootState) =>
    periodFilter.getValue(() => new PeriodFilter(state.filter.periodFilterData))

const vatPeriod = new ValueProxy<VATDeclarationPeriod | null>()
export const selectVATPeriod = (state: RootState) =>
    vatPeriod.getValue(() => state.filter.vatPeriodData
        ? VATDeclarationPeriod.fromId(state.filter.vatPeriodData.period)
        : null)

export default FilterSlice.reducer