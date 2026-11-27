import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import { A } from '@solidjs/router';
import type { PostListItem } from '#/lib/cms';
import { loadBody, peekBody } from '#/lib/body';
import type { PostBody } from '#/lib/body';
import { formatTape, isShortForm, postTime, SHORT_FORM_LIMIT } from '#/lib/timeline';
import { markFromTimeline } from '#/lib/navigation';
import { entryElementId } from '#/lib/deeplink';
import Loading from './Loading';

export default function Entry(props: { post: PostListItem; isTarget?: boolean }) {
	const [body, setBody] = createSignal<PostBody | null>(peekBody(props.post.post_id) ?? null);
	const [error, setError] = createSignal<string | null>(null);
	const [isLoading, setIsLoading] = createSignal(false);
	const [isClamped, setIsClamped] = createSignal(false);
	let rootRef: HTMLElement | undefined;

	const postHref = () => `/p/${props.post.post_id}`;
	const title = () => props.post.title.trim();
	// 기준일 이후 글이라도 길게 쓰였다면 자르고 글 페이지로 보낸다.
	const isCompact = () => {
		const loaded = body();
		return (
			!title() && isShortForm(props.post) && loaded !== null && loaded.length <= SHORT_FORM_LIMIT
		);
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
		if (!rootRef || title() || body()) {
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
			id={entryElementId(props.post.post_id)}
			class="entry"
			classList={{ 'entry-compact': isCompact(), 'is-target': props.isTarget }}
		>
			<p>
				<b>{formatTape(props.post.published_at, postTime(props.post))}</b>
			</p>

			<Show when={title()}>
				<p>
					<A href={postHref()} onClick={markFromTimeline}>
						{title()}
					</A>
				</p>
			</Show>

			<Show when={!title()}>
				<Show when={isLoading()}>
					<Loading />
				</Show>

				<Show when={error()}>
					<p>
						{error()}{' '}
						<button
							type="button"
							onClick={() => {
								setError(null);
								fetchBody();
							}}
						>
							다시 시도
						</button>
					</p>
				</Show>

				<Show when={body()}>
					{(loaded) => (
						// 잘렸는지는 줄 수가 아니라 실제 넘침(scrollHeight)으로 판단해 ↗를 붙인다.
						<A href={postHref()} class="entry-body-link" onClick={markFromTimeline}>
							<div
								ref={(el) => {
									const observer = new ResizeObserver(() => {
										setIsClamped(el.scrollHeight - el.clientHeight > 1);
									});
									observer.observe(el);
									onCleanup(() => observer.disconnect());
								}}
								class="entry-preview"
								// eslint-disable-next-line solid/no-innerhtml
								innerHTML={loaded().html}
							/>
							<Show when={!isCompact() && isClamped()}>
								<p aria-hidden="true">↗</p>
							</Show>
						</A>
					)}
				</Show>
			</Show>
		</article>
	);
}
