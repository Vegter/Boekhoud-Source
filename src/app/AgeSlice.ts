import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { RootState } from './store';

export interface AgeState {
    age: number
}

const initialState: AgeState = {
    age: 0
};

export const AgeSlice = createSlice({
    name: 'age',
    initialState,
    reducers: {
        restoreAgeState: (state, action: PayloadAction<{ state: AgeState }>) => {
            return action.payload.state
        },

        resetAge: (state) => {
            state.age = 0
        },

        increaseAge: (state) => {
            state.age += 1
        },
    }
});

export const { restoreAgeState, resetAge, increaseAge } = AgeSlice.actions;

export const selectAge = (state: RootState) => state.age.age

export default AgeSlice.reducer