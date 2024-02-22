export const BASE_URL = `${process.env.LMS_BASE_URL}` || 'http://local.edly.io:8000';
export const BASE_URL_API = `${process.env.LMS_BASE_URL}/api` || 'http://local.edly.io:8000/api';
export const BASE_URL_API_BE = `${process.env.BE_BASE_URL}` || 'http://localhost:3000/api/v1';
export const FONTS = [
	'epilogue',
	'arial',
	'comic-sans',
	'courier-new',
	'georgia',
	'helvetica',
	'lucida',
	'roboto',
	'sans-serif',
];

export const API_STORE_IMAGE = `${BASE_URL_API_BE}/files/upload`;
