import { AuthProvider, createAuthClient } from '@agentuity/auth/react';
import { AgentuityProvider } from '@agentuity/react';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const authClient = createAuthClient();

function init() {
	const elem = document.getElementById('root');

	if (!elem) {
		throw new Error('Root element not found');
	}

	const app = (
		<StrictMode>
			<AgentuityProvider>
				<AuthProvider authClient={authClient}>
					<App />
				</AuthProvider>
			</AgentuityProvider>
		</StrictMode>
	);

	if (import.meta.hot) {
		const root = (import.meta.hot.data.root ??= createRoot(elem));
		root.render(app);
	} else {
		createRoot(elem).render(app);
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
