import { useEffect, useState } from 'react';
import type { PostListItem } from '#/lib/cms';
import { useDrawer } from '#/lib/drawer';
import LogRow from './LogRow';

// styles.css의 .drawer-panel 트랜지션 시간과 맞춘다.
// 슬라이드 아웃 도중에 접으면 목록 높이가 줄면서 스크롤이 흔들려 보이므로,
// 닫힘이 끝난 뒤에 접는다. 드로어는 언마운트되지 않으므로 스크롤 위치는 그대로 남는다.
const DRAWER_CLOSE_DURATION_MS = 240;

interface LogListProps {
	posts: PostListItem[];
}

export default function LogList({ posts }: LogListProps) {
	const [openId, setOpenId] = useState<string | null>(null);
	const { isOpen } = useDrawer();

	useEffect(() => {
		if (isOpen) {
			return;
		}

		const timer = setTimeout(() => setOpenId(null), DRAWER_CLOSE_DURATION_MS);
		return () => clearTimeout(timer);
	}, [isOpen]);

	return (
		<section id="log" className="scroll-mt-14">
			{posts.length === 0 && (
				<p className="rule-b px-4 py-6 text-sm opacity-70">아직 기록이 없어요.</p>
			)}

			{posts.map((post) => (
				<LogRow
					key={post.post_id}
					post={post}
					isOpen={openId === post.post_id}
					onToggle={() => setOpenId((prev) => (prev === post.post_id ? null : post.post_id))}
				/>
			))}
		</section>
	);
}
