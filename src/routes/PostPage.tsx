import { createEffect, createResource, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import ArrowLeft from 'lucide-solid/icons/arrow-left';
import { getPost } from '#/lib/cms';
import { renderMarkdown } from '#/lib/markdown';
import { didComeFromTimeline } from '#/lib/navigation';
import { weekdayOf } from '#/lib/timeline';
import LoadingHeart from '#/components/LoadingHeart';

// 이 이상 움직여야 방향이 바뀐 것으로 본다. 관성 스크롤의 잔떨림에 버튼이 깜빡이지 않게 한다.
const SCROLL_THRESHOLD_PX = 4;
const END_SLACK_PX = 24;

export default function PostPage() {
	const params = useParams<{ id: string }>();
	const [post] = createResource(() => params.id, getPost);
	const [showBack, setShowBack] = createSignal(false);

	// 돌아가기 버튼: 아래로 읽는 중엔 숨고, 조금 올리면 떠오르고, 글 끝에 닿으면 늘 보인다.
	let lastY = 0;
	function updateBack() {
		const y = window.scrollY;
		const atEnd = window.innerHeight + y >= document.documentElement.scrollHeight - END_SLACK_PX;
		if (atEnd || y < lastY - SCROLL_THRESHOLD_PX) {
			setShowBack(true);
		} else if (y > lastY + SCROLL_THRESHOLD_PX) {
			setShowBack(false);
		}
		lastY = y;
	}

	onMount(() => {
		lastY = window.scrollY;
		window.addEventListener('scroll', updateBack, { passive: true });
		window.addEventListener('resize', updateBack);
		onCleanup(() => {
			window.removeEventListener('scroll', updateBack);
			window.removeEventListener('resize', updateBack);
		});
	});

	// 본문이 짧아 스크롤이 없는 글은 도착하자마자 "글 끝"이다.
	createEffect(() => {
		post();
		queueMicrotask(updateBack);
	});

	return (
		<section class="px-4 pt-8 pb-16">
			<Show when={post.loading}>
				<LoadingHeart />
			</Show>

			<Show when={post.error}>
				<p class="py-10 text-sm opacity-80">
					{post.error instanceof Error ? post.error.message : '글을 불러오지 못했어요.'}
				</p>
			</Show>

			<Show when={!post.loading && !post.error && post() === null}>
				<p class="py-10 text-sm opacity-80">글을 찾을 수 없어요.</p>
			</Show>

			<Show when={post()}>
				{(loaded) => (
					<article class="scrap scrap-sheet">
						<p class="scrap-tape">
							{loaded().published_at.replaceAll('-', '.')} {weekdayOf(loaded().published_at)}
						</p>
						<div
							class="log-body"
							// eslint-disable-next-line solid/no-innerhtml
							innerHTML={renderMarkdown(loaded().content)}
						/>
						<Show when={loaded().title.trim().length > 0}>
							<p class="entry-caption">— {loaded().title}</p>
						</Show>
						<A
							href="/"
							class="post-back"
							classList={{ 'is-visible': showBack() }}
							aria-label="타임라인으로"
							title="타임라인으로"
							onClick={(event) => {
								if (didComeFromTimeline()) {
									event.preventDefault();
									window.history.back();
								}
							}}
						>
							<ArrowLeft size={20} stroke-width={2} aria-hidden="true" />
						</A>
					</article>
				)}
			</Show>
		</section>
	);
}
