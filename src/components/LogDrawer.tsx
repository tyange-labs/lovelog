import { useEffect } from 'react';
import type { PostListItem } from '#/lib/cms';
import { useDrawer } from '#/lib/drawer';
import LogList from './LogList';

interface LogDrawerProps {
	posts: PostListItem[];
}

export default function LogDrawer({ posts }: LogDrawerProps) {
	const { isOpen, close } = useDrawer();

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				close();
			}
		}

		document.documentElement.classList.add('drawer-open');
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.documentElement.classList.remove('drawer-open');
			document.removeEventListener('keydown', handleKeydown);
		};
	}, [isOpen, close]);

	return (
		<>
			<div
				className={`drawer-backdrop ${isOpen ? 'is-open' : ''}`}
				onClick={close}
				aria-hidden="true"
			/>

			<div className="drawer-layer">
				<aside
					id="log-drawer"
					className={`drawer-panel ${isOpen ? 'is-open' : ''}`}
					aria-label="로그 목록"
					inert={!isOpen}
				>
					<LogList posts={posts} />
				</aside>
			</div>
		</>
	);
}
