import { A } from '@solidjs/router';

export default function Header() {
	return (
		<header class="sticky top-0 z-30 bg-[var(--color-bg)]">
			<div class="flex h-14 items-center justify-center px-4">
				<A
					href="/"
					class="font-wordmark relative top-[2px] text-2xl tracking-[0.08em] text-[var(--color-accent)]"
				>
					LOVELOG
				</A>
			</div>
		</header>
	);
}
