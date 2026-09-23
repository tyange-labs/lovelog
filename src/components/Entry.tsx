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

// styles.css의 .entry-preview 트랜지션 시간과 맞춘다. 접히는 도중에 스크롤을 옮기면
// 목표 위치가 계속 밀려 두 번 움직이는 것처럼 보이므로, 트랜지션이 끝난 뒤에 스크롤한다.
const COLLAPSE_DURATION_MS = 320;

export default function Entry(props: { post: PostListItem }) {
	const [body, setBody] = createSignal<PostBody | null>(null);
	const [error, setError] = createSignal<string | null>(null);
	const [isLoading, setIsLoading] = createSignal(false);
	const [isExpanded, setIsExpanded] = createSignal(false);
	let rootRef: HTMLElement | undefined;
	let previewRef: HTMLDivElement | undefined;

	const shortForm = () => isShortForm(props.post);
	// 짧은 글로 쓰였고 실제로도 200자 이내면 접지 않고 전부 보여준다.
	// 기준일 이후 글이라도 길게 쓰였다면 레거시 글과 같은 방식(미리보기 + 펼치기)으로 처리한다.
	const isCompact = () => {
		const loaded = body();
		return shortForm() && loaded !== null && loaded.length <= SHORT_FORM_LIMIT;
	};

	// max-height를 넉넉한 고정값(예: 6000px)으로 두면 접을 때 실제 높이까지 내려오는 동안
	// 화면에 변화가 없어 한 박자 늦게 반응한다. 실제 높이(scrollHeight)를 재서 그 값에서
	// 출발하고, 다 펼친 뒤에는 none으로 풀어 늦게 로드되는 이미지가 잘리지 않게 한다.
	function toggleExpanded() {
		const el = previewRef;
		if (!el) {
			return;
		}

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (isExpanded()) {
			el.style.maxHeight = `${el.scrollHeight}px`;
			el.getBoundingClientRect();
			el.style.maxHeight = '';
			setIsExpanded(false);
			setTimeout(
				() => {
					rootRef?.scrollIntoView({
						block: 'nearest',
						behavior: prefersReducedMotion ? 'auto' : 'smooth'
					});
				},
				prefersReducedMotion ? 0 : COLLAPSE_DURATION_MS
			);
			return;
		}

		el.style.maxHeight = prefersReducedMotion ? 'none' : `${el.scrollHeight}px`;
		setIsExpanded(true);
	}

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
								ref={(el) => {
									previewRef = el;
								}}
								onTransitionEnd={(event) => {
									if (event.propertyName === 'max-height' && isExpanded() && previewRef) {
										previewRef.style.maxHeight = 'none';
									}
								}}
								class="entry-preview log-body"
								classList={{ 'is-expanded': isCompact() || isExpanded() }}
								// eslint-disable-next-line solid/no-innerhtml
								innerHTML={loaded().html}
							/>
							<Show when={!isCompact()}>
								<button
									type="button"
									class="entry-expand"
									aria-expanded={isExpanded()}
									onClick={toggleExpanded}
								>
									{isExpanded() ? '접기' : '펼쳐 읽기'}
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
