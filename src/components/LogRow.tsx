import { useEffect, useState } from 'react';
import type { PostListItem } from '#/lib/cms';
import { getPost } from '#/lib/cms';
import { renderMarkdown } from '#/lib/markdown';

// 펼칠 때마다 재호출하지 않도록 모듈 스코프에 캐시한다.
// 값이 Promise라 StrictMode의 이중 실행이나 빠른 연타에서도 요청이 한 번만 나간다.
const bodyCache = new Map<string, Promise<string>>();

function loadBody(postId: string): Promise<string> {
	const cached = bodyCache.get(postId);
	if (cached) {
		return cached;
	}

	const pending = getPost(postId)
		.then((post) => {
			if (!post) {
				throw new Error('글을 찾을 수 없어요.');
			}
			return renderMarkdown(post.content);
		})
		.catch((error: unknown) => {
			bodyCache.delete(postId);
			throw error;
		});

	bodyCache.set(postId, pending);
	return pending;
}

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return date.toISOString().slice(0, 10);
}

interface LogRowProps {
	post: PostListItem;
	isOpen: boolean;
	onToggle: () => void;
}

export default function LogRow({ post, isOpen, onToggle }: LogRowProps) {
	const [html, setHtml] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!isOpen || html) {
			return;
		}

		let cancelled = false;
		setIsLoading(true);
		setError(null);

		loadBody(post.post_id)
			.then((rendered) => {
				if (!cancelled) {
					setHtml(rendered);
				}
			})
			.catch((cause: unknown) => {
				if (!cancelled) {
					setError(cause instanceof Error ? cause.message : '글을 불러오지 못했어요.');
				}
			})
			.finally(() => {
				if (!cancelled) {
					setIsLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [isOpen, html, post.post_id]);

	const panelId = `log-panel-${post.post_id}`;

	return (
		<div className="rule-b">
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={isOpen}
				aria-controls={panelId}
				className="w-full px-4 py-3 text-left"
			>
				<span className="block text-lg font-bold text-[var(--color-accent)]">{post.title}</span>
				<span className="block text-xs tracking-wider text-[var(--color-accent)] opacity-80">
					{formatDate(post.published_at)}
				</span>
			</button>

			{isOpen && (
				<div id={panelId} className="px-4 pb-6 text-sm">
					{isLoading && <p className="opacity-70">불러오는 중…</p>}

					{error && (
						<div className="flex flex-col items-start gap-2">
							<p className="opacity-80">{error}</p>
							<button
								type="button"
								className="border border-[var(--color-accent)] px-3 py-1 text-[var(--color-accent)]"
								onClick={() => {
									setError(null);
									setHtml(null);
								}}
							>
								다시 시도
							</button>
						</div>
					)}

					{html && (
						<div
							className="log-body"
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					)}
				</div>
			)}
		</div>
	);
}
