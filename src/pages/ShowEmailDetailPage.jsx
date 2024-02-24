import React, { useEffect, useState } from 'react';
import { Typography, Flex, Button, Tooltip } from 'antd';
import { BASE_URL_API_BE } from '../utils/constants';
import { useParams } from 'react-router-dom';
import parse from 'html-react-parser';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function ShowEmailDetailPage() {
	const [email, setEmail] = useState(null);
	const { id } = useParams();
	useEffect(() => {
		(async () => {
			if (!id) {
				return;
			}
			const response = await fetch(`${BASE_URL_API_BE}/learners/emails/${id}`);
			if (response.status === 200) {
				const data = await response.json();
				setEmail(data);
			}
		})();
	}, []);

	useEffect(() => {
		if (email?.subject) {
			document.title = email.subject;
		}
	}, [email?.subject]);

	if (!id || !email) {
		return (
			<Flex vertical gap={24} align="center" justify="center">
				<Typography.Title level={3}>Oops!</Typography.Title>
				<Typography.Text>Email is not found, please try again later!</Typography.Text>
				<Button
					href="/emails"
					style={{
						width: '100px',
					}}
				>
					Back
				</Button>
			</Flex>
		);
	}

	const handleNavigateBack = () => {
		window.history.back();
	};

	return (
		<Flex gap={24}>
			<Tooltip title="Back">
				<Button
					type="dashed"
					shape="circle"
					icon={<ArrowLeftOutlined />}
					onClick={handleNavigateBack}
					style={{
						marginTop: '4px',
					}}
				/>
			</Tooltip>
			<Flex vertical gap={12}>
				<Typography.Title level={3}>{email?.subject}</Typography.Title>
				<Flex
					vertical
					gap={12}
					style={{
						width: '100%',
						maxWidth: '600px',
					}}
				>
					<Typography.Text>
						From: {'<'}
						<Typography.Text strong>{email?.sender}</Typography.Text>
						{'>'}
					</Typography.Text>
					<Typography.Text>
						To: {'<'}
						<Typography.Text strong>{email?.recipients?.join(', ')}</Typography.Text>
						{'>'}
					</Typography.Text>

					<div
						className="entry-content ql-editor"
						style={{
							paddingInline: 0,
						}}
					>
						{parse(email?.body)}
					</div>
				</Flex>
			</Flex>
		</Flex>
	);
}
