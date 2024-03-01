import React, { useEffect, useState } from 'react';
import {
	Typography,
	Form,
	Input,
	Button,
	Radio,
	Flex,
	DatePicker,
	ConfigProvider,
	Space,
	Popover,
	message,
	Modal,
} from 'antd';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import TextEditor from '../components/text-editor/TextEditor';
import { BASE_URL_API_BE, EMAIL_OPTIONS } from '../utils/constants';

const FormItem = Form.Item;
export default function UpdateEmailPage() {
	const { emailId } = useParams();
	const [email, setEmail] = useState({});
	const [form] = Form.useForm();
	const dateSendEmail = Form.useWatch('sendAt', form);
	const [modal, contextHolderModal] = Modal.useModal();
	useEffect(() => {
		(async () => {
			if (emailId) {
				const response = await fetch(`${BASE_URL_API_BE}/learners/emails/${emailId}`);
				const data = await response.json();
				setEmail(data);
				form.setFieldsValue({
					subject: data.subject,
					body: data.body,
				});
				onChangeDateTime(new Date(data.sendAt));
			}
		})();
	}, [emailId]);
	const resetForm = () => {
		form.resetFields();
	};
	const handleFormSubmit = async (values) => {
		const content = values.body;
		if (content.includes('script')) {
			message.error('Content must not contain script tag', 2);
			return;
		}
		try {
			const response = await fetch(`${BASE_URL_API_BE}/learners/emails/${emailId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(values),
			});
			console.log('🚀 ~ handleFormSubmit ~ response:', response);
			const data = await response.json();
			console.log('🚀 ~ handleFormSubmit ~ data:', data);
			if (response.status !== 200 || !data?.id) {
				message.error(data.message, 2);
				return;
			}
			resetForm();
			message.success('Email has been updated successfully', 2);
		} catch (error) {
			message.error('An error occurred while updating email', 2);
		}
	};
	const handleModalConfirmSendEmail = (values) => {
		const recipients = email?.recipients ? [...email.recipients] : [];
		if (!Array.isArray(recipients) || recipients.length === 0) {
			message.error('Please select at least one email to send', 2);
			return;
		}
		modal.confirm({
			title: 'Send Email',
			content: `Are you sure you want to send email to ${recipients.join(', ')}?`,
			onOk() {
				handleFormSubmit(values);
			},
		});
	};

	const contentShowEmails = () => {
		const recipients = email?.recipients;
		if (Array.isArray(recipients)) {
			return (
				<Flex vertical gap={8}>
					{recipients.map((email) => {
						return <Typography.Text key={email}>{email}</Typography.Text>;
					})}
				</Flex>
			);
		}
		return <Typography.Text>No emails to show, please try again</Typography.Text>;
	};

	const onChangeDateTime = (value) => {
		form.validateFields(['sendAt']);
		form.setFieldValue('sendAt', value?.toISOString() || '');
	};

	const renderDatePickerSendEmail = () => {
		return (
			<FormItem
				label="Choose time to send email"
				name="sendAt"
				rules={[
					{
						type: 'object',
						validator: () => {
							if (!email?.sendAt) return Promise.resolve();
							const date = new Date(dateSendEmail);
							if (date.getTime() < new Date().getTime()) {
								return Promise.reject('Please choose a future date');
							}
							return Promise.resolve();
						},
					},
				]}
			>
				<ConfigProvider>
					<DatePicker
						showTime
						autoComplete="off"
						onChange={onChangeDateTime}
						value={dayjs(dateSendEmail)}
						placeholder="Choose date and time to send email"
					/>
				</ConfigProvider>
			</FormItem>
		);
	};

	if (email.sendEmailOption === EMAIL_OPTIONS.NONE) {
		return (
			<Flex align="center" justify="center" vertical>
				<Typography.Title>
					This email have already sent. Therefore, it cannot update anything!
				</Typography.Title>
				<Button onClick={() => window.history.back()}>Back</Button>
			</Flex>
		);
	}

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '12px',
			}}
		>
			<div
				style={{
					margin: 'auto',
					width: '50%',
				}}
			>
				<Flex align="baseline" justify="space-between">
					<Typography.Title level={3}>Update an email</Typography.Title>
					<Typography.Paragraph
						style={{
							maxWidth: '50%',
						}}
					>
						You are updating an email which is send{' '}
						<Popover content={contentShowEmails} title="Emails" trigger="click">
							<Button
								type="link"
								style={{
									paddingInline: '0px',
								}}
							>
								to
							</Button>
						</Popover>
					</Typography.Paragraph>
				</Flex>
				<Form
					name="email-form-update"
					form={form}
					layout="vertical"
					autoComplete="off"
					onFinish={handleModalConfirmSendEmail}
				>
					<FormItem
						label="Subject"
						name="subject"
						rules={[
							{
								required: true,
								message: 'Please enter a subject',
							},
						]}
					>
						<Input placeholder="Enter subject" />
					</FormItem>
					<FormItem
						label="Content"
						name="body"
						rules={[
							{
								required: true,
								message: 'Please enter content',
							},
							{
								min: 10,
								message: 'Content must be at least 10 characters',
							},
						]}
					>
						<TextEditor />
					</FormItem>

					{renderDatePickerSendEmail()}

					<FormItem
						style={{
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						<Button
							type="primary"
							htmlType="submit"
							style={{
								width: '300px',
							}}
						>
							Send
						</Button>
					</FormItem>
				</Form>
			</div>
			{contextHolderModal}
		</div>
	);
}
