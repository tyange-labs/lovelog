import { Outlet, createRootRoute } from '@tanstack/react-router';
import Header from '#/components/Header';

export const Route = createRootRoute({ component: RootLayout });

function RootLayout() {
	return (
		<div className="frame min-h-svh font-sans antialiased">
			<Header />
			<Outlet />
		</div>
	);
}
