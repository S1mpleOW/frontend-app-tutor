import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notification, Space, Table, Button, Modal, Flex } from 'antd';
import { useMounted } from '../hooks/useMounted';
import api from '../api/resource.api';
import { useParams, useNavigate } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { storeEmails } from '../store/slices/emailsSlice';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
const initialPagination = {
	current: 1,
	pageSize: 5,
};

export default function ShowMemberPage() {
	const selectedEmails = useSelector((state) => state.emails.value) || [];
	const [tableData, setTableData] = useState({
		data: [],
		pagination: initialPagination,
		loading: false,
	});
	const { isMounted } = useMounted();
	const { id: courseId } = useParams();
	const auth = useSelector((state) => state.auth);
	const [apiNotification, contextHolderNotification] = notification.useNotification();
	const [modal, contextHolderModal] = Modal.useModal();
	const dispatch = useDispatch();
	const fetch = useCallback(
		async (pagination) => {
			setTableData((tableData) => ({ ...tableData, loading: true }));
			if (auth?.accessToken) {
				const urlGetEnrollment = new URL(
					`${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollments?course_id=${encodeURIComponent(
						courseId
					)}`
				);

				const response = await getAuthenticatedHttpClient().get(urlGetEnrollment);
				const data = response.data;
				if (Array.isArray(data?.results)) {
					if (isMounted.current) {
						const enrollments = data.results.map((item) => {
							return item.user;
						});

						const urlGetDetails = new URL(
							`${getConfig().LMS_BASE_URL}/api/user/v1/accounts?username=${enrollments.join(',')}`
						);
						const responseUrlDetail = await getAuthenticatedHttpClient().get(urlGetDetails);
						const dataUrlDetail = responseUrlDetail.data;
						if (Array.isArray(dataUrlDetail)) {
							let mappedData = dataUrlDetail.map((item) => {
								return {
									key: item.email,
									name: item.name,
									email: item.email,
									profile_image: item.profile_image.image_url_small,
									is_active: item.is_active,
									last_login: item.last_login,
									date_joined: item.date_joined,
								};
							});
							mappedData = mappedData.sort((a, b) => b.is_active - a.is_active);
							setTableData({
								data: mappedData,
								pagination: {
									...pagination,
									...data?.pagination,
								},
								loading: false,
							});
						}
					}
				}
			} else {
				setTableData((tableData) => ({ ...tableData, loading: false }));
			}
		},
		[isMounted, auth?.accessToken]
	);
	const navigate = useNavigate();
	const rowSelection = {
		selectedRowKeys: selectedEmails,
		onChange: (_, selectedRows) => {
			const newSelectedEmails = selectedRows.map((item) => item.email);
			dispatch(storeEmails(newSelectedEmails));
		},
		getCheckboxProps: (record) => ({
			disabled: !record.is_active,
			name: record.email,
		}),
	};

	useEffect(() => {
		fetch(initialPagination);
	}, [fetch]);

	const handleTableChange = (pagination) => {
		fetch(pagination);
	};

	const handleNavigateSendEmailPage = () => {
		// navigate('/send-email');
		if (selectedEmails.length === 0) {
			apiNotification.error({
				message: 'Please select at least one email to send',
				description: 'You must select at least one email to send',
				duration: 2,
			});
		} else {
			modal.confirm({
				title: 'Send Email',
				content: `Are you sure you want to send email to ${selectedEmails.join(', ')}?`,
				onOk() {
					navigate('/send-email', {
						state: { emails: selectedEmails },
					});
				},
				onCancel() {
					console.log('Cancel');
				},
			});
		}
	};

	const columns = [
		{
			title: 'Name',
			dataIndex: 'name',
			width: '15%',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			width: '15%',
		},
		{
			title: 'Profile image',
			dataIndex: 'profile_image',
			width: '20%',
			render: (value) => {
				return (
					<img
						src={value}
						alt="banner"
						style={{
							objectFit: 'cover',
							width: '150px',
							aspectRatio: '16/9',
							position: 'relative',
							left: '50%',
							transform: 'translateX(-50%)',
						}}
					/>
				);
			},
		},
		{
			title: 'Last login',
			dataIndex: 'last_login',
			width: '15%',
			render: (value) => {
				return new Date(value).toLocaleString();
			},
			sorter: (a, b) => {
				return new Date(a.last_login).getTime() - new Date(b.last_login).getTime();
			},
		},
		{
			title: 'Date joined',
			dataIndex: 'date_joined',
			width: '15%',
			render: (value) => {
				return new Date(value).toLocaleString();
			},
			sorter: (a, b) => {
				return new Date(a.date_joined).getTime() - new Date(b.date_joined).getTime();
			},
		},
		{
			title: 'Is activate email',
			dataIndex: 'is_active',
			width: '10%',
			render: function (value) {
				return value ? 'Yes' : 'No';
			},
			sorter: (a, b) => a.is_active - b.is_active,
		},
	];
	return (
		<Space
			direction="vertical"
			size={12}
			style={{
				width: '100%',
			}}
		>
			<Space
				style={{
					justifyContent: 'flex-end',
					display: 'flex',
				}}
			>
				<Flex>
					<Button type="primary" onClick={handleNavigateSendEmailPage}>
						Send email
					</Button>
				</Flex>
			</Space>
			<Table
				rowSelection={{
					type: 'checkbox',
					...rowSelection,
				}}
				bordered
				dataSource={tableData.data}
				columns={columns}
				rowClassName="editable-row"
				pagination={{
					...tableData.pagination,
				}}
				onChange={handleTableChange}
				loading={tableData.loading}
				scroll={{ x: 800 }}
			/>
			{contextHolderNotification}
			{contextHolderModal}
		</Space>
	);
}
