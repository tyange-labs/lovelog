import { describe, expect, it } from 'vitest';
import {
	buildTimelineRows,
	formatTape,
	isShortForm,
	plainLength,
	postTime,
	scrapPose,
	weekdayOf
} from './timeline';
import type { PostListItem } from './cms';

function post(published_at: string, post_id = published_at): PostListItem {
	return { post_id, title: 't', description: '', published_at, tags: [], status: 'published' };
}

describe('buildTimelineRows', () => {
	it('월이 바뀔 때마다 month 행을 끼워 넣고, 간격 행은 넣지 않는다', () => {
		const posts = [post('2026-08-04', 'a'), post('2026-07-31', 'b'), post('2026-03-25', 'c')];
		expect(buildTimelineRows(posts)).toEqual([
			{ kind: 'month', month: '2026.08' },
			{ kind: 'entry', post: posts[0] },
			{ kind: 'month', month: '2026.07' },
			{ kind: 'entry', post: posts[1] },
			{ kind: 'month', month: '2026.03' },
			{ kind: 'entry', post: posts[2] }
		]);
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

	it('시각이 있으면 요일 뒤에 붙인다', () => {
		expect(formatTape('2026-09-24', '21:30')).toBe('9.24 목 21:30');
		expect(formatTape('2026-09-24', null)).toBe('9.24 목');
	});
});

describe('postTime', () => {
	function timed(published_at: string, created_at?: string): PostListItem {
		return { ...post(published_at), created_at };
	}

	it('짧은 글은 created_at(UTC)을 한국 시각으로 옮긴다', () => {
		expect(postTime(timed('2026-09-24', '2026-09-24T12:30:00Z'))).toBe('21:30');
	});

	it('UTC로는 전날이어도 한국 날짜가 같으면 시각을 준다', () => {
		expect(postTime(timed('2026-09-25', '2026-09-24T15:05:00Z'))).toBe('00:05');
	});

	it('한국 날짜가 published_at과 어긋나면 시각을 뺀다', () => {
		expect(postTime(timed('2026-09-24', '2026-09-24T15:05:00Z'))).toBeNull();
	});

	it('기준일 이전 글, created_at이 없거나 비었으면 시각이 없다', () => {
		expect(postTime(timed('2026-08-04', '2026-08-04T03:00:00Z'))).toBeNull();
		expect(postTime(timed('2026-09-24'))).toBeNull();
		expect(postTime(timed('2026-09-24', ''))).toBeNull();
	});
});

describe('scrapPose', () => {
	it('같은 ID는 늘 같은 자세다', () => {
		expect(scrapPose('49e3a590-7bdb')).toEqual(scrapPose('49e3a590-7bdb'));
	});

	it('끝 글자만 다른 시드도 자리가 한곳에 몰리지 않는다', () => {
		const months = ['2025.12', '2026.01', '2026.02', '2026.03', '2026.07', '2026.08'];
		const shifts = months.map((m) => scrapPose(`month:${m}`).shift);
		expect(Math.max(...shifts) - Math.min(...shifts)).toBeGreaterThan(0.5);
		expect(new Set(shifts).size).toBeGreaterThanOrEqual(5);
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
