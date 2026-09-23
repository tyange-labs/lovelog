// 글 페이지에 타임라인의 링크를 눌러 들어왔는지. 그렇다면 "타임라인으로"는 새 항목을
// 쌓지 않고 history.back()으로 돌아가, 라우터의 scrollRestoration이 보던 위치를 되살리게 한다.
let cameFromTimeline = false;

export function markFromTimeline(): void {
	cameFromTimeline = true;
}

export function didComeFromTimeline(): boolean {
	return cameFromTimeline;
}
