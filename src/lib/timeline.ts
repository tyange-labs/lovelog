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
	const [year, month, day] = dateString.split('-').map(Number);
	return Date.UTC(year, month - 1, day) / 86_400_000;
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

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function weekdayOf(publishedAt: string): string {
	return WEEKDAYS[new Date(toUtcDays(publishedAt) * 86_400_000).getUTCDay()];
}

// 테이프 라벨: "8.4 TUE"
export function formatTape(publishedAt: string): string {
	const [, month, day] = publishedAt.split('-').map(Number);
	return `${month}.${day} ${weekdayOf(publishedAt)}`;
}

export interface ScrapPose {
	tilt: number;
	shift: number;
}

// 종이 조각의 기울기(-1.4° ~ 1.4°)와 좌우 어긋남(0 ~ 1). 글 ID에서 뽑아 새로고침이나
// 새 글이 올라와도 같은 글은 늘 같은 자세로 붙어 있게 한다 — 목록 순번으로 정하면 새 글이
// 올라올 때마다 아래 글들이 전부 자세를 바꾼다.
export function scrapPose(seed: string): ScrapPose {
	let hash = 0;
	for (const ch of seed) {
		hash = (Math.imul(hash, 31) + ch.charCodeAt(0)) >>> 0;
	}
	return {
		tilt: ((hash % 29) - 14) / 10,
		shift: ((hash >>> 8) % 101) / 100
	};
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
