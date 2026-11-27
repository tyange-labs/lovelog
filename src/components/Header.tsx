import { createSignal } from 'solid-js';
import { A } from '@solidjs/router';
import { applyTheme, currentTheme } from '#/lib/theme';

export default function Header() {
	const [theme, setTheme] = createSignal(currentTheme());

	function toggle() {
		const next = theme() === 'dark' ? 'light' : 'dark';
		applyTheme(next);
		setTheme(next);
	}

	return (
		<header class="site-header">
			<A href="/">LOVELOG</A>
			<button type="button" onClick={toggle}>
				{theme() === 'dark' ? '밝게' : '어둡게'}
			</button>
		</header>
	);
}
