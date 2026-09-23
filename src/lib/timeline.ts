import type { PostListItem } from './cms';

// 이 날짜(포함) 이후에 쓰인 글은 200자 규칙이 적용되는 짧은 글로 본다.
// 실제 글자 수 제한은 tyange-cms 쪽에서 강제하고, 여기서는 표시 방식만 가른다.
export const SHORT_FORM_SINCE = '2026-09-23';

export const SHORT_FORM_LIMIT = 200;

export type TimelineRow =
	| { kind: 'month'; month: string }
	| { kind: 'entry'; post: PostListItem }
	| { kind: 'gap'; days: number };

function toUtcDays(dateString: string): number {
	return Date.UTC(...(dateString.split('-').map(Number) as [number, number, number])) / 86_400_000;
}

function monthOf(publishedAt: string): string {
	return publishedAt.slice(0, 7).replace('-', '.');
}

export function isShortForm(post: PostListItem, since: string = SHORT_FORM_SINCE): boolean {
	return post.published_at >= since;
}

// 인접한 두 글(next가 최신, prev가 더 오래된 글) 사이의 일수 차이.
export function gapDays(next: PostListItem, prev: PostListItem): number {
	return toUtcDays(next.published_at) - toUtcDays(prev.published_at);
}

// posts는 published_at 내림차순(최신 먼저)으로 들어온다고 가정한다 — cms-api 응답 순서 그대로.
// 월이 바뀔 때 월 구분 행을, 글 사이 간격이 하루를 넘으면 간격 행을 끼워 넣는다.
export function buildTimelineRows(posts: PostListItem[]): TimelineRow[] {
	const rows: TimelineRow[] = [];

	posts.forEach((post, index) => {
		const prev = posts[index - 1];
		if (!prev || monthOf(prev.published_at) !== monthOf(post.published_at)) {
			rows.push({ kind: 'month', month: monthOf(post.published_at) });
		}

		rows.push({ kind: 'entry', post });

		const next = posts[index + 1];
		if (next) {
			const gap = gapDays(post, next);
			if (gap > 1) {
				rows.push({ kind: 'gap', days: gap });
			}
		}
	});

	return rows;
}

// 마크다운 문법을 걷어내고 순수 글자 수를 센다. 200자 근처인 짧은 글을 접을지 정하는 용도라
// 완벽한 파서가 아니어도 된다.
export function plainLength(markdown: string): number {
	const stripped = markdown
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/^>\s?/gm, '')
		.replace(/^[-*+]\s+/gm, '')
		.replace(/^\d+\.\s+/gm, '')
		.replace(/[`*_~]/g, '')
		.trim();

	return [...stripped].length;
}
