import { useState } from 'react';
import type { PostListItem } from '#/lib/cms';
import LogRow from './LogRow';

interface LogListProps {
	posts: PostListItem[];
}

export default function LogList({ posts }: LogListProps) {
	const [openId, setOpenId] = useState<string | null>(null);

	return (
		<section id="log" className="rule-t scroll-mt-14">
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
