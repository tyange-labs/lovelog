import { useDrawer } from '#/lib/drawer';

export default function Header() {
	const { isOpen, toggle } = useDrawer();

	return (
		<header className="sticky top-0 z-30 bg-[var(--color-bg)]">
			<div className="flex h-14 items-center justify-between px-4">
				<span className="w-8" />
				<h1 className="font-wordmark text-2xl tracking-[0.08em] text-[var(--color-accent)]">
					THE LOVELOG
				</h1>
				<button
					type="button"
					onClick={toggle}
					aria-expanded={isOpen}
					aria-controls="log-drawer"
					aria-label={isOpen ? '로그 목록 닫기' : '로그 목록 열기'}
					className="h-6 w-8 border-2 border-[var(--color-accent)]"
				/>
			</div>
		</header>
	);
}
