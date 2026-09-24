import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import { A } from '@solidjs/router';
import ArrowUpRight from 'lucide-solid/icons/arrow-up-right';
import type { PostListItem } from '#/lib/cms';
import { loadBody, peekBody } from '#/lib/body';
import type { PostBody } from '#/lib/body';
import { formatTape, isShortForm, scrapPose, SHORT_FORM_LIMIT } from '#/lib/timeline';
import { markFromTimeline } from '#/lib/navigation';
import LoadingHeart from './LoadingHeart';

function MoreLink(props: { href: string }) {
	return (
		<A
			href={props.href}
			class="entry-more"
			aria-label="더보기"
			title="더보기"
			onClick={markFromTimeline}
		>
			<ArrowUpRight size={22} stroke-width={1.75} aria-hidden="true" />
		</A>
	);
}

export default function Entry(props: { post: PostListItem }) {
	const pose = () => scrapPose(props.post.post_id);
	const [body, setBody] = createSignal<PostBody | null>(peekBody(props.post.post_id) ?? null);
	const [error, setError] = createSignal<string | null>(null);
	const [isLoading, setIsLoading] = createSignal(false);
	const [isClamped, setIsClamped] = createSignal(false);
	let rootRef: HTMLElement | undefined;

	const postHref = () => `/p/${props.post.post_id}`;
	// 제목이 있는 글은 타임라인에서 제목만 보여준다 — 본문은 받아오지도 않는다.
	// 제목 없는 글(트위터식 짧은 글)만 본문 미리보기로 보여준다.
	const title = () => props.post.title.trim();
	const shortForm = () => isShortForm(props.post);
	// 짧은 글로 쓰였고 실제로도 200자 이내면 자르지 않고 전부 보여준다.
	// 기준일 이후 글이라도 길게 쓰였다면 레거시 글과 같은 방식(미리보기 + 더보기)으로 처리한다.
	const isCompact = () => {
		const loaded = body();
		return !title() && shortForm() && loaded !== null && loaded.length <= SHORT_FORM_LIMIT;
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
		<div class="scrap-row" style={{ '--shift': `${pose().shift}` }}>
			<article
				ref={(el) => {
					rootRef = el;
				}}
				class="scrap"
				classList={{ 'entry-compact': isCompact() }}
				style={{ '--tilt': `${pose().tilt}deg` }}
			>
				<A href={postHref()} class="scrap-tape" onClick={markFromTimeline}>
					{formatTape(props.post.published_at)}
				</A>

				<Show when={title()}>
					<div class="scrap-title-row">
						<A href={postHref()} class="scrap-title" onClick={markFromTimeline}>
							{title()}
						</A>
						<MoreLink href={postHref()} />
					</div>
				</Show>

				<Show when={!title()}>
					<Show when={isLoading()}>
						<LoadingHeart />
					</Show>

					<Show when={error()}>
						<div class="flex flex-col items-start gap-2 py-2">
							<p class="text-sm">{error()}</p>
							<button
								type="button"
								class="border border-[var(--color-scrap-ink)] px-3 py-1 text-sm"
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
								{/* 잘렸는지는 줄 수가 아니라 실제 넘침(scrollHeight)으로 판단해 "더보기"를 띄운다. */}
								<div
									ref={(el) => {
										const observer = new ResizeObserver(() => {
											setIsClamped(el.scrollHeight - el.clientHeight > 1);
										});
										observer.observe(el);
										onCleanup(() => observer.disconnect());
									}}
									class="entry-preview log-body"
									// eslint-disable-next-line solid/no-innerhtml
									innerHTML={loaded().html}
								/>

								<Show when={!isCompact() && isClamped()}>
									<div class="entry-more-row">
										<MoreLink href={postHref()} />
									</div>
								</Show>
							</>
						)}
					</Show>
				</Show>
			</article>
		</div>
	);
}
