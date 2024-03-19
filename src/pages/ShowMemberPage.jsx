import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SearchOutlined } from '@ant-design/icons';
import { notification, Space, Table, Button, Modal, Flex, Typography, Input } from 'antd';
import { useMounted } from '../hooks/useMounted';
import { useParams, useNavigate } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { storeEmails } from '../store/slices/emailsSlice';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import Highlighter from 'react-highlight-words';
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
	const authenticatedUser = getAuthenticatedUser();
	const currentEmailLoggedIn = authenticatedUser?.email;
	const [apiNotification, contextHolderNotification] = notification.useNotification();
	const [modal, contextHolderModal] = Modal.useModal();
	const [searchText, setSearchText] = useState('');
	const [searchedColumn, setSearchedColumn] = useState('');
	const searchInput = useRef(null);
	const handleSearch = (selectedKeys, confirm, dataIndex) => {
		confirm();
		setSearchText(selectedKeys[0]);
		setSearchedColumn(dataIndex);
	};
	const handleReset = (clearFilters) => {
		clearFilters();
		setSearchText('');
	};

	const dispatch = useDispatch();
	const fetch = useCallback(
		async (pagination) => {
			setTableData((tableData) => ({ ...tableData, loading: true }));
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
					// const responseUrlDetail = await getAuthenticatedHttpClient().get(urlGetDetails);
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
			} else {
				setTableData((tableData) => ({ ...tableData, loading: false }));
			}
		},
		[isMounted]
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

	const getColumnSearchProps = (dataIndex) => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
			<div
				style={{
					padding: 8,
				}}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<Input
					ref={searchInput}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
					style={{
						marginBottom: 8,
						display: 'block',
					}}
				/>
				<Space>
					<Button
						type="primary"
						onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
						icon={<SearchOutlined />}
						size="small"
						style={{
							width: 90,
						}}
					>
						Search
					</Button>
					<Button
						onClick={() => clearFilters && handleReset(clearFilters)}
						size="small"
						style={{
							width: 90,
						}}
					>
						Reset
					</Button>
					<Button
						type="link"
						size="small"
						onClick={() => {
							confirm({
								closeDropdown: false,
							});
							setSearchText(selectedKeys[0]);
							setSearchedColumn(dataIndex);
						}}
					>
						Filter
					</Button>
					<Button
						type="link"
						size="small"
						onClick={() => {
							close();
						}}
					>
						close
					</Button>
				</Space>
			</div>
		),
		filterIcon: (filtered) => (
			<SearchOutlined
				style={{
					color: filtered ? '#1677ff' : undefined,
				}}
			/>
		),
		onFilter: (value, record) =>
			record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
		onFilterDropdownOpenChange: (visible) => {
			if (visible) {
				setTimeout(() => searchInput.current?.select(), 100);
			}
		},
		render: (text) =>
			searchedColumn === dataIndex ? (
				<Highlighter
					highlightStyle={{
						backgroundColor: '#ffc069',
						padding: 0,
					}}
					searchWords={[searchText]}
					autoEscape
					textToHighlight={text ? text.toString() : ''}
				/>
			) : (
				text
			),
	});

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
			return;
		}
		if (selectedEmails.includes(currentEmailLoggedIn)) {
			apiNotification.error({
				message: 'You cannot send email to yourself',
				description: 'You cannot send email to yourself',
				duration: 2,
			});
			return;
		}
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
	};

	const columns = [
		{
			title: 'Name',
			dataIndex: 'name',
			width: '15%',
			...getColumnSearchProps('name'),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			width: '15%',
			...getColumnSearchProps('email'),
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
					justifyContent: 'space-between',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<Flex>
					{selectedEmails?.length > 0 && (
						<Typography.Text>Selected emails: {selectedEmails?.length}</Typography.Text>
					)}
				</Flex>
				<Flex gap={24} align="center">
					<Typography.Text>Total members: {tableData?.data?.length ?? 0}</Typography.Text>
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
