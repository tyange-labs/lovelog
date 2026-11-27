import { Show } from 'solid-js';
import type { Post } from '#/lib/cms';
import { renderMarkdown } from '#/lib/markdown';
import { formatTape, postTime } from '#/lib/timeline';

// 540px 폭으로 그리고 2배로 찍어 1080px 이미지가 된다. 높이는 4:5(675px)가 기본이고 글이 길면 늘어난다.
export default function ShareCard(props: { post: Post; ref?: (el: HTMLDivElement) => void }) {
	const title = () => props.post.title.trim();

	return (
		<div ref={props.ref} class="share-card">
			<div>
				<p>
					<b>{formatTape(props.post.published_at, postTime(props.post))}</b>
				</p>
				<div
					// eslint-disable-next-line solid/no-innerhtml
					innerHTML={renderMarkdown(props.post.content)}
				/>
				<Show when={title()}>
					<p>— {title()}</p>
				</Show>
			</div>
			<p class="share-card-sign">LOVELOG · lovelog.tyange.com</p>
		</div>
	);
}
