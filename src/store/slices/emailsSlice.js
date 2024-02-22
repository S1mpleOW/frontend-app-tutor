import { createSlice } from '@reduxjs/toolkit';
const initialState = {
	value: [],
};

export const emailsSlice = createSlice({
	name: 'emails',
	initialState,
	reducers: {
		storeEmails: (state, action) => {
			state.value = action.payload;
		},
		clearEmails: (state, action) => {
			state.value = [];
		},
	},
});

export const { storeEmails, clearEmails } = emailsSlice.actions;

export const selectEmails = (state) => state.emails.value;

export default emailsSlice.reducer;
