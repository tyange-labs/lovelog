import { createResource, Show } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import { getPost } from '#/lib/cms';
import { renderMarkdown } from '#/lib/markdown';
import { didComeFromTimeline } from '#/lib/navigation';
import { postTime, weekdayOf } from '#/lib/timeline';
import Loading from '#/components/Loading';
import PostActions from '#/components/PostActions';

export default function PostPage() {
	const params = useParams<{ id: string }>();
	const [post] = createResource(() => params.id, getPost);

	return (
		<>
			<p>
				<A
					href="/"
					onClick={(event) => {
						// 타임라인에서 들어왔으면 뒤로 가기로 돌아가 보던 자리를 되살린다.
						if (didComeFromTimeline()) {
							event.preventDefault();
							window.history.back();
						}
					}}
				>
					← 타임라인
				</A>
			</p>
			<hr />

			<Show when={post.loading}>
				<Loading />
			</Show>

			<Show when={post.error}>
				<p>{post.error instanceof Error ? post.error.message : '글을 불러오지 못했어요.'}</p>
			</Show>

			<Show when={!post.loading && !post.error && post() === null}>
				<p>글을 찾을 수 없어요.</p>
			</Show>

			<Show when={post()}>
				{(loaded) => (
					<>
						<article>
							<p>
								<b>
									{[
										loaded().published_at.replaceAll('-', '.'),
										weekdayOf(loaded().published_at),
										postTime(loaded())
									]
										.filter(Boolean)
										.join(' ')}
								</b>
							</p>
							<div
								// eslint-disable-next-line solid/no-innerhtml
								innerHTML={renderMarkdown(loaded().content)}
							/>
							<Show when={loaded().title.trim().length > 0}>
								<p>— {loaded().title}</p>
							</Show>
						</article>
						<hr />
						<PostActions post={loaded()} />
					</>
				)}
			</Show>
		</>
	);
}
