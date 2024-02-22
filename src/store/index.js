import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import emailsSlice from './slices/emailsSlice';
export const store = configureStore({
	reducer: {
		auth: authSlice,
		emails: emailsSlice,
	},
});
