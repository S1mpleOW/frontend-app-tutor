import React, { useCallback, useEffect, useState } from 'react';
import { Space, Table, Button, message, Popconfirm } from 'antd';
import { BASE_URL_API_BE } from '../utils/constants';
import { useMounted } from '../hooks/useMounted';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const initialPagination = {
	current: 1,
	pageSize: 5,
};
export default function EmailsPage() {
	const [tableData, setTableData] = useState({
		data: [],
		pagination: initialPagination,
		loading: false,
	});
	const { isMounted } = useMounted();
	const auth = useSelector((state) => state.auth);
	const handleCancelSendEmailMonthly = async (emailId) => {
		try {
			const response = await fetch(
				`${BASE_URL_API_BE}/learners/emails/${emailId}/cancel-send-email-monthly`,
				{
					method: 'PATCH',
				}
			);
			if (response.status === 200) {
				message.success('Cancel send monthly successfully');
				fetchData(tableData.pagination);
			}
		} catch (err) {
			message.error('Cancel send monthly failed, Please try again later!');
		}
	};
	const columns = [
		{
			title: 'Subject',
			dataIndex: 'subject',
			key: 'subject',
		},
		{
			title: 'Created At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (text) => <span>{new Date(text).toLocaleString()}</span>,
			sorter: (a, b) => {
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			},
		},
		{
			title: 'Recipients',
			dataIndex: 'recipients',
			key: 'recipients',
			render: (text, record) => <span>{record.recipients.join(', ')}</span>,
		},
		{
			title: 'Send Monthly',
			dataIndex: 'isSendMonthly',
			key: 'isSendMonthly',
			render: (text, record) => <span>{record.isSendMonthly ? 'Yes' : 'No'}</span>,
		},
		{
			title: 'Actions',
			render: (text, record) => {
				return (
					<Space>
						<Button type="primary" onClick={() => handleShowEmail(record.key)}>
							View detail
						</Button>

						{record?.isSendMonthly ? (
							<Popconfirm
								title="Are you sure?"
								description="This action will stop sending email monthly to all recipients. Are you sure to continue?"
								onConfirm={() => handleCancelSendEmailMonthly(record.key)}
								onCancel={() => {}}
								okText="Yes"
								cancelText="No"
							>
								<Button type="dashed" danger>
									Cancel send monthly
								</Button>
							</Popconfirm>
						) : null}
					</Space>
				);
			},
		},
	];
	const navigate = useNavigate();
	const handleShowEmail = (emailId) => {
		navigate(`/emails/${emailId}`);
	};
	const fetchData = useCallback(
		async (pagination) => {
			setTableData((tableData) => ({ ...tableData, loading: true }));
			if (auth?.accessToken) {
				const response = await fetch(`${BASE_URL_API_BE}/learners/emails`);
				if (response.status === 200) {
					const data = await response.json();
					if (Array.isArray(data)) {
						const mappedData = data.map((item) => {
							return {
								key: item.id,
								subject: item.subject,
								createdAt: item.createdAt,
								recipients: item.recipients,
								body: item.body,
								isSendMonthly: !!item.isSendMonthly,
							};
						});
						if (isMounted.current) {
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
			}
			setTableData((tableData) => ({ ...tableData, loading: false }));
		},
		[isMounted, auth?.accessToken]
	);
	const handleTableChange = (pagination) => {
		fetchData(pagination);
	};
	useEffect(() => {
		fetchData(initialPagination);
	}, [fetchData]);
	return (
		<Table
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
	);
}
