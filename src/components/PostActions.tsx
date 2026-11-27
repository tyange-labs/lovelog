import { createSignal, onCleanup, Show } from 'solid-js';
import type { Post } from '#/lib/cms';
import { timelineLink } from '#/lib/deeplink';
import { postLink, shareUrl } from '#/lib/share';
import ImageSheet from './ImageSheet';

const COPIED_MS = 1600;

function LinkButton(props: { label: string; url: () => string }) {
	const [copied, setCopied] = createSignal(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	onCleanup(() => clearTimeout(timer));

	async function share() {
		try {
			if ((await shareUrl(props.url())) === 'copied') {
				setCopied(true);
				clearTimeout(timer);
				timer = setTimeout(() => setCopied(false), COPIED_MS);
			}
		} catch {
			window.prompt('링크를 복사하세요', props.url());
		}
	}

	return (
		<button type="button" onClick={share}>
			<span aria-live="polite">{copied() ? '복사했어요' : props.label}</span>
		</button>
	);
}

export default function PostActions(props: { post: Post }) {
	const [isImageOpen, setIsImageOpen] = createSignal(false);

	return (
		<>
			<p>
				<LinkButton label="글 링크" url={() => postLink(props.post.post_id)} />{' '}
				<LinkButton label="타임라인 위치" url={() => timelineLink(props.post.post_id)} />{' '}
				<button type="button" onClick={() => setIsImageOpen(true)}>
					이미지로
				</button>
			</p>

			<Show when={isImageOpen()}>
				<ImageSheet post={props.post} onClose={() => setIsImageOpen(false)} />
			</Show>
		</>
	);
}
