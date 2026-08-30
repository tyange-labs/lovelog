import { CMS_API_BASE } from './cms';

export const NAME_MAX_LENGTH = 20;
export const COMPANIONS_MAX = 10;

// 전시는 12시에 열고 5시에 닫는다. 값은 한 시간짜리 시간대의 시작 시각이라
// 마지막 칸(4-5시)의 시작인 16이 마지막 항목이다. cms-api의 VISIT_HOUR_MIN/MAX와 같은 범위다.
export const VISIT_HOURS = [12, 13, 14, 15, 16];

export interface RsvpSubmission {
	name: string;
	companions: number;
	visitHour: number | null;
}

function toClock(hour24: number): number {
	return hour24 > 12 ? hour24 - 12 : hour24;
}

export function visitHourLabel(hour: number): string {
	return `${toClock(hour)}-${toClock(hour + 1)}시`;
}

export function validateRsvp(submission: RsvpSubmission): string | null {
	const name = submission.name.trim();

	if (name.length === 0) {
		return '이름을 입력해 주세요.';
	}
	if (name.length > NAME_MAX_LENGTH) {
		return `이름은 ${NAME_MAX_LENGTH}자까지 입력할 수 있어요.`;
	}
	if (!Number.isInteger(submission.companions)) {
		return '동반 인원을 숫자로 입력해 주세요.';
	}
	if (submission.companions < 0 || submission.companions > COMPANIONS_MAX) {
		return `동반 인원은 0명에서 ${COMPANIONS_MAX}명 사이로 입력해 주세요.`;
	}
	if (submission.visitHour === null) {
		return '방문 예정 시간을 골라 주세요.';
	}
	if (!VISIT_HOURS.includes(submission.visitHour)) {
		return '방문 예정 시간은 전시 시간 안에서 골라 주세요.';
	}

	return null;
}

// 서버가 Error::from_string으로 돌려주는 한국어 안내문을 그대로 살린다.
// 본문이 비어 있거나 안내문으로 보기 어려울 만큼 길면 상태 코드로 문구를 고른다.
async function readErrorMessage(response: Response): Promise<string> {
	if (response.status === 429) {
		return '요청이 잠시 몰렸어요. 조금 뒤에 다시 시도해 주세요.';
	}

	const body = await response.text().catch(() => '');
	const message = body.trim();

	if (message.length > 0 && message.length <= 200) {
		return message;
	}

	return `제출에 실패했어요 (${response.status}). 잠시 후 다시 시도해 주세요.`;
}

export async function submitRsvp(submission: RsvpSubmission): Promise<void> {
	const response = await fetch(`${CMS_API_BASE}/public/wedding/guests`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			name: submission.name.trim(),
			companions: submission.companions,
			visit_hour: submission.visitHour
		})
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response));
	}
}
