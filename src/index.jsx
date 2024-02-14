import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { APP_INIT_ERROR, APP_READY, subscribe, initialize } from '@edx/frontend-platform';
import ReactDOM from 'react-dom';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import messages from './i18n';
import './index.scss';
import App from './App';
import { store } from './store';

subscribe(APP_READY, () => {
	ReactDOM.render(
		<AppProvider store={store}>
			<App />
		</AppProvider>,
		document.getElementById('root')
	);
});

subscribe(APP_INIT_ERROR, (error) => {
	ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
	// handlers: {
	// 	config: () => {
	// 		mergeConfig({}, 'frontendapptutorplugin');
	// 	},
	// },
	messages,
});
