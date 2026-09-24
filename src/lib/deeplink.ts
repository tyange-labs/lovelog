export const TARGET_PARAM = 'at';

// 공유 링크는 글 페이지가 아니라 타임라인 속 그 글의 자리로 연다.
export function timelineLink(postId: string): string {
	return `${window.location.origin}/?${TARGET_PARAM}=${encodeURIComponent(postId)}`;
}

export function entryElementId(postId: string): string {
	return `post-${postId}`;
}

// 같은 방문에서 한 번만 이동한다. 링크로 들어와 글 페이지를 보고 뒤로 돌아왔을 때는
// 스크롤 복원이 제자리를 찾아야 하므로 다시 끌어오지 않는다.
let consumedTarget: string | null = null;

export function claimTarget(postId: string | undefined): string | null {
	if (!postId || consumedTarget === postId) {
		return null;
	}
	consumedTarget = postId;
	return postId;
}

const HOLD_MS = 4000;
const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

// 대상 글을 화면 가운데로 옮기고, 위쪽 글의 본문이 늦게 들어와 문서가 길어져도 한동안
// 그 자리를 붙잡는다. 사용자가 직접 스크롤을 시작하면 바로 놓는다.
// (scroll anchoring(overflow-anchor)은 iOS Safari가 지원하지 않아 직접 맞춘다.)
export function holdInView(target: HTMLElement): () => void {
	const center = () => target.scrollIntoView({ block: 'center' });
	center();

	const observer = new ResizeObserver(center);
	observer.observe(document.body);

	const release = () => {
		observer.disconnect();
		clearTimeout(timer);
		for (const type of USER_SCROLL_EVENTS) {
			window.removeEventListener(type, release);
		}
	};

	const timer = setTimeout(release, HOLD_MS);
	for (const type of USER_SCROLL_EVENTS) {
		window.addEventListener(type, release, { passive: true, once: true });
	}

	return release;
}
