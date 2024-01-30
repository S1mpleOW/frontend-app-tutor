import axios from 'axios';
import { BASE_URL } from '../utils/constants';

const instance = axios.create({
	baseURL: BASE_URL,
	timeout: 1000,
	headers: {},
});

instance.interceptors.request.use(function (config) {
	return config;
});

// instance.interceptors.response.use(
// 	function (response) {
// 		console.log('🚀 ~ response:', response);
// 		return response;
// 	},
// 	function (error) {
// 		if (error.response.status !== 401) {
// 			return Promise.reject(error);
// 		}
// 		axios.interceptors.response.eject(interceptor);
// 		return axios
// 			.post('/oauth2/access_token', {
// 				refresh_token: localStorage.getItem('refresh_token'),
// 				grant_type: 'refresh_token',
// 			})
// 			.then((response) => {
// 				localStorage.setItem('access_token', response.data.access_token);
// 				localStorage.setItem('refresh_token', response.data.refresh_token);

// 				error.response.config.headers['Authorization'] = `Bearer ${response.data.access_token}`;

// 				return axios(error.response.config);
// 			})
// 			.catch((error) => {
// 				return Promise.reject(error);
// 			});
// 	}
// );

class AuthService {
	async getTokens() {
		const formData = new FormData();
		formData.append('client_id', 'login-service-client-id');
		formData.append('grant_type', 'password');
		formData.append('username', 's1mpleow');
		formData.append('password', 'ka260102');
		formData.append('token_type', 'jwt');
		const data = await instance.post(`/oauth2/access_token`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		const { access_token, refresh_token, expires_in } = data.data;
		return { access_token, refresh_token, expires_in };
	}
}
export default AuthService;
