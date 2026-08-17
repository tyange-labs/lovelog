import { useEffect, useRef, useState } from 'react';
import type { PostListItem } from '#/lib/cms';
import { getPost } from '#/lib/cms';
import { renderMarkdown } from '#/lib/markdown';
import LoadingHeart from './LoadingHeart';

// styles.css의 .log-panel 트랜지션 시간과 맞춘다.
// 접히는 행이 위에 있으면 목표 위치가 위로 밀리므로, 애니메이션이 끝난 뒤에 스크롤한다.
const COLLAPSE_DURATION_MS = 260;

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
	const rowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const timer = setTimeout(
			() => {
				rowRef.current?.scrollIntoView({
					block: 'start',
					behavior: prefersReducedMotion ? 'auto' : 'smooth'
				});
			},
			prefersReducedMotion ? 0 : COLLAPSE_DURATION_MS
		);

		return () => clearTimeout(timer);
	}, [isOpen]);

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
		<div ref={rowRef} className="rule-b">
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

			<div id={panelId} className={`log-panel ${isOpen ? 'is-open' : ''}`} inert={!isOpen}>
				<div className="log-panel-inner">
					<div className="px-4 pb-6 text-sm">
						{isLoading && <LoadingHeart />}

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
				</div>
			</div>
		</div>
	);
}
