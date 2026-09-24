import { createResource, Show } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import { getPost } from '#/lib/cms';
import { renderMarkdown } from '#/lib/markdown';
import { didComeFromTimeline } from '#/lib/navigation';
import { weekdayOf } from '#/lib/timeline';
import LoadingHeart from '#/components/LoadingHeart';

export default function PostPage() {
	const params = useParams<{ id: string }>();
	const [post] = createResource(() => params.id, getPost);

	return (
		<section class="px-4 py-8">
			<A
				href="/"
				class="post-back"
				onClick={(event) => {
					if (didComeFromTimeline()) {
						event.preventDefault();
						window.history.back();
					}
				}}
			>
				← 타임라인으로
			</A>

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
					</article>
				)}
			</Show>
		</section>
	);
}
