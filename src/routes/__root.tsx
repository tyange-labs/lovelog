import { Outlet, createRootRoute } from '@tanstack/react-router';
import Header from '#/components/Header';
import { DrawerProvider } from '#/lib/drawer';

export const Route = createRootRoute({ component: RootLayout });

function RootLayout() {
	return (
		<DrawerProvider>
			<div className="frame min-h-svh font-sans antialiased">
				<Header />
				<Outlet />
			</div>
		</DrawerProvider>
	);
}
