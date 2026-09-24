export type ShareResult = 'shared' | 'copied' | 'cancelled';

export function postLink(postId: string): string {
	return `${window.location.origin}/p/${encodeURIComponent(postId)}`;
}

// 휴대폰에선 공유 시트를 띄우고, 공유 시트가 없는 곳(대부분의 데스크톱)에선 링크를 복사한다.
export async function shareUrl(url: string): Promise<ShareResult> {
	if (navigator.share) {
		try {
			await navigator.share({ url });
			return 'shared';
		} catch {
			return 'cancelled';
		}
	}

	await navigator.clipboard.writeText(url);
	return 'copied';
}

// 파일 공유를 받는 곳(iOS·Android)에선 공유 시트로 보내 사진에 저장하거나 바로 보낼 수 있게
// 하고, 못 받는 곳에선 내려받는다.
export async function sharePng(blob: Blob, fileName: string): Promise<void> {
	const file = new File([blob], fileName, { type: 'image/png' });

	if (navigator.canShare?.({ files: [file] })) {
		try {
			await navigator.share({ files: [file] });
		} catch {
			// 공유 시트를 닫은 경우(AbortError)도 여기로 온다 — 할 일이 없다.
		}
		return;
	}

	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
