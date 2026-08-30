import { describe, expect, it } from 'vitest';
import { COMPANIONS_MAX, NAME_MAX_LENGTH, VISIT_HOURS, validateRsvp, visitHourLabel } from './rsvp';

const valid = { name: '홍길동', companions: 0, visitHour: 13 };

describe('validateRsvp', () => {
	it('이름·동반 인원·방문 시간이 유효하면 null을 돌려준다', () => {
		expect(validateRsvp(valid)).toBeNull();
		expect(validateRsvp({ ...valid, companions: COMPANIONS_MAX })).toBeNull();
		for (const visitHour of VISIT_HOURS) {
			expect(validateRsvp({ ...valid, visitHour })).toBeNull();
		}
	});

	it('공백뿐인 이름을 거부한다', () => {
		expect(validateRsvp({ ...valid, name: '   ' })).not.toBeNull();
	});

	it('길이·범위를 벗어나면 거부한다', () => {
		expect(validateRsvp({ ...valid, name: 'ㄱ'.repeat(NAME_MAX_LENGTH + 1) })).not.toBeNull();
		expect(validateRsvp({ ...valid, companions: -1 })).not.toBeNull();
		expect(validateRsvp({ ...valid, companions: COMPANIONS_MAX + 1 })).not.toBeNull();
	});

	it('방문 시간을 고르지 않았거나 전시 시간 밖이면 거부한다', () => {
		expect(validateRsvp({ ...valid, visitHour: null })).not.toBeNull();
		expect(validateRsvp({ ...valid, visitHour: 11 })).not.toBeNull();
		expect(validateRsvp({ ...valid, visitHour: 17 })).not.toBeNull();
	});
});

describe('visitHourLabel', () => {
	it('24시간제 시작 시각을 12시간제 시간대 표기로 바꾼다', () => {
		expect(visitHourLabel(12)).toBe('12-1시');
		expect(visitHourLabel(13)).toBe('1-2시');
		expect(visitHourLabel(16)).toBe('4-5시');
	});
});
