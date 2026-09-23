import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import { A } from '@solidjs/router';
import type { PostListItem } from '#/lib/cms';
import { loadBody, peekBody } from '#/lib/body';
import type { PostBody } from '#/lib/body';
import { isShortForm, SHORT_FORM_LIMIT } from '#/lib/timeline';
import { markFromTimeline } from '#/lib/navigation';
import LoadingHeart from './LoadingHeart';

function formatMonthDay(value: string): string {
	const [, month, day] = value.split('-');
	return `${Number(month)}.${Number(day)}`;
}

export default function Entry(props: { post: PostListItem }) {
	const [body, setBody] = createSignal<PostBody | null>(peekBody(props.post.post_id) ?? null);
	const [error, setError] = createSignal<string | null>(null);
	const [isLoading, setIsLoading] = createSignal(false);
	const [isClamped, setIsClamped] = createSignal(false);
	let rootRef: HTMLElement | undefined;

	const postHref = () => `/p/${props.post.post_id}`;
	const shortForm = () => isShortForm(props.post);
	// 짧은 글로 쓰였고 실제로도 200자 이내면 자르지 않고 전부 보여준다.
	// 기준일 이후 글이라도 길게 쓰였다면 레거시 글과 같은 방식(미리보기 + 더보기)으로 처리한다.
	const isCompact = () => {
		const loaded = body();
		return shortForm() && loaded !== null && loaded.length <= SHORT_FORM_LIMIT;
	};

	function fetchBody() {
		if (body() || isLoading()) {
			return;
		}

		setIsLoading(true);
		setError(null);

		loadBody(props.post.post_id)
			.then(setBody)
			.catch((cause: unknown) => {
				setError(cause instanceof Error ? cause.message : '글을 불러오지 못했어요.');
			})
			.finally(() => setIsLoading(false));
	}

	onMount(() => {
		if (!rootRef || body()) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					fetchBody();
					observer.disconnect();
				}
			},
			{ rootMargin: '600px 0px' }
		);

		observer.observe(rootRef);
		onCleanup(() => observer.disconnect());
	});

	return (
		<article
			ref={(el) => {
				rootRef = el;
			}}
			class="entry"
			classList={{ 'entry-compact': isCompact() }}
		>
			<div class="entry-rail" aria-hidden="true">
				<span class="entry-dot" />
			</div>

			<div class="entry-main">
				<A href={postHref()} class="entry-date" onClick={markFromTimeline}>
					{formatMonthDay(props.post.published_at)}
				</A>

				<Show when={isLoading()}>
					<LoadingHeart />
				</Show>

				<Show when={error()}>
					<div class="flex flex-col items-start gap-2 py-2">
						<p class="text-sm opacity-80">{error()}</p>
						<button
							type="button"
							class="border border-[var(--color-accent)] px-3 py-1 text-sm text-[var(--color-accent)]"
							onClick={() => {
								setError(null);
								fetchBody();
							}}
						>
							다시 시도
						</button>
					</div>
				</Show>

				<Show when={body()}>
					{(loaded) => (
						<>
							{/* 제목 캡션은 미리보기 안, 본문 맨 끝에 둔다 — 긴 글은 잘려서 글 페이지에서만 보인다.
							잘렸는지는 줄 수가 아니라 실제 넘침(scrollHeight)으로 판단해 "더보기"를 띄운다. */}
							<div
								ref={(el) => {
									const observer = new ResizeObserver(() => {
										setIsClamped(el.scrollHeight - el.clientHeight > 1);
									});
									observer.observe(el);
									onCleanup(() => observer.disconnect());
								}}
								class="entry-preview"
							>
								<div
									class="log-body"
									// eslint-disable-next-line solid/no-innerhtml
									innerHTML={loaded().html}
								/>
								<Show when={props.post.title.trim().length > 0}>
									<p class="entry-caption">— {props.post.title}</p>
								</Show>
							</div>

							<Show when={!isCompact() && isClamped()}>
								<A href={postHref()} class="entry-more" onClick={markFromTimeline}>
									더보기
								</A>
							</Show>
						</>
					)}
				</Show>
			</div>
		</article>
	);
}
