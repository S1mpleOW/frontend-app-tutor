import React, { useCallback, useEffect, useState } from 'react';
import { Space, Table, Button, message, Popconfirm, Tag, Flex, Typography } from 'antd';
import { BASE_URL_API_BE, EMAIL_OPTIONS } from '../utils/constants';
import { useMounted } from '../hooks/useMounted';
import { useNavigate } from 'react-router-dom';
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
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
	const navigate = useNavigate();

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
	const handleCancelSendEmailScheduled = async (emailId) => {
		try {
			const response = await fetch(
				`${BASE_URL_API_BE}/learners/emails/${emailId}/cancel-send-email-scheduled`,
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
	const handleUpdateEmail = (emailId) => {
		navigate(`/emails/${emailId}/edit`);
	};

	const columns = [
		{
			title: 'Subject',
			dataIndex: 'subject',
			key: 'subject',
		},
		{
			title: 'Send at',
			dataIndex: 'sendAt',
			key: 'sendAt',
			render: (text) => <span>{new Date(text).toLocaleString()}</span>,
			sorter: (a, b) => {
				return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
			},
		},
		{
			title: 'Recipients',
			dataIndex: 'recipients',
			key: 'recipients',
			render: (text, record) => <span>{record.recipients.join(', ')}</span>,
		},
		{
			title: 'Type',
			dataIndex: 'sendEmailOption',
			key: 'sendEmailOption',
			sorter: (a, b) => {
				return a.sendEmailOption.localeCompare(b.sendEmailOption);
			},
			render: (text, record) => {
				if (text === EMAIL_OPTIONS.MONTHLY) {
					return (
						<Tag color="blue-inverse" icon={<ClockCircleOutlined />}>
							{text}
						</Tag>
					);
				}
				if (text === EMAIL_OPTIONS.SCHEDULED) {
					return (
						<Tag icon={<ClockCircleOutlined />} color="default">
							{text}
						</Tag>
					);
				}
				return (
					<Tag color="success" icon={<CheckCircleOutlined />}>
						{text}
					</Tag>
				);
			},
		},
		{
			title: 'Actions',
			render: (text, record) => {
				const isSent = new Date(record.sendAt).getTime() < new Date().getTime();

				return (
					<Space>
						<Button type="primary" onClick={() => handleShowEmail(record.key)}>
							View detail
						</Button>

						{record?.sendEmailOption === EMAIL_OPTIONS.MONTHLY ? (
							<>
								<Button type="primary" ghost onClick={() => handleUpdateEmail(record.key)}>
									Edit
								</Button>

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
							</>
						) : null}

						{!isSent && record?.sendEmailOption === EMAIL_OPTIONS.SCHEDULED ? (
							<>
								<Button type="primary" ghost onClick={() => handleUpdateEmail(record.key)}>
									Edit
								</Button>

								<Popconfirm
									title="Are you sure?"
									description="This action will stop sending email which is scheduled to send to all recipients. Are you sure to continue?"
									onConfirm={() => handleCancelSendEmailScheduled(record.key)}
									onCancel={() => {}}
									okText="Yes"
									cancelText="No"
								>
									<Button type="dashed" danger>
										Cancel email scheduled
									</Button>
								</Popconfirm>
							</>
						) : null}
					</Space>
				);
			},
		},
	];
	const handleShowEmail = (emailId) => {
		navigate(`/emails/${emailId}`);
	};
	const fetchData = useCallback(
		async (pagination) => {
			setTableData((tableData) => ({ ...tableData, loading: true }));
			const response = await fetch(`${BASE_URL_API_BE}/learners/emails`);
			if (response.status === 200) {
				const data = await response.json();
				console.log('🚀 ~ data:', data);
				if (Array.isArray(data)) {
					let mappedData = data.map((item) => {
						return {
							key: item.id,
							subject: item.subject,
							createdAt: item.createdAt,
							recipients: item.recipients,
							body: item.body,
							sendEmailOption: EMAIL_OPTIONS[item.sendEmailOption] ?? EMAIL_OPTIONS.NONE,
							sendAt: item.sendAt,
						};
					});

					mappedData = mappedData.sort((a, b) => {
						return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
					} else {
						setTableData((tableData) => ({ ...tableData, loading: false }));
					}
				}
			}
		},
		[isMounted]
	);
	const handleTableChange = (pagination) => {
		fetchData(pagination);
	};
	useEffect(() => {
		fetchData(initialPagination);
	}, [fetchData]);
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
					justifyContent: 'flex-start',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<Flex gap={24} align="center">
					<Typography.Text>Total emails: {tableData?.data?.length ?? 0}</Typography.Text>
				</Flex>
			</Space>

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
		</Space>
	);
}
