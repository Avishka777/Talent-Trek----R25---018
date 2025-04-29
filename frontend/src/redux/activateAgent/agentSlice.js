import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: false,
};

const agentSlice = createSlice({
    name: 'agent',
    initialState,
    reducers: {
        toggleAgent: (state) => {
            state.status = !state.status;
        },
    }
});

export const { toggleAgent } = agentSlice.actions;

export default agentSlice.reducer;
