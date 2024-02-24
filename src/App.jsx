import React, { useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import AuthService from './api/auth.api';
import { useDispatch } from 'react-redux';
import { storeAccessToken, storeRefreshToken } from './store/slices/authSlice';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SendEmailPage from './pages/SendEmailPage';
import CoursesTable from './components/courses/CoursesTable';
import ShowMemberPage from './pages/ShowMemberPage';
import EmailsPage from './pages/EmailsPage';
import ShowEmailDetailPage from './pages/ShowEmailDetailPage';

const App = () => {
	const dispatch = useDispatch();
	useEffect(() => {
		(async () => {
			const authService = new AuthService();
			const { access_token, refresh_token, expires_in } = await authService.getTokens();
			dispatch(storeAccessToken(access_token));
			dispatch(storeRefreshToken(refresh_token));
		})();
	});
	return (
		<Routes>
			<Route element={<MainLayout />}>
				<Route path="/" element={<CoursesTable />}></Route>
				<Route path="/enrollments/:id" element={<ShowMemberPage />}></Route>
				<Route path="/send-email" element={<SendEmailPage />}></Route>
				<Route path="/emails/:id" element={<ShowEmailDetailPage />}></Route>
				<Route path="/emails" element={<EmailsPage />}></Route>
			</Route>
			<Route path="login" element={<Login />}></Route>
		</Routes>
	);
};
export default App;
