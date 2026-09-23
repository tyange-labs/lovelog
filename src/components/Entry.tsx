import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import { A } from '@solidjs/router';
import type { PostListItem } from '#/lib/cms';
import { loadBody } from '#/lib/body';
import type { PostBody } from '#/lib/body';
import { isShortForm, SHORT_FORM_LIMIT } from '#/lib/timeline';
import LoadingHeart from './LoadingHeart';

function formatMonthDay(value: string): string {
	const [, month, day] = value.split('-');
	return `${Number(month)}.${Number(day)}`;
}

export default function Entry(props: { post: PostListItem }) {
	const [body, setBody] = createSignal<PostBody | null>(null);
	const [error, setError] = createSignal<string | null>(null);
	const [isLoading, setIsLoading] = createSignal(false);
	const [isExpanded, setIsExpanded] = createSignal(false);
	let rootRef: HTMLElement | undefined;

	const shortForm = () => isShortForm(props.post);
	// 짧은 글로 쓰였고 실제로도 200자 이내면 접지 않고 전부 보여준다.
	// 기준일 이후 글이라도 길게 쓰였다면 레거시 글과 같은 방식(미리보기 + 펼치기)으로 처리한다.
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
		if (!rootRef) {
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
				<A href={`/p/${props.post.post_id}`} class="entry-date">
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
							<div
								class="entry-preview log-body"
								classList={{ 'is-expanded': isCompact() || isExpanded() }}
								// eslint-disable-next-line solid/no-innerhtml
								innerHTML={loaded().html}
							/>
							<Show when={!isCompact() && !isExpanded()}>
								<button type="button" class="entry-expand" onClick={() => setIsExpanded(true)}>
									펼쳐 읽기
								</button>
							</Show>

							<Show when={props.post.title.trim().length > 0}>
								<p class="entry-caption">— {props.post.title}</p>
							</Show>
						</>
					)}
				</Show>
			</div>
		</article>
	);
}
