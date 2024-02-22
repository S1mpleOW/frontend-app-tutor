import React from 'react';
import { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageUploader from 'quill-image-uploader';
import { message } from 'antd';
import { API_STORE_IMAGE, FONTS } from '../../utils/constants';
import { Tooltip } from 'antd';

const CustomUndo = () => (
	<svg viewBox="0 0 18 18">
		<polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
		<path className="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9" />
	</svg>
);

// Redo button icon component for Quill editor
const CustomRedo = () => (
	<svg viewBox="0 0 18 18">
		<polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
		<path className="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5" />
	</svg>
);

// Undo and redo functions for Custom Toolbar
function undoChange() {
	this.quill.history.undo();
}
function redoChange() {
	this.quill.history.redo();
}

// Add sizes to whitelist and register them
const Size = Quill.import('formats/size');
Size.whitelist = ['extra-small', 'small', 'medium', 'large'];
Quill.register(Size, true);

// Add fonts to whitelist and register them
const Font = Quill.import('formats/font');
Font.whitelist = Font.whitelist.concat([...FONTS]);

Quill.register(Font, true);

// Add upload image to toolbar
Quill.register('modules/imageUploader', ImageUploader);

// Modules object for setting up the Quill editor

export const modules = {
	toolbar: {
		container: '#toolbar',
		handlers: {
			undo: undoChange,
			redo: redoChange,
		},
	},
	history: {
		delay: 500,
		maxStack: 100,
		userOnly: true,
	},
	imageUploader: {
		upload: (file) => {
			return new Promise((resolve, reject) => {
				const formData = new FormData();
				formData.append('file', file);
				fetch(API_STORE_IMAGE, {
					method: 'POST',
					body: formData,
				})
					.then((response) => response.json())
					.then((result) => {
						console.log(result);
						message.success('Upload image successfully', 2);
						resolve(result.file.path);
					})
					.catch((error) => {
						reject('Upload failed');
						message.error('Upload image failed, try again later', 2);
						console.error('Error:', error);
					});
			});
		},
	},
};

export const formats = [
	'header',
	'font',
	'size',
	'bold',
	'italic',
	'underline',
	'align',
	'strike',
	'script',
	'blockquote',
	'background',
	'list',
	'bullet',
	'indent',
	'link',
	'image',
	'imageBlot',
	'color',
	'code-block',
];
export const QuillToolbar = () => (
	<div id="toolbar">
		<span className="ql-formats">
			<select className="ql-font" defaultValue="arial">
				{Font?.whitelist.length > 0 &&
					Font.whitelist.map((font) => (
						<option value={font} key={font} className="text-capitalize">
							{font}
						</option>
					))}
			</select>
			<select className="ql-size" defaultValue="medium">
				<option value="extra-small">Size 1</option>
				<option value="small">Size 2</option>
				<option value="medium">Size 3</option>
				<option value="large">Size 4</option>
			</select>
			<select className="ql-header" defaultValue="3">
				<option value="1">Heading</option>
				<option value="2">Subheading</option>
				<option value="3">Normal</option>
			</select>
		</span>
		<span className="ql-formats">
			<Tooltip title="Bold (Ctrl B)">
				<button className="ql-bold" />
			</Tooltip>
			<Tooltip title="Italic (Ctrl I)">
				<button className="ql-italic" />
			</Tooltip>
			<Tooltip title="Underline (Ctrl U)">
				<button className="ql-underline" />
			</Tooltip>

			<Tooltip title="Strike through">
				<button className="ql-strike" />
			</Tooltip>
		</span>
		<span className="ql-formats">
			<Tooltip title="List">
				<button className="ql-list" value="ordered" />
			</Tooltip>
			<Tooltip title="Bullets">
				<button className="ql-list" value="bullet" />
			</Tooltip>
			<Tooltip title="Align left">
				<button className="ql-indent" value="-1" />
			</Tooltip>
			<Tooltip title="Align right">
				<button className="ql-indent" value="+1" />
			</Tooltip>
		</span>
		<span className="ql-formats">
			<Tooltip title="Superscript">
				<button className="ql-script" value="super" />
			</Tooltip>
			<Tooltip title="Subscript">
				<button className="ql-script" value="sub" />
			</Tooltip>
			<Tooltip title="Blockquote">
				<button className="ql-blockquote" />
			</Tooltip>
		</span>
		<span className="ql-formats">
			<Tooltip title="Align">
				<select className="ql-align" />
			</Tooltip>
			<Tooltip title="Text color">
				<select className="ql-color" />
			</Tooltip>
			<Tooltip title="Background color">
				<select className="ql-background" />
			</Tooltip>
		</span>
		<span className="ql-formats">
			<Tooltip title="Assign link">
				<button className="ql-link" />
			</Tooltip>
			<Tooltip title="Insert image">
				<button className="ql-image" />
			</Tooltip>
			<Tooltip title="Embed video">
				<button className="ql-video" />
			</Tooltip>
		</span>
		<span className="ql-formats">
			<Tooltip title="formula">
				<button className="ql-formula" />
			</Tooltip>
			<Tooltip title="Code block">
				<button className="ql-code-block" />
			</Tooltip>
			<Tooltip title="Clean formating">
				<button className="ql-clean" />
			</Tooltip>
		</span>
		<span className="ql-formats">
			<Tooltip title="Undo">
				<button className="ql-undo">
					<CustomUndo />
				</button>
			</Tooltip>
			<Tooltip title="Redo">
				<button className="ql-redo">
					<CustomRedo />
				</button>
			</Tooltip>
		</span>
	</div>
);

export default QuillToolbar;
