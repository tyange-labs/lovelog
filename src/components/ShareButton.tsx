import { createSignal, onCleanup, Show } from 'solid-js';
import Check from 'lucide-solid/icons/check';
import Share from 'lucide-solid/icons/share';
import { timelineLink } from '#/lib/deeplink';

const COPIED_MS = 1600;

// 휴대폰에선 공유 시트를 띄우고, 공유 시트가 없는 곳(대부분의 데스크톱)에선 링크를 복사한다.
export default function ShareButton(props: { postId: string }) {
	const [copied, setCopied] = createSignal(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	onCleanup(() => clearTimeout(timer));

	async function share() {
		const url = timelineLink(props.postId);

		if (navigator.share) {
			try {
				await navigator.share({ url });
			} catch {
				// 공유 시트를 닫은 경우(AbortError)도 여기로 온다 — 할 일이 없다.
			}
			return;
		}

		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			clearTimeout(timer);
			timer = setTimeout(() => setCopied(false), COPIED_MS);
		} catch {
			window.prompt('링크를 복사하세요', url);
		}
	}

	return (
		<button
			type="button"
			class="post-share"
			aria-label={copied() ? '링크를 복사했어요' : '링크 공유'}
			title={copied() ? '링크를 복사했어요' : '링크 공유'}
			onClick={share}
		>
			<Show when={copied()} fallback={<Share size={18} stroke-width={1.75} aria-hidden="true" />}>
				<Check size={18} stroke-width={2} aria-hidden="true" />
			</Show>
		</button>
	);
}
