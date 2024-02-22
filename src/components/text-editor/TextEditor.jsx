import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import QuillToolbar, { formats, modules } from './QuillToolbar';

const TextEditor = ({ value, onChange, placeholder }) => {
	return (
		<div className="w-full entry-content">
			<QuillToolbar />
			<ReactQuill
				theme="snow"
				value={value || ''}
				modules={modules}
				formats={formats}
				onChange={onChange}
				placeholder={placeholder}
				style={{
					height: '200px',
					margin: 'auto',
					width: '100%',
					borderRadius: '2px',
					marginBottom: '50px',
				}}
			/>
		</div>
	);
};

export default TextEditor;
