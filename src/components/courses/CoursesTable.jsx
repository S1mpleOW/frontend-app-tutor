import React, { useCallback, useEffect, useState } from 'react';
import { Form, Space, Table, Button } from 'antd';
import { useMounted } from '../../hooks/useMounted';
import { useSelector } from 'react-redux';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { EditableCell } from '../layout/table/EditableCell';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
const initialPagination = {
	current: 1,
	pageSize: 4,
};
export default function CoursesTable() {
	const [form] = Form.useForm();
	const [tableData, setTableData] = useState({
		data: [],
		pagination: initialPagination,
		loading: false,
	});
	const { isMounted } = useMounted();
	const auth = useSelector((state) => state.auth);
	const navigate = useNavigate();
	const fetch = useCallback(
		async (pagination) => {
			setTableData((tableData) => ({ ...tableData, loading: true }));
			if (auth?.accessToken) {
				const response = await getAuthenticatedHttpClient().get(
					`${getConfig().LMS_BASE_URL}/api/courses/v1/courses/`
				);
				const data = response.data;
				if (Array.isArray(data?.results)) {
					if (isMounted.current) {
						const results = data.results.map((item) => {
							return {
								key: item.id,
								name: item.name,
								start_display: item.start_display,
								image: item.media.banner_image.uri_absolute,
								hidden: item.hidden,
							};
						});
						setTableData({
							data: results,
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
		[isMounted, auth?.accessToken]
	);

	useEffect(() => {
		fetch(initialPagination);
	}, [fetch]);

	useEffect(() => {
		(async () => {
			console.log(getAuthenticatedHttpClient());
		})();
	}, []);

	const handleTableChange = (pagination) => {
		fetch(pagination);
	};

	const handleShowMember = async (courseId) => {
		navigate(`/enrollments/${courseId}`);
	};

	const columns = [
		{
			title: 'Name',
			dataIndex: 'name',
			width: '25%',
		},
		{
			title: 'Start Time',
			dataIndex: 'start_display',
			width: '15%',
		},
		{
			title: 'Banner image',
			dataIndex: 'image',
			width: '25%',
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
			title: 'Hidden',
			dataIndex: 'hidden',
			width: '15%',
			render: function (value) {
				return value ? 'Yes' : 'No';
			},
		},
		{
			title: 'Actions',
			width: '20%',
			render: (text, record) => {
				return (
					<Space>
						<Button type="primary" onClick={() => handleShowMember(record.key)}>
							Show members
						</Button>
					</Space>
				);
			},
		},
	];

	return (
		<Form form={form} component={false}>
			<Table
				components={{
					body: {
						cell: EditableCell,
					},
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
		</Form>
	);
}
