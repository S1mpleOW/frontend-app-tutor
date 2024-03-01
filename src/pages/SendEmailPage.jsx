import React from 'react';
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
import TextEditor from '../components/text-editor/TextEditor';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BASE_URL_API_BE, EMAIL_OPTIONS } from '../utils/constants';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
const FormItem = Form.Item;

export default function SendEmailPage() {
	const [form] = Form.useForm();
	const emailsSelected = useSelector((state) => state.emails.value) || [];
	const sendEmailOption = Form.useWatch('sendEmailOption', form);
	const navigate = useNavigate();
	const [modal, contextHolderModal] = Modal.useModal();
	const handleResetAllFields = () => {
		form.setFieldsValue({
			subject: '',
			body: '',
			sendEmailOption: EMAIL_OPTIONS.NONE,
			sendAt: '',
		});
	};
	const handleFormSubmit = async (values) => {
		if (values.sendEmailOption === EMAIL_OPTIONS.NONE) {
			values.sendAt = new Date().toISOString();
		}

		const recipients = [...emailsSelected];
		const authenticatedUser = getAuthenticatedUser();
		const sender = authenticatedUser?.email;
		if (!sender) {
			message.error('Please login to send email', 2);
			return;
		}
		const content = values.body;
		if (content.includes('script')) {
			message.error('Content must not contain script tag', 2);
			return;
		}
		const data = {
			...values,
			sender,
			recipients,
		};
		try {
			const response = await fetch(`${BASE_URL_API_BE}/learners/send-email`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});
			const dataResponse = await response.json();
			if (response.status === 200 && dataResponse?.id) {
				message.success('Email sent successfully', 2);
				handleResetAllFields();
				return;
			} else {
				message.error('Error when sending email, please try again!', 2);
			}
		} catch (e) {
			console.log(e);
			message.error('Error when sending email, please try again!', 2);
		}
	};

	const handleModalConfirmSendEmail = (values) => {
		if (emailsSelected.length === 0) {
			message.error('Please select at least one email to send', 2);
			return;
		}
		modal.confirm({
			title: 'Send Email',
			content: `Are you sure you want to send email to ${emailsSelected.join(', ')}?`,
			onOk() {
				handleFormSubmit(values);
			},
		});
	};

	const onChangeDateTime = (value) => {
		form.setFieldValue('sendAt', value?.toISOString() || '');
	};

	const renderSendEmailMonthly = () => {
		if (sendEmailOption === EMAIL_OPTIONS.MONTHLY || sendEmailOption === EMAIL_OPTIONS.SCHEDULED) {
			return (
				<FormItem
					label="Choose time to send email"
					name="sendAt"
					rules={[
						{
							required: true,
							message: 'Please enter valid values',
						},
						{
							type: 'object',
							validator: (rule, value) => {
								const date = new Date(value);
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
							placeholder="Choose date and time to send email"
						/>
					</ConfigProvider>
				</FormItem>
			);
		}
		return null;
	};

	const contentShowEmails = () => {
		return (
			<Flex vertical gap={8}>
				{emailsSelected.map((email) => {
					return <Typography.Text key={email}>{email}</Typography.Text>;
				})}
			</Flex>
		);
	};

	if (emailsSelected.length === 0) {
		return (
			<Flex vertical gap={8} align="center">
				<Typography.Title level={3}>Please select emails to send</Typography.Title>
				<Button onClick={() => navigate(-1)}>Back</Button>
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
					<Typography.Title level={3}>Send an email</Typography.Title>
					<Typography.Paragraph
						style={{
							maxWidth: '50%',
						}}
					>
						You are sending an email{' '}
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
					name="email-form"
					form={form}
					layout="vertical"
					autoComplete="off"
					onFinish={handleModalConfirmSendEmail}
					initialValues={{
						sendEmailOption: EMAIL_OPTIONS.NONE,
					}}
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
					<Space align="center" size={24}>
						<FormItem
							label="Do you want to schedule to send email or send email monthly?"
							name="sendEmailOption"
						>
							<Radio.Group>
								<Radio value={EMAIL_OPTIONS.MONTHLY}>Send email monthly</Radio>
								<Radio value={EMAIL_OPTIONS.SCHEDULED}>Delay sending email</Radio>
								<Radio value={EMAIL_OPTIONS.NONE}>None</Radio>
							</Radio.Group>
						</FormItem>
						{renderSendEmailMonthly()}
					</Space>
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
