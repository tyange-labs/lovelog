import { useDrawer } from '#/lib/drawer';
import BookIcon from './BookIcon';

export default function Header() {
	const { isOpen, toggle } = useDrawer();

	return (
		<header className="sticky top-0 z-30 bg-[var(--color-bg)]">
			<div className="flex h-14 items-center justify-between px-4">
				<span className="w-7" />
				<h1 className="font-wordmark relative top-[2px] -left-[2px] text-2xl tracking-[0.08em] text-[var(--color-accent)]">
					THE LOVELOG
				</h1>
				<button
					type="button"
					onClick={toggle}
					aria-expanded={isOpen}
					aria-controls="log-drawer"
					aria-label={isOpen ? '로그 목록 닫기' : '로그 목록 열기'}
					className="text-[var(--color-accent)]"
				>
					<BookIcon />
				</button>
			</div>
		</header>
	);
}
