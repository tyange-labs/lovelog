import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import X from 'lucide-solid/icons/x';
import Download from 'lucide-solid/icons/download';
import type { Post } from '#/lib/cms';
import { sharePng } from '#/lib/share';
import { embeddedFontCss, readAsDataUrl } from '#/lib/font-subset';
import ShareCard from './ShareCard';
import LoadingHeart from './LoadingHeart';

const EXPORT_SCALE = 2;
const IMAGE_FETCH_TIMEOUT_MS = 15_000;
const CARD_FONTS = ['Pretendard Variable', 'Noto Serif KR', 'Determination'];

function fileNameOf(post: Post): string {
	return `lovelog-${post.published_at}-${post.post_id.slice(0, 8)}.png`;
}

// 본문 사진을 data URL로 바꿔 끼운다. 글 페이지가 이미 CORS 없이 받아 캐시해 둔 사진을 찍는
// 라이브러리가 그대로 다시 쓰면 CORS 헤더 없는 캐시 응답에 막혀 빈 칸으로 찍히므로, 캐시를
// 거치지 않고 CORS로 직접 받는다. 못 받은 사진은 그대로 두고(빈 칸) 나머지는 찍는다.
async function inlineImages(card: HTMLElement): Promise<void> {
	await Promise.all(
		[...card.querySelectorAll('img')].map(async (img) => {
			if (img.src.startsWith('data:')) {
				return;
			}
			try {
				const res = await fetch(img.src, {
					mode: 'cors',
					cache: 'no-store',
					signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS)
				});
				if (!res.ok) {
					return;
				}
				img.src = await readAsDataUrl(await res.blob());
			} catch {
				// 이 사진만 빈 칸으로 남는다.
			}
		})
	);
}

async function capture(card: HTMLElement): Promise<Blob> {
	// 찍기 전에 웹폰트와 본문 사진이 다 들어와 있어야 한다 — 아니면 대체 글꼴·빈 칸으로 찍힌다.
	await document.fonts.ready;
	await inlineImages(card);

	const [{ domToBlob }, fontCss] = await Promise.all([
		import('modern-screenshot'),
		embeddedFontCss(card.textContent ?? '', CARD_FONTS)
	]);
	const blob = await domToBlob(card, {
		scale: EXPORT_SCALE,
		type: 'image/png',
		font: { cssText: fontCss }
	});
	if (!blob) {
		throw new Error('empty');
	}
	return blob;
}

export default function ImageSheet(props: { post: Post; onClose: () => void }) {
	const [blob, setBlob] = createSignal<Blob | null>(null);
	const [previewUrl, setPreviewUrl] = createSignal<string | null>(null);
	const [failed, setFailed] = createSignal(false);
	let dialog: HTMLDialogElement | undefined;
	let card: HTMLDivElement | undefined;

	function render() {
		if (!card) {
			return;
		}
		setFailed(false);
		capture(card)
			.then((result) => {
				setBlob(result);
				setPreviewUrl(URL.createObjectURL(result));
			})
			.catch(() => setFailed(true));
	}

	onMount(() => {
		dialog?.showModal();
		render();
	});

	onCleanup(() => {
		const url = previewUrl();
		if (url) {
			URL.revokeObjectURL(url);
		}
	});

	return (
		<dialog
			ref={(el) => {
				dialog = el;
			}}
			class="image-sheet"
			aria-label="이미지로 저장"
			onClose={() => props.onClose()}
			onClick={(event) => {
				if (event.target === dialog) {
					dialog.close();
				}
			}}
		>
			<div class="image-sheet-panel">
				<div class="image-sheet-head">
					<h2 class="image-sheet-title">이미지로 저장</h2>
					<button
						type="button"
						class="image-sheet-close"
						aria-label="닫기"
						onClick={() => dialog?.close()}
					>
						<X size={20} stroke-width={2} aria-hidden="true" />
					</button>
				</div>

				<div class="image-sheet-preview">
					<Show
						when={previewUrl()}
						fallback={
							<Show when={!failed()}>
								<LoadingHeart />
							</Show>
						}
					>
						{(url) => <img src={url()} alt="공유용 이미지 미리보기" />}
					</Show>
					<Show when={failed()}>
						<div class="flex flex-col items-center gap-3 text-sm">
							<p>이미지를 만들지 못했어요.</p>
							<button type="button" class="image-sheet-retry" onClick={render}>
								다시 시도
							</button>
						</div>
					</Show>
				</div>

				<button
					type="button"
					class="image-sheet-save"
					disabled={!blob()}
					onClick={() => {
						const result = blob();
						if (result) {
							void sharePng(result, fileNameOf(props.post));
						}
					}}
				>
					<Download size={18} stroke-width={2} aria-hidden="true" />
					저장·공유
				</button>
			</div>

			<div class="share-card-stage" aria-hidden="true">
				<ShareCard
					post={props.post}
					ref={(el) => {
						card = el;
					}}
				/>
			</div>
		</dialog>
	);
}
