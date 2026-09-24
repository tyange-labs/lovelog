import { describe, expect, it } from 'vitest';
import {
	buildTimelineRows,
	formatTape,
	gapDays,
	isShortForm,
	plainLength,
	scrapPose,
	weekdayOf
} from './timeline';
import type { PostListItem } from './cms';

function post(published_at: string, post_id = published_at): PostListItem {
	return { post_id, title: 't', description: '', published_at, tags: [], status: 'published' };
}

describe('gapDays', () => {
	it('두 글 사이의 일수를 센다', () => {
		expect(gapDays(post('2026-08-04'), post('2026-07-31'))).toBe(4);
	});

	it('월 길이가 다른 경계에서도 정확하다', () => {
		expect(gapDays(post('2026-03-01'), post('2026-02-28'))).toBe(1);
		expect(gapDays(post('2026-05-01'), post('2026-04-30'))).toBe(1);
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

describe('weekdayOf / formatTape', () => {
	it('요일을 한 글자 한글로 돌려준다', () => {
		expect(weekdayOf('2026-09-19')).toBe('토');
		expect(weekdayOf('2026-08-04')).toBe('화');
	});

	it('테이프 라벨은 0 없는 월.일과 요일이다', () => {
		expect(formatTape('2026-07-05')).toBe('7.5 일');
		expect(formatTape('2026-12-31')).toBe('12.31 목');
	});
});

describe('scrapPose', () => {
	it('같은 ID는 늘 같은 자세다', () => {
		expect(scrapPose('49e3a590-7bdb')).toEqual(scrapPose('49e3a590-7bdb'));
	});

	it('기울기는 ±1.4°, 어긋남은 0~1 안에 있다', () => {
		for (const id of ['a', 'b', '49e3a590-7bdb-4b86', '82f75615-e661-4fa4-a9be', '가나다']) {
			const { tilt, shift } = scrapPose(id);
			expect(tilt).toBeGreaterThanOrEqual(-1.4);
			expect(tilt).toBeLessThanOrEqual(1.4);
			expect(shift).toBeGreaterThanOrEqual(0);
			expect(shift).toBeLessThanOrEqual(1);
		}
	});
});
