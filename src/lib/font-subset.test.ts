import { describe, expect, it } from 'vitest';
import { coversAny, parseUnicodeRange } from './font-subset';

describe('parseUnicodeRange', () => {
	it('단일 값, 구간, 와일드카드를 모두 읽는다', () => {
		expect(parseUnicodeRange('U+0020-007E, U+AC00, u+1F??')).toEqual([
			[0x20, 0x7e],
			[0xac00, 0xac00],
			[0x1f00, 0x1fff]
		]);
	});
});

describe('coversAny', () => {
	const ranges = parseUnicodeRange('U+AC00-AC0F, U+0041');

	it('글자 하나라도 구간에 들면 true', () => {
		expect(coversAny(ranges, [0x61, 0xac05])).toBe(true);
		expect(coversAny(ranges, [0x41])).toBe(true);
	});

	it('하나도 안 들면 false', () => {
		expect(coversAny(ranges, [0x61, 0xd7a3])).toBe(false);
	});
});
