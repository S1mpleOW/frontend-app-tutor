import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {
	APP_INIT_ERROR,
	APP_READY,
	subscribe,
	initialize,
	mergeConfig,
	getConfig,
} from '@edx/frontend-platform';
import ReactDOM from 'react-dom';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import messages from './i18n';
import './index.scss';
import App from './App';
import { store } from './store';
import { Navigate, useLocation } from 'react-router-dom';

const TruncatedLocation = () => {
	const location = useLocation();

	if (location.pathname.endsWith('/')) {
		return <Navigate to={location.pathname.slice(0, -1)} replace />;
	}
	return null;
};

subscribe(APP_READY, () => {
	ReactDOM.render(
		<AppProvider store={store}>
			<TruncatedLocation />
			<App />
		</AppProvider>,
		document.getElementById('root')
	);
});

subscribe(APP_INIT_ERROR, (error) => {
	ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
	handlers: {
		config: () => {
			mergeConfig({
				BE_BASE_URL: process.env.BE_BASE_URL || 'http://127.0.0.1:3000/api/v1',
				BASE_NAME: process.env.BASE_NAME || '/mfe_frontendapptutor',
			});
		},
	},
	messages,
});
