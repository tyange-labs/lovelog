import { createResource, Show } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import { getPost } from '#/lib/cms';
import { renderMarkdown } from '#/lib/markdown';
import LoadingHeart from '#/components/LoadingHeart';

export default function PostPage() {
	const params = useParams<{ id: string }>();
	const [post] = createResource(() => params.id, getPost);

	return (
		<section class="px-4 py-8">
			<A href="/" class="post-back">
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
					<article class="post-article">
						<p class="entry-date">{loaded().published_at}</p>
						<h1 class="post-title">{loaded().title}</h1>
						<div
							class="log-body"
							// eslint-disable-next-line solid/no-innerhtml
							innerHTML={renderMarkdown(loaded().content)}
						/>
					</article>
				)}
			</Show>
		</section>
	);
}
