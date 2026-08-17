import { describe, expect, it } from 'vitest';
import { COMPANIONS_MAX, NAME_MAX_LENGTH, validateRsvp } from './rsvp';

describe('validateRsvp', () => {
	it('이름과 동반 인원이 유효하면 null을 돌려준다', () => {
		expect(validateRsvp({ name: '홍길동', companions: 0 })).toBeNull();
		expect(validateRsvp({ name: '홍길동', companions: COMPANIONS_MAX })).toBeNull();
	});

	it('공백뿐인 이름을 거부한다', () => {
		expect(validateRsvp({ name: '   ', companions: 0 })).not.toBeNull();
	});

	it('길이·범위를 벗어나면 거부한다', () => {
		expect(validateRsvp({ name: 'ㄱ'.repeat(NAME_MAX_LENGTH + 1), companions: 0 })).not.toBeNull();
		expect(validateRsvp({ name: '홍길동', companions: -1 })).not.toBeNull();
		expect(validateRsvp({ name: '홍길동', companions: COMPANIONS_MAX + 1 })).not.toBeNull();
	});
});
