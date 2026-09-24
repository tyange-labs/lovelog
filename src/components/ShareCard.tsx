import { Show } from 'solid-js';
import type { Post } from '#/lib/cms';
import { renderMarkdown } from '#/lib/markdown';
import { formatTape, postTime, scrapPose } from '#/lib/timeline';

// PNG로 찍어 내는 공유 카드. 540px 폭으로 그리고 2배로 찍어 1080px 이미지가 된다.
// 높이는 4:5(675px)가 기본이고, 글이 길면 그만큼 길어진다.
export default function ShareCard(props: { post: Post; ref?: (el: HTMLDivElement) => void }) {
	const title = () => props.post.title.trim();

	return (
		<div ref={props.ref} class="share-card">
			<div class="share-card-desk">
				<article
					class="scrap share-card-scrap"
					style={{ '--tilt': `${scrapPose(props.post.post_id).tilt}deg` }}
				>
					<p class="scrap-tape">{formatTape(props.post.published_at, postTime(props.post))}</p>
					<div
						class="log-body"
						// eslint-disable-next-line solid/no-innerhtml
						innerHTML={renderMarkdown(props.post.content)}
					/>
					<Show when={title()}>
						<p class="entry-caption">— {title()}</p>
					</Show>
				</article>
			</div>
			<div class="share-card-sign">
				<span class="share-card-wordmark">THE LOVELOG</span>
				<span class="share-card-url">lovelog.tyange.com</span>
			</div>
		</div>
	);
}
