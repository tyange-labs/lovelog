import { createSignal, onCleanup, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import Link from 'lucide-solid/icons/link';
import List from 'lucide-solid/icons/list';
import Image from 'lucide-solid/icons/image';
import type { Post } from '#/lib/cms';
import { timelineLink } from '#/lib/deeplink';
import { postLink, shareUrl } from '#/lib/share';
import ImageSheet from './ImageSheet';

const COPIED_MS = 1600;

function LinkButton(props: { label: string; icon: JSX.Element; url: () => string }) {
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
		<button type="button" class="post-action" onClick={share}>
			{props.icon}
			<span aria-live="polite">{copied() ? '복사했어요' : props.label}</span>
		</button>
	);
}

// 글 페이지 아래의 공유 버튼 셋: 글 링크(/p/:id), 타임라인 속 자리(/?at=), 이미지(PNG).
export default function PostActions(props: { post: Post }) {
	const [isImageOpen, setIsImageOpen] = createSignal(false);
	const icon = { size: 20, 'stroke-width': 2, 'aria-hidden': true } as const;

	return (
		<>
			<div class="post-actions">
				<LinkButton
					label="글 링크"
					icon={<Link {...icon} />}
					url={() => postLink(props.post.post_id)}
				/>
				<LinkButton
					label="타임라인 위치"
					icon={<List {...icon} />}
					url={() => timelineLink(props.post.post_id)}
				/>
				<button type="button" class="post-action" onClick={() => setIsImageOpen(true)}>
					<Image {...icon} />
					<span>이미지로</span>
				</button>
			</div>

			<Show when={isImageOpen()}>
				<ImageSheet post={props.post} onClose={() => setIsImageOpen(false)} />
			</Show>
		</>
	);
}
