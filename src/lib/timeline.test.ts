import { describe, expect, it } from 'vitest';
import { buildTimelineRows, gapDays, isShortForm, plainLength } from './timeline';
import type { PostListItem } from './cms';

function post(published_at: string, post_id = published_at): PostListItem {
	return { post_id, title: 't', description: '', published_at, tags: [], status: 'published' };
}

describe('gapDays', () => {
	it('두 글 사이의 일수를 센다', () => {
		expect(gapDays(post('2026-08-04'), post('2026-07-31'))).toBe(4);
	});

	it('같은 날이면 0이다', () => {
		expect(gapDays(post('2026-08-04', 'a'), post('2026-08-04', 'b'))).toBe(0);
	});
});

describe('buildTimelineRows', () => {
	it('월이 바뀔 때마다 month 행을 끼워 넣는다', () => {
		const posts = [post('2026-08-04', 'a'), post('2026-07-31', 'b'), post('2026-07-29', 'c')];
		const rows = buildTimelineRows(posts);

		expect(rows).toEqual([
			{ kind: 'month', month: '2026.08' },
			{ kind: 'entry', post: posts[0] },
			{ kind: 'gap', days: 4 },
			{ kind: 'month', month: '2026.07' },
			{ kind: 'entry', post: posts[1] },
			{ kind: 'gap', days: 2 },
			{ kind: 'entry', post: posts[2] }
		]);
	});

	it('간격이 하루 이하면 gap 행을 넣지 않는다', () => {
		const posts = [post('2026-08-05', 'a'), post('2026-08-04', 'b'), post('2026-08-04', 'c')];
		const rows = buildTimelineRows(posts);

		expect(rows.filter((r) => r.kind === 'gap')).toEqual([]);
	});

	it('빈 목록은 빈 배열을 돌려준다', () => {
		expect(buildTimelineRows([])).toEqual([]);
	});
});

describe('isShortForm', () => {
	it('기준일 이전 글은 레거시(긴 글)로 본다', () => {
		expect(isShortForm(post('2026-08-04'), '2026-09-23')).toBe(false);
	});

	it('기준일 당일과 이후는 짧은 글로 본다', () => {
		expect(isShortForm(post('2026-09-23'), '2026-09-23')).toBe(true);
		expect(isShortForm(post('2026-09-24'), '2026-09-23')).toBe(true);
	});
});

describe('plainLength', () => {
	it('마크다운 문법을 걷어내고 글자 수를 센다', () => {
		expect(plainLength('**해니**가 [여기](https://x.com)서 웃었다.')).toBe(
			[...'해니가 여기서 웃었다.'].length
		);
	});

	it('이미지만 있는 글은 0이다', () => {
		expect(plainLength('![](https://tyange.com/api/cms/images/a.png)')).toBe(0);
	});
});
