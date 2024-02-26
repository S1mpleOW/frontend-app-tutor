import React from 'react';
import MainLayout from './components/layout/MainLayout';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SendEmailPage from './pages/SendEmailPage';
import CoursesTable from './components/courses/CoursesTable';
import ShowMemberPage from './pages/ShowMemberPage';
import EmailsPage from './pages/EmailsPage';
import ShowEmailDetailPage from './pages/ShowEmailDetailPage';

const App = () => {
	return (
		<Routes>
			<Route path="/" element={<MainLayout />}>
				<Route index element={<Navigate to={'courses'} replace />} />
				<Route path="courses" element={<CoursesTable />} />
				<Route path="enrollments/:id" element={<ShowMemberPage />}></Route>
				<Route path="send-email" element={<SendEmailPage />}></Route>
				<Route path="emails/:id" element={<ShowEmailDetailPage />}></Route>
				<Route path="emails" element={<EmailsPage />}></Route>
			</Route>
			<Route path="login" element={<Login />}></Route>
		</Routes>
	);
};
export default App;
