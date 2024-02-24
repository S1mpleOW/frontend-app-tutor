import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { Layout, theme, Button } from 'antd';
const { Content } = Layout;
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { StudioHeader as Header } from '@edx/frontend-component-header';
import Footer from '@edx/frontend-component-footer';
import { Outlet } from 'react-router-dom';
import messages from '../../i18n/index';
import { useSelector } from 'react-redux';

export default function MainLayout() {
	const {
		token: { colorBgContainer, borderRadiusLG },
	} = theme.useToken();
	const auth = useSelector((state) => state.auth);
	console.log('🚀 ~ MainLayout ~ auth:', auth);

	return (
		<IntlProvider locale="en" messages={messages[3]['uk']}>
			<Layout>
				<Header
					title="Fast AI Studio"
					mainMenuDropdowns={[
						{
							id: '1',
							buttonTitle: 'Options',
							items: [
								{
									href: '/',
									title: 'Courses',
								},
								{
									href: '/emails',
									title: 'Show all emails',
								},
								{
									href: '/send-email',
									title: 'Send Email',
								},
							],
						},
					]}
					buttonTitle="hello"
					isHiddenMainMenu={false}
					outlineLink="/"
					intl={messages[0]}
				/>
				<Content
					style={{
						margin: '24px 16px 0',
					}}
				>
					<div
						style={{
							padding: 24,
							minHeight: '100vh',
							background: colorBgContainer,
							borderRadius: borderRadiusLG,
						}}
					>
						<Outlet />
					</div>
				</Content>
				<Footer intl={messages[1]}>
					Ant Design ©{new Date().getFullYear()} Created by Ant UED
				</Footer>
			</Layout>
		</IntlProvider>
	);
}
