import { Route, Router } from '@solidjs/router';
import type { JSX } from 'solid-js';
import Header from '#/components/Header';
import Timeline from '#/routes/Timeline';
import PostPage from '#/routes/PostPage';

function RootLayout(props: { children?: JSX.Element }) {
	return (
		<div class="frame min-h-lvh font-sans antialiased">
			<Header />
			{props.children}
		</div>
	);
}

export default function App() {
	return (
		<Router root={RootLayout}>
			<Route path="/" component={Timeline} />
			<Route path="/p/:id" component={PostPage} />
			<Route path="*" component={Timeline} />
		</Router>
	);
}
