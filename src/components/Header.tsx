export default function Header() {
	return (
		<header className="sticky top-0 z-10 bg-[var(--color-bg)]">
			<div className="flex h-14 items-center justify-between px-4">
				<span className="w-8" />
				<h1 className="text-lg font-extrabold tracking-[0.12em] text-[var(--color-accent)]">
					THE LOVELOG
				</h1>
				<span
					aria-hidden="true"
					className="h-6 w-8 border-2 border-[var(--color-accent)]"
					title="책 아이콘 자리"
				/>
			</div>
		</header>
	);
}
